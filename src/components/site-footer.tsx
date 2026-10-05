import Link from "next/link";
import { Building2, MapPin, MessageCircle } from "lucide-react";

function whatsappUrl(number: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent("Olá! Vim pelo site da Super Cell e gostaria de falar com um vendedor.")}` : "#";
}

export function SiteFooter({ whatsapp, cnpj, location = "Natal, Rio Grande do Norte" }: { whatsapp: string; cnpj?: string; location?: string }) {
  return <footer className="site-footer"><div className="shell footer-grid">
    <div className="footer-intro"><div className="brand footer-brand"><strong>SUPER</strong> CELL</div><p>Tecnologia ao seu alcance, com compra assistida e pagamento somente na entrega.</p></div>
    <div className="footer-links"><strong>Super Cell</strong><Link href="/quem-somos"><Building2/> Quem somos</Link><span><MapPin/> {location}</span>{cnpj&&<small>CNPJ {cnpj}</small>}</div>
    <div className="footer-contact"><strong>Precisa de ajuda?</strong><a href={whatsappUrl(whatsapp)} target="_blank" rel="noreferrer"><MessageCircle/> Chamar no WhatsApp</a><small>Disponibilidade e condições são confirmadas antes da conclusão do pedido.</small></div>
  </div><div className="shell footer-bottom"><span>Super Cell · Uma marca do ecossistema X1 Commerce</span><Link href="/admin/login" className="manager-access">Acesso do gestor</Link></div></footer>;
}
