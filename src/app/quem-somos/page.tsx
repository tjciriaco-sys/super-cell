import type { Metadata } from "next";
import { Building2, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { getCommerceData } from "@/lib/data";

export const metadata: Metadata = { title: "Quem somos", description: "Conheça a Super Cell e o ecossistema X1 Commerce." };
export const revalidate = 60;

export default async function AboutPage() {
  const { settings } = await getCommerceData();
  const whatsapp = String(settings.whatsapp_sales ?? "");
  const instagram = String(settings.instagram_url ?? "").trim();
  const cnpj = String(settings.company_cnpj ?? "").trim();
  const location = String(settings.company_location ?? "Natal, Rio Grande do Norte").trim();
  return <main><Header instagramUrl={instagram || undefined}/><section className="about-hero shell"><span className="eyebrow">Quem somos</span><h1>Confiança para comprar tecnologia pelo WhatsApp.</h1><p>A Super Cell é uma marca do ecossistema X1 Commerce, criado para tornar a compra de produtos mais simples, próxima e segura — do primeiro contato à entrega.</p></section><section className="about-story shell"><div><Building2/><h2>Uma operação que não começou hoje</h2><p>Nossa experiência reúne mais de 10 anos em tecnologia, comércio, atendimento e construção de operações digitais. A Super Cell nasce dessa trajetória: uma loja especializada em celulares e eletrônicos, com preço transparente, compra assistida e pagamento somente na entrega.</p><p>A X1 Commerce aplica esse mesmo modelo comercial em diferentes segmentos, por meio das marcas Super Cell, Super Cheiros, Super Ventiladores e Super Baterias. Cada operação tem sua especialidade, mas todas compartilham o mesmo compromisso com atendimento humano, clareza e conveniência.</p></div><aside><ShieldCheck/><h2>O que isso significa para você?</h2><ul><li><CheckCircle2/> Procedência e informações apresentadas com transparência.</li><li><CheckCircle2/> Atendimento real pelo WhatsApp antes da conclusão.</li><li><CheckCircle2/> Pagamento somente quando o pedido for entregue.</li><li><CheckCircle2/> Uma empresa localizada em {location}.</li></ul><a href={`https://wa.me/${whatsapp.replace(/\D/g,"")}?text=${encodeURIComponent("Olá! Conheci a Super Cell pelo site e gostaria de falar com a equipe.")}`} target="_blank" rel="noreferrer"><MessageCircle/> Falar com a Super Cell</a></aside></section><SiteFooter whatsapp={whatsapp} cnpj={cnpj || undefined} location={location}/></main>;
}
