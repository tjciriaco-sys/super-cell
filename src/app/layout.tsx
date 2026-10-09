import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MetaPixelTracker } from "@/components/meta-pixel-tracker";
const geist=Geist({variable:"--font-geist-sans",subsets:["latin"]}); const mono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"),title:{default:"Super Cell | Celulares e tecnologia",template:"%s | Super Cell"},description:"Compre seu celular com entrega grátis no mesmo dia, pagamento somente na entrega e atendimento em mais de 50 cidades do RN.",openGraph:{title:"Super Cell",description:"Seu celular com entrega grátis e pagamento somente na entrega.",type:"website",locale:"pt_BR"},icons:{icon:"/icon.svg",shortcut:"/icon.svg",apple:"/icon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body className={`${geist.variable} ${mono.variable}`}>{children}<MetaPixelTracker/></body></html>}
