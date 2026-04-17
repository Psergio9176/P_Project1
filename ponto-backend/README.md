# Ponto Backend

API REST do sistema de ponto eletrônico.

## Stack

- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication
- web-push (Push Notifications)
- pdfkit (Espelho de Ponto)
- exceljs (Exportação)

## Setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Build para produção |
| `npm start` | Production server |
| `npm test` | Executar testes |
| `npm run db:migrate` | Criar migrations |
| `npm run db:seed` | Popular dados iniciais |
| `npm run db:generate` | Gerar Prisma Client |

## Deploy (Render)

1. Conecte ao GitHub
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Adicione variáveis de ambiente:
   - DATABASE_URL
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - VAPID_PUBLIC_KEY
   - VAPID_PRIVATE_KEY
   - FRONTEND_URL
