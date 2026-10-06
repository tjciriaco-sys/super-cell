"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw, TriangleAlert, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveGeneratedStorefrontCover, type StorefrontCoverActionState } from "@/app/admin/product-cover-actions";
import { storefrontCoverNeedsGeneration, storefrontCoverSources, type StorefrontCoverSource } from "@/lib/storefront-cover";

type Feedback = StorefrontCoverActionState | { status: "working"; message: string } | null;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível carregar uma das imagens das cores."));
    image.src = src;
  });
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("O navegador não conseguiu montar o arquivo da capa.")),
      "image/webp",
      0.95,
    );
  });
}

type BackgroundRemovalMode = "standard" | "soft" | "none";

function removeConnectedBackground(data: Uint8ClampedArray, width: number, height: number, mode: BackgroundRemovalMode) {
  if (mode === "none" || width < 2 || height < 2) return;

  const patch = Math.max(2, Math.min(16, Math.round(Math.min(width, height) * 0.025)));
  let red = 0, green = 0, blue = 0, samples = 0;
  const corners = [
    [0, 0], [Math.max(0, width - patch), 0],
    [0, Math.max(0, height - patch)], [Math.max(0, width - patch), Math.max(0, height - patch)],
  ];

  for (const [startX, startY] of corners) {
    for (let y = startY; y < Math.min(height, startY + patch); y += 1) {
      for (let x = startX; x < Math.min(width, startX + patch); x += 1) {
        const offset = (y * width + x) * 4;
        red += data[offset];
        green += data[offset + 1];
        blue += data[offset + 2];
        samples += 1;
      }
    }
  }

  if (!samples) return;
  const bgR = red / samples;
  const bgG = green / samples;
  const bgB = blue / samples;
  const threshold = mode === "soft" ? 58 : 72;
  const seedThreshold = threshold * 0.82;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 0;

  const distance = (index: number) => {
    const offset = index * 4;
    const dr = data[offset] - bgR;
    const dg = data[offset + 1] - bgG;
    const db = data[offset + 2] - bgB;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const enqueue = (index: number, limit: number) => {
    if (visited[index] || distance(index) > limit) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, seedThreshold);
    enqueue((height - 1) * width + x, seedThreshold);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width, seedThreshold);
    enqueue(y * width + width - 1, seedThreshold);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    data[index * 4 + 3] = 0;

    if (x > 0) enqueue(index - 1, threshold);
    if (x + 1 < width) enqueue(index + 1, threshold);
    if (y > 0) enqueue(index - width, threshold);
    if (y + 1 < height) enqueue(index + width, threshold);
  }
}

function extractObject(
  image: HTMLImageElement,
  cropStartRatio = 0,
  cropWidthRatio = 1,
  backgroundRemoval: BackgroundRemovalMode = "standard",
) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const sourceX = Math.max(0, Math.round(width * cropStartRatio));
  const sourceWidth = Math.max(1, Math.min(width - sourceX, Math.round(width * cropWidthRatio)));

  const source = document.createElement("canvas");
  source.width = sourceWidth;
  source.height = height;
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("O navegador não conseguiu preparar uma das imagens.");

  sourceContext.drawImage(image, sourceX, 0, sourceWidth, height, 0, 0, sourceWidth, height);

  const pixels = sourceContext.getImageData(0, 0, sourceWidth, height);\n  const data = pixels.data;\n  removeConnectedBackground(data, sourceWidth, height, backgroundRemoval);
  const columnCounts = new Uint32Array(sourceWidth);
  const rowCounts = new Uint32Array(height);

  let fallbackMinX = sourceWidth;
  let fallbackMinY = height;
  let fallbackMaxX = -1;
  let fallbackMaxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < sourceWidth; x += 1) {
      const offset = (y * sourceWidth + x) * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const brightness = (red + green + blue) / 3;
      const neutral = max - min < 26;

      const isBackground = data[offset + 3] <= 24 || (neutral && brightness > 248);

      if (!isBackground && data[offset + 3] > 24) {
        columnCounts[x] += 1;
        rowCounts[y] += 1;
        fallbackMinX = Math.min(fallbackMinX, x);
        fallbackMinY = Math.min(fallbackMinY, y);
        fallbackMaxX = Math.max(fallbackMaxX, x);
        fallbackMaxY = Math.max(fallbackMaxY, y);
      }
    }
  }

  sourceContext.putImageData(pixels, 0, 0);

  if (fallbackMaxX < fallbackMinX || fallbackMaxY < fallbackMinY) {
    throw new Error("Não foi possível identificar o aparelho em uma das imagens.");
  }

  // Ignora pequenos elementos soltos do material comercial (por exemplo,
  // selos ou logos nos cantos) e mantém o corpo principal do aparelho.
  const minColumnMass = Math.max(2, Math.round(height * 0.025));
  const minRowMass = Math.max(2, Math.round(sourceWidth * 0.025));

  let minX = columnCounts.findIndex((count) => count >= minColumnMass);
  let maxX = -1;
  for (let x = sourceWidth - 1; x >= 0; x -= 1) {
    if (columnCounts[x] >= minColumnMass) {
      maxX = x;
      break;
    }
  }

  let minY = rowCounts.findIndex((count) => count >= minRowMass);
  let maxY = -1;
  for (let y = height - 1; y >= 0; y -= 1) {
    if (rowCounts[y] >= minRowMass) {
      maxY = y;
      break;
    }
  }

  if (minX < 0 || maxX < minX) {
    minX = fallbackMinX;
    maxX = fallbackMaxX;
  }
  if (minY < 0 || maxY < minY) {
    minY = fallbackMinY;
    maxY = fallbackMaxY;
  }

  // No recorte suave da imagem principal mantemos uma margem real da arte
  // original. Depois da remoção conservadora essa margem fica transparente,
  // mas protege quinas e reflexos contra um corte geométrico excessivo.
  if (backgroundRemoval === "soft") {
    const sourceMargin = Math.max(8, Math.round(Math.max(sourceWidth, height) * 0.012));
    minX = Math.max(0, minX - sourceMargin);
    minY = Math.max(0, minY - sourceMargin);
    maxX = Math.min(sourceWidth - 1, maxX + sourceMargin);
    maxY = Math.min(height - 1, maxY + sourceMargin);
  }

  const objectWidth = maxX - minX + 1;
  const objectHeight = maxY - minY + 1;
  const padding = Math.max(4, Math.round(Math.max(objectWidth, objectHeight) * 0.008));

  const output = document.createElement("canvas");
  output.width = objectWidth + padding * 2;
  output.height = objectHeight + padding * 2;
  const outputContext = output.getContext("2d");
  if (!outputContext) throw new Error("O navegador não conseguiu recortar uma das imagens.");

  outputContext.drawImage(
    source,
    minX,
    minY,
    objectWidth,
    objectHeight,
    padding,
    padding,
    objectWidth,
    objectHeight,
  );

  return output;
}

