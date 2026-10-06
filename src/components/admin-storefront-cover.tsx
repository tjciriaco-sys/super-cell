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

function extractRearDevice(image: HTMLImageElement) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  // Padrão aprovado: a foto individual mostra a traseira à esquerda e a
  // tela à direita. Para a capa coletiva usamos a traseira e recompomos
  // discretamente a faixa que costuma ficar escondida pela tela.
  const cropWidth = Math.max(1, Math.round(width * 0.50));
  const source = document.createElement("canvas");
  source.width = cropWidth;
  source.height = height;
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("O navegador não conseguiu preparar uma das imagens.");

  sourceContext.drawImage(image, 0, 0, cropWidth, height, 0, 0, cropWidth, height);

  const pixels = sourceContext.getImageData(0, 0, cropWidth, height);
  const data = pixels.data;
  let minX = cropWidth;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < cropWidth; x += 1) {
      const offset = (y * cropWidth + x) * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const brightness = (red + green + blue) / 3;
      const neutral = max - min < 24;

      if (neutral && brightness >= 248) {
        data[offset + 3] = 0;
      } else if (neutral && brightness > 235) {
        data[offset + 3] = Math.min(data[offset + 3], Math.round(255 * ((248 - brightness) / 13)));
      }

      if (data[offset + 3] > 24) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  sourceContext.putImageData(pixels, 0, 0);

  if (maxX < minX || maxY < minY) {
    throw new Error("Não foi possível identificar a traseira em uma das imagens.");
  }

  const objectWidth = maxX - minX + 1;
  const objectHeight = maxY - minY + 1;
  const object = document.createElement("canvas");
  object.width = objectWidth;
  object.height = objectHeight;
  const objectContext = object.getContext("2d", { willReadFrequently: true });
  if (!objectContext) throw new Error("O navegador não conseguiu recortar uma das imagens.");

  objectContext.drawImage(source, minX, minY, objectWidth, objectHeight, 0, 0, objectWidth, objectHeight);

  const objectPixels = objectContext.getImageData(0, 0, objectWidth, objectHeight);
  const samples: Array<[number, number, number]> = [];
  const sampleX1 = Math.round(objectWidth * 0.25);
  const sampleX2 = Math.round(objectWidth * 0.75);
  const sampleY1 = Math.round(objectHeight * 0.55);
  const sampleY2 = Math.round(objectHeight * 0.85);

  for (let y = sampleY1; y < sampleY2; y += 6) {
    for (let x = sampleX1; x < sampleX2; x += 6) {
      const offset = (y * objectWidth + x) * 4;
      if (objectPixels.data[offset + 3] < 180) continue;
      samples.push([
        objectPixels.data[offset],
        objectPixels.data[offset + 1],
        objectPixels.data[offset + 2],
      ]);
    }
  }

  const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 128;
  };
  const bodyColor = samples.length
    ? {
        red: median(samples.map((item) => item[0])),
        green: median(samples.map((item) => item[1])),
        blue: median(samples.map((item) => item[2])),
      }
    : { red: 128, green: 128, blue: 128 };

  const reconstructedWidth = Math.round(objectWidth * 1.10);
  const output = document.createElement("canvas");
  output.width = reconstructedWidth;
  output.height = objectHeight;
  const outputContext = output.getContext("2d");
  if (!outputContext) throw new Error("O navegador não conseguiu recompor uma das imagens.");

  const radius = Math.max(16, Math.round(Math.min(reconstructedWidth, objectHeight) * 0.045));
  outputContext.save();
  outputContext.beginPath();
  outputContext.roundRect(0, 0, reconstructedWidth, objectHeight, radius);
  outputContext.clip();
  outputContext.fillStyle = `rgb(${bodyColor.red}, ${bodyColor.green}, ${bodyColor.blue})`;
  outputContext.fillRect(0, 0, reconstructedWidth, objectHeight);
  outputContext.drawImage(object, 0, 0, reconstructedWidth, objectHeight);
  outputContext.restore();

  return output;
}

