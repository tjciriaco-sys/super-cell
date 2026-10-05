import Link from "next/link";
import { SearchX } from "lucide-react";
import { Header } from "@/components/header";
export default function NotFound(){return <main><Header compact/><div className="not-found shell"><SearchX/><h1>Produto não encontrado</h1><p>Este aparelho pode estar indisponível ou ter sido atualizado.</p><Link className="primary-button" href="/">Voltar ao catálogo</Link></div></main>}