function extractCommercialGroup(image: HTMLImageElement) {
  // A imagem principal da capa preserva a apresentação comercial completa:
  // traseira à esquerda + tela/frente à direita.
  return extractObject(image, 0, 1, "soft");
}

function extractRearDevice(image: HTMLImageElement) {
  // As cores adicionais entram apenas com a traseira. O padrão das imagens
  // individuais coloca a traseira no lado esquerdo da arte.
  return extractObject(image, 0, 0.54);
}

function visibleRatioForColorCount(count: number) {
  if (count <= 2) return 0.55;
  if (count === 3) return 0.40;
  return 0.30;
}

function composeLayeredCover(images: HTMLImageElement[]) {
  if (images.length < 2) throw new Error("São necessárias pelo menos duas cores para gerar a capa coletiva.");

  const mainGroup = extractCommercialGroup(images[0]);
  const rearDevices = images.slice(1).map(extractRearDevice);

  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("O navegador não conseguiu iniciar o gerador de capa.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const count = images.length;
  const visibleRatio = visibleRatioForColorCount(count);
  const mainRatio = mainGroup.width / mainGroup.height;
  const rearRatios = rearDevices.map((device) => device.width / device.height);

  // A largura total é composta pela imagem comercial completa na frente
  // mais somente a parcela visível de cada traseira ao fundo. Assim o
  // percentual aprovado corresponde à área realmente exposta na composição.
  const relativeWidth = mainRatio + rearRatios.reduce(
    (sum, ratio) => sum + ratio * visibleRatio,
    0,
  );

  const maxHeight = 980;
  const maxWidth = 1080;
  const targetHeight = Math.min(maxHeight, maxWidth / Math.max(relativeWidth, 0.1));
  const mainWidth = targetHeight * mainRatio;
  const rearWidths = rearRatios.map((ratio) => targetHeight * ratio);
  const exposedWidths = rearWidths.map((width) => width * visibleRatio);
  const totalWidth = mainWidth + exposedWidths.reduce((sum, width) => sum + width, 0);

  const left = (canvas.width - totalWidth) / 2;
  const bottom = 1090;
  const mainX = left + exposedWidths.reduce((sum, width) => sum + width, 0);
  const y = bottom - targetHeight;

  // Calcula cada traseira a partir da imagem principal. A cor cadastrada
  // por último fica mais ao fundo/à esquerda; a primeira cor adicional fica
  // imediatamente atrás da principal.
  const rearPositions: Array<{ device: HTMLCanvasElement; x: number; width: number }> = [];
  let cursorX = mainX;

  for (let index = 0; index < rearDevices.length; index += 1) {
    cursorX -= exposedWidths[index];
    rearPositions.push({
      device: rearDevices[index],
      x: cursorX,
      width: rearWidths[index],
    });
  }

  // Desenha do fundo para a frente.
  for (let index = rearPositions.length - 1; index >= 0; index -= 1) {
    const item = rearPositions[index];
    context.drawImage(item.device, item.x, y, item.width, targetHeight);
  }

  // A primeira cor é a camada principal e permanece inteira:
  // traseira + frente/tela, à direita e acima das demais.
  context.drawImage(mainGroup, mainX, y, mainWidth, targetHeight);

  return canvas;
}

export function AdminStorefrontCover({
  productId,
  currentCover,
  imageStrategy,
  variants,
}: {
  productId: string;
  currentCover?: string | null;
  imageStrategy?: string | null;
  variants: StorefrontCoverSource[];
}) {
  const router = useRouter();
  const sources = useMemo(() => storefrontCoverSources(variants), [variants]);
  const needsGeneration = useMemo(() => storefrontCoverNeedsGeneration(currentCover, variants), [currentCover, variants]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);
  const autoStarted = useRef(false);

  const generate = useCallback(async (automatic = false) => {
    if (sources.length < 2 || busy) return;

    try {
      setBusy(true);
      setFeedback({
        status: "working",
        message: automatic
          ? "Montando automaticamente a nova capa comercial com as cores cadastradas…"
          : "Gerando nova capa comercial da vitrine…",
      });

      const images = await Promise.all(sources.map((item) => loadImage(item.image)));
      const canvas = composeLayeredCover(images);
      const blob = await canvasBlob(canvas);
      const file = new File([blob], `capa-vitrine-comercial-${Date.now()}.webp`, { type: "image/webp" });
      const formData = new FormData();
      formData.set("product_id", productId);
      formData.set("cover_file", file);

      const result = await saveGeneratedStorefrontCover(formData);
      setFeedback(result);
      if (result.status === "success") router.refresh();
    } catch (error) {
      setFeedback({
        status: "error",
        message: error instanceof Error ? error.message : "Não foi possível gerar a capa da vitrine.",
      });
    } finally {
      setBusy(false);
    }
  }, [busy, productId, router, sources]);

  useEffect(() => {
    if (imageStrategy !== "variant" || !needsGeneration || sources.length < 2 || autoStarted.current) return;
    autoStarted.current = true;
    void generate(true);
  }, [generate, imageStrategy, needsGeneration, sources.length]);

  const exposure = Math.round(visibleRatioForColorCount(sources.length) * 100);

  return <div className="admin-image-upload" style={{ marginTop: 18 }}>
    <div>
      <strong>Capa da vitrine</strong>
      <small>
        {sources.length >= 2
          ? `${sources.length} cores com imagem detectadas. A primeira cor fica inteira na frente (traseira + tela), à direita. As demais entram só com a traseira, sobrepostas para a esquerda, com cerca de ${exposure}% de cada aparelho ao fundo visível.`
          : "Com uma única cor, a própria imagem cadastrada é usada na vitrine."}
      </small>
      {sources.length >= 2 && <small style={{ marginTop: 5 }}>
        Padrão da foto individual: apresentação comercial com traseira à esquerda, tela à direita e fundo claro.
      </small>}
    </div>

    {currentCover && !needsGeneration
      ? <div className="admin-image-preview"><Image src={currentCover} alt="Capa atual da vitrine" fill sizes="180px"/></div>
      : sources.length > 0 && <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
          {sources.map((item) => <div key={item.image} style={{ width: 68 }}>
            <div style={{ position: "relative", width: 68, height: 68, border: "1px solid #e3dfd5", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
              <Image src={item.image} alt={item.color} fill sizes="68px" style={{ objectFit: "contain" }}/>
            </div>
            <small style={{ display: "block", textAlign: "center", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.color}</small>
          </div>)}
        </div>}

    {sources.length >= 2 && <button
      type="button"
      className="admin-image-save"
      disabled={busy}
      onClick={() => void generate(false)}
      style={{ marginTop: 12 }}
    >
      {busy
        ? <><LoaderCircle className="spin"/> Gerando capa…</>
        : currentCover && !needsGeneration
          ? <><RefreshCw/> Atualizar capa da vitrine</>
          : <><WandSparkles/> Gerar capa da vitrine</>}
    </button>}

    {feedback && <div role="status" aria-live="polite" style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 7,
      marginTop: 10,
      fontSize: 13,
      lineHeight: 1.35,
      color: feedback.status === "success" ? "#277654" : feedback.status === "error" ? "#9a433c" : "#74684f",
    }}>
      {feedback.status === "success"
        ? <CheckCircle2 size={17}/>
        : feedback.status === "error"
          ? <TriangleAlert size={17}/>
          : <LoaderCircle size={17} className="spin"/>}
      <span>{feedback.message}</span>
    </div>}
  </div>;
}
