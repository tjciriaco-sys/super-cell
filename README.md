# Plataforma Comercial Super Cell

Aplicação comercial mobile-first com catálogo público, venda assistida pelo WhatsApp e painel administrativo.

O padrão obrigatório para imagens de produtos e variantes está documentado em [docs/catalog-image-standard.md](docs/catalog-image-standard.md). Toda nova importação assistida deve passar por essa validação antes da publicação.

As decisões consolidadas de cadastro, publicação, variantes, seminovos, preço e interface estão em [docs/production-rules.md](docs/production-rules.md). Correções pontuais devem ser transformadas em regras reutilizáveis sempre que o comportamento puder se repetir.


## Continuidade do projeto

Ao retomar a Super Cell em um novo chat ou ambiente, ler primeiro:

- [SUPER-CELL-HANDOFF.md](SUPER-CELL-HANDOFF.md) — estado atual consolidado do produto, arquitetura, regras e fluxos.
- [docs/SESSION-CONTEXT-2026-10-08.md](docs/SESSION-CONTEXT-2026-10-08.md) — contexto detalhado das implementações e decisões recentes.
- [docs/DEVELOPMENT-WORKFLOW.md](docs/DEVELOPMENT-WORKFLOW.md) — método Plugin First e ciclo GitHub → Preview → produção.
- [docs/production-rules.md](docs/production-rules.md) — regras permanentes de produção.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
