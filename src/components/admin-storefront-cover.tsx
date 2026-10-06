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

function drawContained(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const scale = Math.min(width / naturalWidth, height / naturalHeight);
  const drawWidth = naturalWidth * scale;
  const drawHeight = naturalHeight * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("O navegador não conseguiu montar o arquivo da capa.")), "image/webp", 0.94);
  });
}

export function AdminStorefrontCover({
  productId,
  currentCover,
  variants,
}: {
  productId: string;
  currentCover?: string | null;
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
      setFeedback({ status: "working", message: automatic ? "Montando automaticamente a capa com as cores cadastradas…" : "Gerando nova capa da vitrine…" });

      const selected = sources.slice(0, 4);
      const images = await Promise.all(selected.map((item) => loadImage(item.image)));
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1200;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("O navegador não conseguiu iniciar o gerador de capa.");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const count = images.length;
      const horizontalPadding = count === 2 ? 70 : count === 3 ? 30 : 20;
      const gap = count === 2 ? 30 : count === 3 ? 10 : 4;
      const cellWidth = (1200 - horizontalPadding * 2 - gap * (count - 1)) / count;
      const y = count === 2 ? 120 : count === 3 ? 105 : 120;
      const cellHeight = count === 2 ? 960 : count === 3 ? 990 : 960;

      images.forEach((image, index) => {
        const x = horizontalPadding + index * (cellWidth + gap);
        drawContained(context, image, x, y, cellWidth, cellHeight);
      });

      const blob = await canvasBlob(canvas);
      const file = new File([blob], `capa-vitrine-${Date.now()}.webp`, { type: "image/webp" });
      const formData = new FormData();
      formData.set("product_id", productId);
      formData.set("cover_file", file);

      const result = await saveGeneratedStorefrontCover(formData);
      setFeedback(result);
      if (result.status === "success") router.refresh();
    } catch (error) {
      setFeedback({ status: "error", message: error instanceof Error ? error.message : "Não foi possível gerar a capa da vitrine." });
    } finally {
      setBusy(false);
    }
  }, [busy, productId, router, sources]);

  useEffect(() => {
    if (!needsGeneration || sources.length < 2 || autoStarted.current) return;
    autoStarted.current = true;
    void generate(true);
  }, [generate, needsGeneration, sources.length]);

  return <div className="admin-image-upload" style={{ marginTop: 18 }}>
    <div>
      <strong>Capa da vitrine</strong>
      <small>
        {sources.length >= 2
          ? `${sources.length} cores com imagem detectadas. O sistema reúne automaticamente até 4 cores em uma única capa.`
          : "Com uma única cor, a própria imagem cadastrada é usada na vitrine."}
      </small>
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
