# Ponto Frontend

Frontend PWA do sistema de ponto eletrônico.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- PWA (vite-plugin-pwa + Workbox)
- IndexedDB (idb)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Build para produção |
| `npm run preview` | Preview do build |
| `npm test` | Executar testes |

## PWA

O app funciona offline usando:
- Service Worker (Workbox)
- IndexedDB para marcações pendentes
- Background Sync para sincronização

## Deploy (Vercel)

1. Conecte ao GitHub
2. Framework: Vite
3. Build Command: `npm install --legacy-peer-deps && npm run build`
4. Output Directory: `dist`
5. Adicione variáveis de ambiente:
   - VITE_API_URL
   - VITE_VAPID_PUBLIC_KEY

## Estrutura

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # React Contexts
├── hooks/          # Custom hooks
├── pages/          # Páginas da aplicação
├── services/       # API e serviços
├── sw/             # Service Worker
├── types/          # Tipos TypeScript
└── utils/          # Helpers
```
