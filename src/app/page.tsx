import { CreditCard, HandCoins, MapPinned, Truck } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { CatalogGrid } from "@/components/catalog-grid";
import { SiteFooter } from "@/components/site-footer";
import { CatalogCta } from "@/components/catalog-cta";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { getCatalog, getCommerceData } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [variants, commerce] = await Promise.all([getCatalog(), getCommerceData()]);
  const plans = commerce.acquirer.installment_plans ?? [];
  const primary = plans.find((plan) => plan.installments === commerce.acquirer.featured_primary) ?? plans[plans.length - 1];
  const instagramUrl = String(commerce.settings.instagram_url ?? "").trim();
  const whatsapp = String(commerce.settings.whatsapp_sales ?? "");
  const cnpj = String(commerce.settings.company_cnpj ?? "").trim();
  const location = String(commerce.settings.company_location ?? "Natal, Rio Grande do Norte").trim();

  return <main>
    <Header instagramUrl={instagramUrl || undefined}/>
    <section className="hero shell">
      <div className="hero-store-visual" aria-label="Operação Super Cell, do atendimento à entrega">
        <Image src="/supercell-store-hero.jpg" alt="Loja Super Cell com aparelhos, equipe de atendimento, separação de pedidos e entregadores" width={1536} height={523} priority sizes="(max-width: 700px) calc(100vw - 24px), 1180px"/>
      </div>
      <div className="hero-copy">
        <h1>Comprar seu celular pode ser tão simples quanto pedir uma pizza. <span className="headline-emoji" aria-hidden="true">😊</span></h1>
        <p>Escolha o aparelho, veja o preço e o parcelamento e finalize pelo WhatsApp.</p>
        <CatalogCta/>
      </div>
    </section>
    <section id="diferenciais" className="benefits shell" aria-label="Diferenciais da Super Cell">
      <div><HandCoins/><span><strong>Pagamento somente na entrega</strong><small>Você não paga nada antecipadamente</small></span></div>
      <div><Truck/><span><strong>Entrega grátis no mesmo dia</strong><small>Rotas reais com horários informados</small></span></div>
      <div><MapPinned/><span><strong>Mais de 50 cidades do RN</strong><small>Uma operação preparada para chegar até você</small></span></div>
      <div><CreditCard/><span><strong>Pix ou até 18x</strong><small>Preço e parcelas apresentados com clareza</small></span></div>
    </section>
    <Suspense fallback={<div className="catalog-loading shell" aria-live="polite">Carregando catálogo…</div>}>
      <CatalogGrid variants={variants} primaryInstallments={commerce.acquirer.featured_primary} primaryFactor={Number(primary?.factor ?? 1)} accessoryDeliveryFee={Number(commerce.settings.accessory_delivery_fee??15)} accessoryFreeThreshold={Number(commerce.settings.accessory_free_delivery_threshold??100)}/>
    </Suspense>
    <SiteFooter whatsapp={whatsapp} cnpj={cnpj || undefined} location={location}/>
    <FloatingWhatsApp number={whatsapp} message="Olá! Vim pelo catálogo da Super Cell e gostaria de tirar uma dúvida com um vendedor." />
  </main>;
}