function composeLayeredCover(images: HTMLImageElement[]) {
  const devices = images.map(extractRearDevice);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("O navegador não conseguiu iniciar o gerador de capa.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const count = devices.length;

  // Todos os aparelhos representam o mesmo modelo, portanto devem aparecer
  // com o MESMO tamanho aparente. A versão anterior reduzia discretamente
  // os aparelhos de trás e isso fazia a camada posterior parecer pequena.
  const targetHeight = count === 4 ? 880 : count === 3 ? 920 : 980;

  // Normalizamos também a largura. As imagens comerciais podem ter pequenos
  // recortes diferentes entre as cores; sem normalização uma cor pode ficar
  // visualmente muito mais estreita que outra.
  const naturalRatios = devices
    .map((device) => device.width / device.height)
    .filter((ratio) => Number.isFinite(ratio) && ratio > 0);
  const averageRatio = naturalRatios.reduce((sum, ratio) => sum + ratio, 0) / Math.max(1, naturalRatios.length);
  const targetRatio = Math.min(0.52, Math.max(0.40, averageRatio));
  const targetWidth = targetHeight * targetRatio;

  const rendered = devices.map((device) => ({
    device,
    width: targetWidth,
    height: targetHeight,
  }));

  // Regra visual aprovada: cada aparelho que fica atrás deve permanecer
  // aproximadamente 40% visível e 60% encoberto pelo aparelho à frente.
  // Como todos têm o mesmo tamanho, 40% de deslocamento equivale de fato
  // a cerca de 40% do aparelho posterior exposto.
  const stepRatio = 0.40;
  const step = targetWidth * stepRatio;
  const totalWidth = targetWidth + step * (count - 1);
  const left = (canvas.width - totalWidth) / 2;
  const bottom = 1090;

  // Perspectiva do observador: o aparelho principal fica à frente e à
  // direita. Os demais seguem para trás em direção à esquerda. Desenhamos
  // do fundo para a frente para produzir a sobreposição correta.
  for (let index = count - 1; index >= 0; index -= 1) {
    const item = rendered[index];
    const x = left + (count - 1 - index) * step;
    const y = bottom - item.height;
    context.drawImage(item.device, x, y, item.width, item.height);
  }

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
          ? "Montando automaticamente a capa sobreposta com as cores cadastradas…"
          : "Gerando nova capa sobreposta da vitrine…",
      });

      const selected = sources.slice(0, 4);
      const images = await Promise.all(selected.map((item) => loadImage(item.image)));
      const canvas = composeLayeredCover(images);
      const blob = await canvasBlob(canvas);
      const file = new File([blob], `capa-vitrine-sobreposta-${Date.now()}.webp`, { type: "image/webp" });
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

  return <div className="admin-image-upload" style={{ marginTop: 18 }}>
    <div>
      <strong>Capa da vitrine</strong>
      <small>
        {sources.length >= 2
          ? `${sources.length} cores com imagem detectadas. A capa usa as traseiras em sobreposição: aparelhos no mesmo tamanho, principal à direita e demais atrás seguindo para a esquerda, com cerca de 40% visível.`
          : "Com uma única cor, a própria imagem cadastrada é usada na vitrine."}
      </small>
      {sources.length >= 2 && <small style={{ marginTop: 5 }}>
        Padrão da foto individual: aparelho em apresentação comercial (traseira + tela), com fundo claro. Na capa coletiva o sistema recorta a traseira e sobrepõe as cores, preservando as câmeras.
      </small>}
    </div>

    {currentCover && !needsGeneration
      ? <div className="admin-image-preview"><Image src={currentCover} alt="Capa atual da vitrine" fill sizes="180px"/></div>
      : sources.length > 0 && <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
          {sources.slice(0, 4).map((item) => <div key={item.image} style={{ width: 68 }}>
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
