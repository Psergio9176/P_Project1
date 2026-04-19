
# Step-by-Step — Desenvolvimento do PWA de Marcação de Ponto

> **Documento para equipe de desenvolvimento**
> Baseado no prompt refinado e aprovado pelo Product Owner.

---

## ✅ Status do Projeto: COMPLETO

**Última atualização:** 16/04/2026

### Funcionalidades Implementadas

| Funcionalidade | Status |
|----------------|--------|
| Marcação de ponto com geolocalização | ✅ |
| Suporte offline (IndexedDB + Sync) | ✅ |
| Push notifications | ✅ |
| Ajuste retroativo | ✅ |
| Espelho de ponto (PDF) | ✅ |
| Exportação (Excel/CSV) | ✅ |
| Conformidade Portaria 671/MTE | ✅ |
| Testes unitários | ✅ |
| Deploy configs | ✅ |

---

## Índice

1. [Fase 1 — Setup do Projeto e Infraestrutura](#fase-1--setup-do-projeto-e-infraestrutura)
2. [Fase 2 — Backend: Modelagem de Dados e API REST](#fase-2--backend-modelagem-de-dados-e-api-rest)
3. [Fase 3 — Autenticação e Autorização](#fase-3--autenticação-e-autorização)
4. [Fase 4 — Frontend: PWA Base e Layout](#fase-4--frontend-pwa-base-e-layout)
5. [Fase 5 — Módulo de Marcação de Ponto](#fase-5--módulo-de-marcação-de-ponto)
6. [Fase 6 — Geolocalização](#fase-6--geolocalização)
7. [Fase 7 — Suporte Offline (Service Worker + IndexedDB)](#fase-7--suporte-offline-service-worker--indexeddb)
8. [Fase 8 — Push Notifications](#fase-8--push-notifications)
9. [Fase 9 — Ajuste Retroativo de Marcações](#fase-9--ajuste-retroativo-de-marcações)
10. [Fase 10 — Exportação (Excel/CSV)](#fase-10--exportação-excelcsv)
11. [Fase 11 — Espelho de Ponto (PDF + Assinatura Eletrônica)](#fase-11--espelho-de-ponto-pdf--assinatura-eletrônica)
12. [Fase 12 — Conformidade Portaria 671/MTE](#fase-12--conformidade-portaria-671mte)
13. [Fase 13 — Testes](#fase-13--testes)
14. [Fase 14 — Deploy e Publicação](#fase-14--deploy-e-publicação)
15. [Fase 15 — Entrega e Documentação](#fase-15--entrega-e-documentação)

---

## Fase 1 — Setup do Projeto e Infraestrutura

**Objetivo**: Criar a estrutura de repositórios, configurar ferramentas e provisionar serviços.

### 1.1 Repositório
- [x] Criar repositório monorepo (ou dois repos separados: `ponto-frontend` e `ponto-backend`).
- [x] Configurar `.gitignore`, `.editorconfig`, `prettier`, `eslint` para ambos os projetos.
- [x] Definir branching strategy (sugestão: `main`, `develop`, `feature/*`, `release/*`).

### 1.2 Backend — Inicialização
- [x] Iniciar projeto Node.js + TypeScript:
  ```bash
  mkdir ponto-backend && cd ponto-backend
  npm init -y
  npm install express cors helmet dotenv bcryptjs jsonwebtoken
  npm install -D typescript ts-node @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken nodemon
  npx tsc --init
  ```
- [x] Configurar `tsconfig.json` (target ES2020, moduleResolution node, outDir `./dist`).
- [x] Criar estrutura de pastas:
  ```
  src/
  ├── config/         # Configurações (DB, env vars)
  ├── controllers/    # Controllers das rotas
  ├── middlewares/     # Auth, error handler, rate limiter
  ├── models/         # Modelos / entidades
  ├── routes/         # Definição de rotas
  ├── services/       # Lógica de negócio
  ├── utils/          # Helpers (geração de PDF, Excel, etc.)
  ├── jobs/           # Tarefas agendadas (cron)
  └── app.ts          # Entry point
  ```
- [x] Configurar scripts no `package.json`: `dev`, `build`, `start`.

### 1.3 Frontend — Inicialização
- [x] Criar projeto React + TypeScript com Vite:
  ```bash
  npm create vite@latest ponto-frontend -- --template react-ts
  cd ponto-frontend
  npm install
  ```
- [x] Instalar dependências base:
  ```bash
  npm install react-router-dom axios dayjs
  npm install -D vite-plugin-pwa workbox-window
  ```
- [x] Escolher biblioteca de UI (sugestão: **Tailwind CSS** por ser leve e customizável):
  ```bash
  npm install -D tailwindcss @tailwindcss/vite
  ```
- [x] Criar estrutura de pastas:
  ```
  src/
  ├── components/     # Componentes reutilizáveis
  ├── pages/          # Páginas (Login, Home, Histórico, Admin)
  ├── hooks/          # Custom hooks (useAuth, useGeolocation, useOnline)
  ├── services/       # Chamadas à API (axios instances)
  ├── contexts/       # React Contexts (Auth, Theme)
  ├── utils/          # Helpers
  ├── types/          # Interfaces TypeScript
  ├── sw/             # Service Worker customizações
  └── App.tsx
  ```

### 1.4 Banco de Dados — Supabase
- [x] Criar conta no [Supabase](https://supabase.com) (free tier).
- [x] Criar projeto (região: South America — São Paulo, se disponível).
- [x] Anotar credenciais: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL` (connection string PostgreSQL).
- [x] Instalar client no backend:
  ```bash
  npm install @supabase/supabase-js
  # OU usar Prisma como ORM:
  npm install prisma @prisma/client
  npx prisma init
  ```

### 1.5 Variáveis de Ambiente
- [x] Criar `.env.example` em ambos os projetos com todas as variáveis necessárias:
  ```env
  # Backend
  DATABASE_URL=
  JWT_SECRET=
  JWT_REFRESH_SECRET=
  VAPID_PUBLIC_KEY=
  VAPID_PRIVATE_KEY=
  PORT=3001

  # Frontend
  VITE_API_URL=
  VITE_VAPID_PUBLIC_KEY=
  ```

---

## Fase 2 — Backend: Modelagem de Dados e API REST

**Objetivo**: Definir o schema do banco e criar as rotas CRUD base.

### 2.1 Modelagem de Dados (Prisma Schema ou SQL)

```prisma
model Empresa {
  id        String   @id @default(uuid())
  nome      String
  unidades  Unidade[]
  createdAt DateTime @default(now())
}

model Unidade {
  id        String   @id @default(uuid())
  nome      String
  endereco  String?
  latitude  Float?
  longitude Float?
  empresaId String
  empresa   Empresa  @relation(fields: [empresaId], references: [id])
  usuarios  Usuario[]
  createdAt DateTime @default(now())
}

model Usuario {
  id            String       @id @default(uuid())
  cpf           String       @unique
  nome          String
  email         String?
  senhaHash     String
  perfil        Perfil       @default(COLABORADOR)
  tipoJornada   TipoJornada  @default(PADRAO)
  unidadeId     String
  unidade       Unidade      @relation(fields: [unidadeId], references: [id])
  ativo         Boolean      @default(true)
  marcacoes     Marcacao[]
  ajustes       AjusteMarcacao[]
  assinaturas   AssinaturaPonto[]
  subscriptions PushSubscription[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum Perfil {
  ADMIN
  COLABORADOR
}

enum TipoJornada {
  PADRAO    // 4 marcações
  REDUZIDA  // 2 marcações
}

enum TipoMarcacao {
  ENTRADA
  SAIDA_ALMOCO
  RETORNO_ALMOCO
  SAIDA
}

model Marcacao {
  id            String        @id @default(uuid())
  usuarioId     String
  usuario       Usuario       @relation(fields: [usuarioId], references: [id])
  tipo          TipoMarcacao
  dataHoraUtc   DateTime
  dataHoraLocal DateTime
  latitude      Float
  longitude     Float
  acuraciaGps   Float?
  userAgent     String?
  offline       Boolean       @default(false)  // marcação feita offline?
  sincronizado  Boolean       @default(true)
  createdAt     DateTime      @default(now())

  @@index([usuarioId, dataHoraUtc])
}

model AjusteMarcacao {
  id              String        @id @default(uuid())
  usuarioId       String
  usuario         Usuario       @relation(fields: [usuarioId], references: [id])
  tipo            TipoMarcacao
  dataHoraOriginal DateTime?    // null se foi marcação esquecida
  dataHoraAjuste  DateTime
  justificativa   String
  aprovado        Boolean?      // null = pendente, true = aprovado, false = rejeitado
  createdAt       DateTime      @default(now())
}

model AssinaturaPonto {
  id            String   @id @default(uuid())
  usuarioId     String
  usuario       Usuario  @relation(fields: [usuarioId], references: [id])
  mesReferencia String   // formato: "2026-04"
  hashEspelho   String   // SHA-256 do PDF gerado
  assinadoEm    DateTime
  createdAt     DateTime @default(now())

  @@unique([usuarioId, mesReferencia])
}

model PushSubscription {
  id          String   @id @default(uuid())
  usuarioId   String
  usuario     Usuario  @relation(fields: [usuarioId], references: [id])
  endpoint    String
  keys        Json     // { p256dh, auth }
  createdAt   DateTime @default(now())
}
```

### 2.2 Tarefas
- [x] Criar/ajustar o Prisma schema (ou migrations SQL manuais).
- [x] Executar `npx prisma migrate dev --name init`.
- [x] Criar seed script para popular dados iniciais (empresa, unidade, admin).
- [x] Criar os seguintes endpoints REST:

#### Rotas da API

| Método | Rota | Descrição | Perfil |
|--------|------|-----------|--------|
| `POST` | `/api/auth/login` | Login (CPF + senha) → JWT | Público |
| `POST` | `/api/auth/refresh` | Renovar access token | Autenticado |
| `POST` | `/api/auth/logout` | Invalidar refresh token | Autenticado |
| `GET` | `/api/usuarios` | Listar colaboradores | Admin |
| `POST` | `/api/usuarios` | Cadastrar colaborador | Admin |
| `PUT` | `/api/usuarios/:id` | Editar colaborador | Admin |
| `DELETE` | `/api/usuarios/:id` | Desativar colaborador | Admin |
| `POST` | `/api/marcacoes` | Registrar marcação | Colaborador |
| `POST` | `/api/marcacoes/sync` | Sincronizar marcações offline (batch) | Colaborador |
| `GET` | `/api/marcacoes` | Listar marcações (filtros: data, usuário) | Ambos |
| `GET` | `/api/marcacoes/hoje` | Marcações do dia do colaborador logado | Colaborador |
| `POST` | `/api/ajustes` | Solicitar ajuste retroativo | Colaborador |
| `GET` | `/api/ajustes` | Listar ajustes | Admin |
| `PUT` | `/api/ajustes/:id/aprovar` | Aprovar/rejeitar ajuste | Admin |
| `GET` | `/api/export/marcacoes` | Exportar marcações (Excel/CSV) | Admin |
| `GET` | `/api/espelho/:usuarioId/:mes` | Gerar espelho de ponto (PDF) | Ambos |
| `POST` | `/api/espelho/:usuarioId/:mes/assinar` | Assinar espelho eletronicamente | Colaborador |
| `POST` | `/api/push/subscribe` | Registrar push subscription | Colaborador |
| `DELETE` | `/api/push/unsubscribe` | Remover push subscription | Colaborador |

---

## Fase 3 — Autenticação e Autorização

**Objetivo**: Implementar login seguro com JWT e controle de perfis.

### 3.1 Tarefas
- [x] Implementar rota `POST /api/auth/login`:
  - Recebe `{ cpf, senha }`.
  - Valida CPF (formato e existência).
  - Compara senha com hash (bcrypt).
  - Retorna `{ accessToken, refreshToken, usuario: { id, nome, perfil, tipoJornada } }`.
  - Access token: expiração de **15 minutos**.
  - Refresh token: expiração de **7 dias**, armazenado em httpOnly cookie ou banco.
- [x] Implementar middleware `authMiddleware`:
  - Valida JWT no header `Authorization: Bearer <token>`.
  - Popula `req.usuario` com dados decodificados.
- [x] Implementar middleware `perfilMiddleware(perfis: Perfil[])`:
  - Verifica se `req.usuario.perfil` está na lista permitida.
- [x] Implementar rate limiting no login:
  ```bash
  npm install express-rate-limit
  ```
  - Máximo 5 tentativas por CPF em 15 minutos.
- [x] Implementar rota de refresh token.
- [x] Implementar rota de logout (invalidar refresh token).

### 3.2 Segurança
- [x] Usar `helmet` para headers de segurança.
- [x] Usar `cors` configurado para aceitar apenas o domínio do frontend.
- [x] Nunca retornar a senha (nem o hash) em responses.
- [x] Logar tentativas de login falhadas para auditoria.

---

## Fase 4 — Frontend: PWA Base e Layout

**Objetivo**: Criar o shell da aplicação, rotas, layout mobile-first e configurar PWA.

### 4.1 Configuração do PWA
- [x] Configurar `vite-plugin-pwa` no `vite.config.ts`:
  ```typescript
  import { VitePWA } from 'vite-plugin-pwa';

  export default defineConfig({
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Ponto Eletrônico',
          short_name: 'Ponto',
          description: 'Marcação de ponto eletrônico',
          theme_color: '#1976d2',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\..*\/api\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } }
            }
          ]
        }
      })
    ]
  });
  ```
- [x] Criar ícones PWA (192x192 e 512x512).
- [x] Testar instalação "Add to Home Screen" no Chrome mobile.

### 4.2 Rotas do Frontend
- [x] Configurar React Router:

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/login` | `LoginPage` | Público |
| `/` | `HomePage` (tela de marcação) | Colaborador |
| `/historico` | `HistoricoPage` | Colaborador |
| `/ajuste` | `AjusteRetroativoPage` | Colaborador |
| `/espelho` | `EspelhoPontoPage` | Colaborador |
| `/admin/colaboradores` | `ColaboradoresPage` | Admin |
| `/admin/marcacoes` | `MarcacoesAdminPage` | Admin |
| `/admin/ajustes` | `AjustesAdminPage` | Admin |
| `/admin/export` | `ExportPage` | Admin |

### 4.3 Layout e Componentes Base
- [x] Criar `Layout` com:
  - Header com nome do app e info do usuário logado.
  - Bottom Navigation (mobile): Início | Histórico | Ajuste | Espelho.
  - Menu lateral (admin).
- [x] Criar componente `ProtectedRoute` (redireciona para login se não autenticado).
- [x] Criar componente `StatusOnline` (indicador visual online/offline).
- [x] Implementar Context de autenticação (`AuthContext`) com:
  - Estado do usuário logado.
  - Funções `login()`, `logout()`, `refreshToken()`.
  - Persistência do token no `localStorage` (access) e `httpOnly cookie` (refresh).

### 4.4 Tela de Login
- [x] Campos: CPF (com máscara `000.000.000-00`) e Senha.
- [x] Botão "Entrar".
- [x] Feedback de erro inline.
- [x] Responsivo e centralizado.

---

## Fase 5 — Módulo de Marcação de Ponto

**Objetivo**: Implementar a funcionalidade principal — bater ponto.

### 5.1 Backend
- [x] Implementar `POST /api/marcacoes`:
  - Recebe: `{ tipo, dataHoraUtc, dataHoraLocal, latitude, longitude, acuraciaGps, userAgent, offline }`.
  - Validações:
    - Usuário autenticado.
    - Tipo válido para a jornada do usuário (PADRAO: 4 tipos; REDUZIDA: apenas ENTRADA e SAIDA).
    - Não permitir tipo duplicado no mesmo dia.
    - Ordem lógica: ENTRADA → SAIDA_ALMOCO → RETORNO_ALMOCO → SAIDA.
  - Retorna a marcação criada + comprovante (dados para exibição).
- [x] Implementar `GET /api/marcacoes/hoje`:
  - Retorna marcações do dia para o usuário logado.
  - Inclui qual é a **próxima marcação esperada**.
- [x] Implementar `POST /api/marcacoes/sync` (batch para sincronização offline):
  - Recebe array de marcações.
  - Processa cada uma com as mesmas validações.
  - Retorna array de resultados (sucesso/erro por item).

### 5.2 Frontend — Tela Principal (HomePage)
- [x] Exibir **data e hora atual** (atualiza a cada segundo).
- [x] Exibir **status do dia**: lista das 4 marcações com ✓ ou pendente.
- [x] Botão grande central: **"Registrar [Tipo da Próxima Marcação]"**.
  - Ex: "Registrar Entrada", "Registrar Saída Almoço", etc.
  - Desabilitado se todas as marcações do dia foram feitas.
- [x] Ao clicar:
  1. Solicitar geolocalização (ver Fase 6).
  2. Enviar `POST /api/marcacoes`.
  3. Exibir **comprovante** (modal/toast): tipo, data/hora, localização.
  4. Atualizar status do dia.
- [x] Exibir indicador de **online/offline**.

---

## Fase 6 — Geolocalização

**Objetivo**: Capturar coordenadas GPS a cada marcação.

### 6.1 Frontend
- [x] Criar hook `useGeolocation()`:
  ```typescript
  const useGeolocation = () => {
    const getPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocalização não suportada'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
    };
    return { getPosition };
  };
  ```
- [x] Integrar no fluxo de marcação:
  1. Ao clicar "Registrar", chamar `getPosition()`.
  2. Se o usuário negar permissão → exibir mensagem explicativa e **bloquear** a marcação (geolocalização é obrigatória).
  3. Se obtiver posição → enviar `latitude`, `longitude`, `accuracy` junto com a marcação.
- [x] Exibir a localização capturada no comprovante (pode ser link para Google Maps).

### 6.2 Backend
- [x] Validar que `latitude` e `longitude` estão presentes no `POST /api/marcacoes`.
- [x] Armazenar `acuraciaGps` para análise de qualidade do sinal.

---

## Fase 7 — Suporte Offline (Service Worker + IndexedDB)

**Objetivo**: Permitir marcações sem internet, com sincronização automática posterior.

### 7.1 IndexedDB — Armazenamento Local
- [x] Instalar `idb` (wrapper Promise para IndexedDB):
  ```bash
  npm install idb
  ```
- [x] Criar database `ponto-offline-db` com stores:
  - `marcacoes-pendentes`: marcações feitas offline aguardando sync.
  - `marcacoes-cache`: cache das marcações do dia (para exibição offline).
  - `auth-cache`: dados do usuário logado (para funcionar sem rede).
- [x] Criar serviço `OfflineService`:
  ```typescript
  // Salvar marcação localmente
  async salvarMarcacaoOffline(marcacao: MarcacaoOffline): Promise<void>

  // Obter marcações pendentes de sincronização
  async obterPendentes(): Promise<MarcacaoOffline[]>

  // Remover marcações já sincronizadas
  async limparSincronizadas(ids: string[]): Promise<void>
  ```

### 7.2 Sincronização Automática
- [x] Criar hook `useOnlineStatus()` que escuta eventos `online`/`offline`.
- [x] Criar `SyncService`:
  - Ao detectar que o dispositivo voltou **online**:
    1. Buscar marcações pendentes no IndexedDB.
    2. Enviar via `POST /api/marcacoes/sync`.
    3. Para cada sucesso, remover do IndexedDB.
    4. Para cada erro, manter no IndexedDB e tentar novamente depois.
  - Usar **Background Sync API** (se disponível) como fallback:
    ```typescript
    // No Service Worker
    self.addEventListener('sync', (event) => {
      if (event.tag === 'sync-marcacoes') {
        event.waitUntil(sincronizarMarcacoes());
      }
    });
    ```
- [x] Exibir badge/indicador de "X marcações pendentes de sincronização".

### 7.3 Fluxo Completo Offline
- [x] Ao registrar marcação:
  1. Verificar conexão.
  2. **Online**: enviar direto para API. Se falhar, salvar no IndexedDB.
  3. **Offline**: salvar no IndexedDB, exibir comprovante local, agendar sync.
- [x] Manter cache do status do dia no IndexedDB para exibição offline.

---

## Fase 8 — Push Notifications

**Objetivo**: Enviar lembretes para o colaborador bater o ponto.

### 8.1 Configuração VAPID
- [x] Gerar chaves VAPID:
  ```bash
  npx web-push generate-vapid-keys
  ```
- [x] Armazenar `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` nas variáveis de ambiente do backend.

### 8.2 Backend
- [x] Instalar `web-push`:
  ```bash
  npm install web-push
  ```
- [x] Implementar `POST /api/push/subscribe`:
  - Recebe `{ endpoint, keys: { p256dh, auth } }`.
  - Salva na tabela `PushSubscription` vinculada ao usuário.
- [x] Implementar `DELETE /api/push/unsubscribe`.
- [x] Criar serviço `NotificationService`:
  ```typescript
  async enviarLembrete(usuarioId: string, mensagem: string): Promise<void>
  async enviarLembretesPendentes(): Promise<void> // para todos com marcações faltando
  ```
- [x] Criar **job agendado** (cron) para enviar lembretes:
  - Instalar `node-cron`:
    ```bash
    npm install node-cron
    ```
  - Configurar horários de lembrete (ex: 08:00, 12:00, 13:00, 17:00 — ou horários configuráveis por empresa).
  - No final do expediente (ex: 18:00): notificar colaboradores que não completaram todas as marcações.

### 8.3 Frontend
- [x] Solicitar permissão de notificações no primeiro login.
- [x] Registrar subscription via `POST /api/push/subscribe`.
- [x] No Service Worker, tratar evento `push`:
  ```typescript
  self.addEventListener('push', (event) => {
    const data = event.data?.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'lembrete-ponto',
      requireInteraction: true,
      actions: [{ action: 'registrar', title: 'Bater Ponto' }]
    });
  });
  ```
- [x] Tratar clique na notificação → abrir o app na tela de marcação.

---

## Fase 9 — Ajuste Retroativo de Marcações

**Objetivo**: Permitir que o colaborador registre marcações esquecidas com justificativa.

### 9.1 Backend
- [x] Implementar `POST /api/ajustes`:
  - Recebe: `{ tipo, dataHoraAjuste, justificativa }`.
  - Validação: justificativa obrigatória (mínimo 10 caracteres).
  - Status inicial: `aprovado = null` (pendente).
- [x] Implementar `GET /api/ajustes` (Admin — listar todos os pendentes).
- [x] Implementar `PUT /api/ajustes/:id/aprovar`:
  - Recebe: `{ aprovado: true | false }`.
  - Se aprovado: criar a marcação correspondente na tabela `Marcacao` com flag de ajuste.

### 9.2 Frontend
- [x] Tela `AjusteRetroativoPage`:
  - Seletor de data.
  - Exibir marcações existentes do dia selecionado.
  - Permitir adicionar marcação faltante: tipo, horário, justificativa.
  - Botão "Solicitar Ajuste".
- [x] Tela `AjustesAdminPage` (admin):
  - Lista de solicitações pendentes.
  - Detalhes: colaborador, data, tipo, horário solicitado, justificativa.
  - Botões: "Aprovar" / "Rejeitar".

---

## Fase 10 — Exportação (Excel/CSV)

**Objetivo**: Permitir que o admin exporte dados de marcações.

### 10.1 Backend
- [x] Instalar `exceljs`:
  ```bash
  npm install exceljs
  ```
- [x] Implementar `GET /api/export/marcacoes`:
  - Query params: `formato` (xlsx|csv), `dataInicio`, `dataFim`, `usuarioId?`, `unidadeId?`.
  - Gerar arquivo com colunas:
    - Nome | CPF | Data | Entrada | Saída Almoço | Retorno Almoço | Saída | Total Horas | Localização Entrada | ... | Observações.
  - Retornar como download (`Content-Disposition: attachment`).

### 10.2 Frontend
- [x] Tela `ExportPage` (admin):
  - Filtros: período (data início / fim), colaborador (select), unidade (select), formato (Excel/CSV).
  - Botão "Exportar" → faz download do arquivo.

---

## Fase 11 — Espelho de Ponto (PDF + Assinatura Eletrônica)

**Objetivo**: Gerar espelho de ponto mensal conforme Portaria 671/MTE.

### 11.1 Backend
- [x] Instalar `pdfkit` ou `@react-pdf/renderer` (se quiser gerar no front):
  ```bash
  npm install pdfkit
  ```
- [x] Implementar `GET /api/espelho/:usuarioId/:mes`:
  - Gerar PDF com:
    - **Cabeçalho**: nome da empresa, CNPJ, endereço.
    - **Dados do colaborador**: nome, CPF, cargo, unidade.
    - **Mês de referência**.
    - **Tabela diária**: Data | Entrada | Saída Almoço | Retorno Almoço | Saída | Total Horas | Observações.
    - **Resumo do mês**: total de horas trabalhadas, horas extras, atrasos (>10min tolerância), faltas, ajustes retroativos.
    - **Espaço para assinatura** eletrônica (ou indicação de que foi assinado digitalmente).
    - **Hash SHA-256** do documento (para integridade).
  - Retornar PDF como download.
- [x] Implementar `POST /api/espelho/:usuarioId/:mes/assinar`:
  - Colaborador confirma assinatura (aceite no app).
  - Gerar hash SHA-256 do PDF.
  - Salvar na tabela `AssinaturaPonto`.
  - Marcar espelho como assinado.
- [x] Criar **job agendado** (cron):
  - No 3.º dia útil de cada mês: gerar espelhos para todos os colaboradores ativos.
  - Enviar push notification: "Seu espelho de ponto de [mês] está disponível para assinatura".

### 11.2 Cálculo de Dias Úteis
- [x] Implementar função `calcularTerceiroDiaUtil(mes, ano)`:
  - Considerar feriados nacionais do Brasil.
  - Instalar `date-fns` para manipulação de datas:
    ```bash
    npm install date-fns
    ```
  - Manter tabela/JSON de feriados nacionais atualizável.

### 11.3 Frontend
- [x] Tela `EspelhoPontoPage` (colaborador):
  - Seletor de mês.
  - Botão "Visualizar Espelho" → abre PDF.
  - Botão "Assinar Espelho" → confirma assinatura (modal de confirmação).
  - Status: "Pendente de assinatura" / "Assinado em DD/MM/AAAA".

---

## Fase 12 — Conformidade Portaria 671/MTE

**Objetivo**: Garantir que o sistema atende aos requisitos legais.

### 12.1 Requisitos e Implementação

| Requisito Portaria 671 | Implementação |
|------------------------|---------------|
| Registro fiel e inalterável | Marcações originais nunca são editadas/deletadas. Ajustes ficam em tabela separada (`AjusteMarcacao`) com log de auditoria. |
| Comprovante ao colaborador | Após cada marcação, exibir comprovante com: data/hora, tipo, empresa. Possibilidade de salvar/imprimir. |
| Espelho de ponto mensal | Gerado automaticamente no 3.º dia útil. Disponível para download. |
| Assinatura do espelho | Assinatura eletrônica via aceite no app, com hash SHA-256 do documento. |
| Armazenamento 5 anos | Configurar retenção dos dados no banco. Criar policy de backup. |
| Disponibilidade dos dados | API de consulta sempre disponível ao colaborador. Export para fiscalização. |

### 12.2 Tarefas
- [x] Implementar tabela de auditoria (`AuditLog`) para registrar todas as operações sensíveis:
  ```prisma
  model AuditLog {
    id        String   @id @default(uuid())
    usuarioId String
    acao      String   // CREATE_MARCACAO, AJUSTE_SOLICITADO, ESPELHO_ASSINADO, etc.
    entidade  String   // Marcacao, AjusteMarcacao, etc.
    entidadeId String
    dados     Json     // snapshot do dado no momento da ação
    ip        String?
    userAgent String?
    createdAt DateTime @default(now())
  }
  ```
- [x] Implementar middleware de auditoria que registra automaticamente operações sensíveis.
- [x] Garantir que marcações não podem ser editadas ou deletadas via API (apenas soft-delete em caso extremo por admin, com log).
- [x] Implementar endpoint `GET /api/comprovante/:marcacaoId` para reimprimir comprovante.

---

## Fase 13 — Testes

**Objetivo**: Garantir qualidade e estabilidade do código.

### 13.1 Backend
- [x] Instalar dependências de teste:
  ```bash
  npm install -D jest ts-jest @types/jest supertest @types/supertest
  ```
- [x] Testes unitários para:
  - Validações de marcação (ordem, duplicação, jornada).
  - Cálculo de horas trabalhadas, atrasos, horas extras.
  - Cálculo do 3.º dia útil.
  - Geração do hash SHA-256 do espelho.
- [x] Testes de integração para:
  - Fluxo completo de login → marcação → consulta.
  - Sincronização batch de marcações offline.
  - Fluxo de ajuste retroativo (solicitar → aprovar → verificar marcação criada).
  - Geração e assinatura do espelho.
- [x] Testes de segurança:
  - Acesso não autenticado → 401.
  - Colaborador tentando acessar rota de admin → 403.
  - Rate limiting no login.

### 13.2 Frontend
- [x] Instalar dependências:
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- [x] Testes unitários para:
  - Hook `useGeolocation`.
  - Hook `useOnlineStatus`.
  - Serviço de offline (IndexedDB mock).
  - Componentes de formulário (login, ajuste).
- [x] Testes E2E (opcional, recomendado):
  ```bash
  npm install -D playwright @playwright/test
  ```
  - Fluxo: Login → Marcar ponto → Ver histórico → Solicitar ajuste.

---

## Fase 14 — Deploy e Publicação

**Objetivo**: Colocar o app em produção (hospedagem gratuita).

### 14.1 Frontend — Vercel
- [x] Criar conta no [Vercel](https://vercel.com) (grátis).
- [x] Conectar repositório do frontend.
- [x] Configurar variáveis de ambiente (`VITE_API_URL`, `VITE_VAPID_PUBLIC_KEY`).
- [x] Deploy automático a cada push na `main`.
- [x] Configurar domínio customizado (opcional).
- [x] Verificar que o Service Worker está sendo servido corretamente.
- [x] Testar instalação do PWA em dispositivo real.

### 14.2 Backend — Render
- [x] Criar conta no [Render](https://render.com) (grátis).
- [x] Criar Web Service:
  - Runtime: Node.
  - Build command: `npm install && npm run build`.
  - Start command: `npm start`.
- [x] Configurar variáveis de ambiente (todas do `.env`).
- [x] Atenção: o free tier do Render hiberna após 15 min de inatividade (cold start de ~30s). Alternativas:
  - Railway (free tier com melhor cold start).
  - Fly.io (free tier generoso).

### 14.3 Banco de Dados — Supabase
- [x] Já configurado na Fase 1.
- [x] Verificar conexão do backend Render → Supabase (liberar IP se necessário).
- [x] Configurar backups automáticos (Supabase faz backups diários no free tier).

### 14.4 Checklist de Produção
- [x] HTTPS ativo em frontend e backend.
- [x] CORS configurado apenas para domínio do frontend.
- [x] Variáveis sensíveis **não** estão no código.
- [x] Rate limiting ativo.
- [x] Logs de erro configurados.
- [x] Manifest.json e Service Worker funcionando.
- [x] Push notifications funcionando em dispositivo real.
- [x] Testar fluxo offline → online em dispositivo real.

---

## Fase 15 — Entrega e Documentação

**Objetivo**: Documentar tudo para manutenção futura e onboarding de novos devs.

### 15.1 Documentação
- [x] `README.md` em cada repositório com:
  - Descrição do projeto.
  - Pré-requisitos.
  - Como rodar localmente.
  - Variáveis de ambiente.
  - Estrutura de pastas.
  - Como fazer deploy.
- [x] Documentação da API:
  - Usar Swagger/OpenAPI:
    ```bash
    npm install swagger-jsdoc swagger-ui-express
    ```
  - Documentar todos os endpoints com exemplos de request/response.
- [x] Documentação de arquitetura (diagrama simples): Frontend ↔ API REST ↔ PostgreSQL.

### 15.2 Entrega
- [x] Demo com stakeholders.
- [x] Criar usuário admin inicial no sistema.
- [x] Testar fluxo completo com um colaborador real.
- [x] Coletar feedback e criar backlog para fase 2.

---

## Cronograma Sugerido

| Fase | Descrição | Estimativa |
|------|-----------|-----------|
| 1 | Setup do Projeto | 1-2 dias |
| 2 | Modelagem + API Base | 3-4 dias |
| 3 | Autenticação | 2 dias |
| 4 | Frontend PWA Base | 2-3 dias |
| 5 | Módulo de Marcação | 3-4 dias |
| 6 | Geolocalização | 1 dia |
| 7 | Suporte Offline | 3-4 dias |
| 8 | Push Notifications | 2 dias |
| 9 | Ajuste Retroativo | 2 dias |
| 10 | Exportação Excel/CSV | 1-2 dias |
| 11 | Espelho de Ponto (PDF) | 3-4 dias |
| 12 | Conformidade Portaria 671 | 2 dias |
| 13 | Testes | 3-5 dias |
| 14 | Deploy | 1-2 dias |
| 15 | Documentação + Entrega | 1-2 dias |
| **Total** | | **~30-40 dias úteis** |

> **Nota**: Estimativas para 1-2 desenvolvedores full-stack trabalhando em paralelo. Pode ser reduzido com mais devs ou uso de componentes prontos (ex: templates de UI, autenticação do Supabase, etc).

---

## Stack Final

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + TypeScript + Vite |
| PWA | vite-plugin-pwa + Workbox |
| UI | Tailwind CSS |
| Armazenamento Offline | IndexedDB (via `idb`) |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Banco de Dados | PostgreSQL (Supabase — free tier) |
| Autenticação | JWT (bcrypt + jsonwebtoken) |
| Push Notifications | Web Push API + web-push |
| PDF | pdfkit |
| Excel/CSV | exceljs |
| Hospedagem Frontend | Vercel (gratuito) |
| Hospedagem Backend | Render (gratuito) |
| Tarefas Agendadas | node-cron |
| Testes | Jest + Supertest (back) / Vitest + Testing Library (front) |
