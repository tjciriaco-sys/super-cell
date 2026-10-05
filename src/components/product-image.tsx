import Image from "next/image";
import { Smartphone } from "lucide-react";

export function ProductImage({ src, alt, priority = false }: { src?: string; alt: string; priority?: boolean }) {
  return <div className="product-image-wrap">{src ? <Image src={src} alt={alt} fill sizes="(max-width: 640px) 44vw, (max-width: 1100px) 30vw, 260px" priority={priority} className="product-image" /> : <div className="image-placeholder" aria-label="Imagem em preparação"><Smartphone size={58} /><span>Imagem em preparação</span></div>}</div>;
}

