# Sistema de Ponto Eletrônico PWA

Sistema de marcação de ponto eletrônico com Progressive Web App (PWA), suporte offline e conformidade com a Portaria 671/MTE.

## Arquitetura

```
├── ponto-backend/      # API REST (Node.js + Express + Prisma)
└── ponto-frontend/     # PWA (React + TypeScript + Vite + Tailwind)
```

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| PWA | vite-plugin-pwa + Workbox |
| Armazenamento Offline | IndexedDB (via idb) |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Banco de Dados | PostgreSQL (Supabase) |
| Autenticação | JWT (bcrypt + jsonwebtoken) |
| Push Notifications | Web Push API + web-push |
| PDF | pdfkit |
| Excel/CSV | exceljs |
| Hospedagem Frontend | Vercel |
| Hospedagem Backend | Render |
| Tarefas Agendadas | node-cron |

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL (Supabase ou local)
- Conta no Vercel (frontend)
- Conta no Render (backend)

## Instalação Local

### Backend

```bash
cd ponto-backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais
npm run db:generate
npm run db:migrate
npm run db:seed  # Cria admin e usuário demo
npm run dev
```

### Frontend

```bash
cd ponto-frontend
npm install
cp .env.example .env
# Edite o .env com a URL da API
npm run dev
```

### Usuários Demo (após seed)

| Perfil | CPF | Senha |
|--------|-----|-------|
| Admin | 00000000000 | admin123 |
| Colaborador | 11111111111 | colab123 |

## Variáveis de Ambiente

### Backend (.env)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=sua-chave-secreta
JWT_REFRESH_SECRET=sua-chave-refresh
VAPID_PUBLIC_KEY=sua-chave-vapid-publica
VAPID_PRIVATE_KEY=sua-chave-vapid-privada
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
VITE_VAPID_PUBLIC_KEY=sua-chave-vapid-publica
```

## Deploy

### Backend (Render)

1. Crie conta em [render.com](https://render.com)
2. New → PostgreSQL (ou conecte ao Supabase)
3. New → Web Service
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Adicione as variáveis de ambiente

### Frontend (Vercel)

1. Crie conta em [vercel.com](https://vercel.com)
2. Importar repositório
3. Configure as variáveis de ambiente:
   - `VITE_API_URL`
   - `VITE_VAPID_PUBLIC_KEY`
4. Deploy automático na main

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Dados do usuário

### Marcações
- `POST /api/marcacoes` - Registrar marcação
- `POST /api/marcacoes/sync` - Sincronizar offline
- `GET /api/marcacoes/hoje` - Marcações do dia

### Ajustes
- `POST /api/ajustes` - Solicitar ajuste
- `GET /api/ajustes` - Listar (Admin)
- `PUT /api/ajustes/:id/avaliar` - Aprovar/rejeitar

### Espelho de Ponto
- `GET /api/espelho/:usuarioId/:mes` - Gerar PDF
- `POST /api/espelho/:usuarioId/:mes/assinar` - Assinar

### Exportação
- `GET /api/export/marcacoes?formato=xlsx|csv` - Exportar

## Funcionalidades

- [x] Marcação de ponto com geolocalização
- [x] Suporte offline (IndexedDB + sync)
- [x] Push notifications
- [x] Ajuste retroativo
- [x] Espelho de ponto (PDF)
- [x] Exportação (Excel/CSV)
- [x] Conformidade Portaria 671/MTE
- [x] Auditoria de operações
- [x] Rate limiting no login
- [x] Autenticação JWT

## Testes

```bash
# Backend
cd ponto-backend
npm test

# Frontend
cd ponto-frontend
npm test
```

## Licença

MIT
