"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}
const PIXEL_ID = "2160278594561604";
const CONSENT_KEY = "supercell_analytics_consent_v1";
type Consent = "accepted" | "rejected" | null;

function initializeMetaPixel() {
  if (window.fbq) return;
  const fbq = function (...args: unknown[]) {
    const current = fbq as typeof fbq & { callMethod?: (...values:unknown[])=>void; queue?:unknown[][] };
    if (current.callMethod) current.callMethod(...args);
    else current.queue?.push(args);
  } as ((...args: unknown[]) => void) & { queue?:unknown[][]; loaded?:boolean; version?:string; callMethod?: (...values:unknown[])=>void };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;
  fbq("init", PIXEL_ID);
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
}

export function MetaPixelTracker() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/auth");
  const [consent, setConsent] = useState<Consent>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "rejected") setConsent(saved);
  }, []);
  useEffect(() => {
    if (consent !== "accepted" || isAdminRoute) return;
    initializeMetaPixel();
    setLoaded(true);
  }, [consent,isAdminRoute]);
  useEffect(() => {
    if (!loaded || consent !== "accepted" || isAdminRoute) return;
    window.fbq?.("track", "PageView");
    if (pathname.startsWith("/produto/")) window.fbq?.("track", "ViewContent", { content_type: "product" });
  }, [pathname,loaded,consent,isAdminRoute]);
  useEffect(() => {
    if (!loaded || consent !== "accepted" || isAdminRoute) return;
    const onCatalog = () => window.fbq?.("trackCustom", "CatalogOpen");
    window.addEventListener("supercell:catalog-enter", onCatalog);
    return () => window.removeEventListener("supercell:catalog-enter", onCatalog);
  }, [loaded,consent,isAdminRoute]);
  function choose(value:Exclude<Consent,null>) {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }
  if (isAdminRoute) return null;
  return consent === null ? <div className="tracking-consent" role="dialog" aria-label="Preferências de privacidade">
    <div><strong>Privacidade na Super Cell</strong><p>Podemos usar cookies da Meta para medir visitas e entender quais produtos despertam interesse? Seu pedido e atendimento funcionam normalmente se você recusar.</p></div>
    <div className="tracking-consent-actions"><button type="button" onClick={()=>choose("rejected")}>Agora não</button><button type="button" onClick={()=>choose("accepted")}>Aceitar</button></div>
  </div> : null;
}
