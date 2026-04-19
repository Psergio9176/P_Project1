# API Documentation - Ponto Eletrônico

Base URL: `https://your-backend.onrender.com/api`

## Autenticação

### Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "cpf": "00000000000",
  "senha": "admin123"
}

Response (200):
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "usuario": {
    "id": "uuid",
    "cpf": "00000000000",
    "nome": "Administrador",
    "perfil": "ADMIN",
    "tipoJornada": "PADRAO",
    "unidadeId": "uuid"
  }
}
```

### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGci..."
}

Response (200):
{
  "accessToken": "eyJhbGci..."
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <accessToken>
```

### Me
```
GET /auth/me
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "uuid",
  "cpf": "00000000000",
  "nome": "Administrador",
  "email": "admin@empresa.com",
  "perfil": "ADMIN",
  "tipoJornada": "PADRAO",
  "unidade": { ... },
  "empresa": { ... }
}
```

## Marcações

### Registrar Marcação
```
POST /marcacoes
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "tipo": "ENTRADA",
  "dataHoraUtc": "2026-04-15T11:00:00.000Z",
  "dataHoraLocal": "2026-04-15T08:00:00.000Z",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "acuraciaGps": 10.5,
  "userAgent": "Mozilla/5.0..."
}

Response (201):
{
  "id": "uuid",
  "tipo": "ENTRADA",
  "dataHoraLocal": "2026-04-15T08:00:00.000Z",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "comprovante": {
    "tipo": "ENTRADA",
    "dataHora": "2026-04-15T08:00:00.000Z",
    "location": "https://www.google.com/maps?q=-23.5505,-46.6333"
  }
}
```

### Marcações de Hoje
```
GET /marcacoes/hoje
Authorization: Bearer <accessToken>

Response (200):
{
  "data": "2026-04-15T00:00:00.000Z",
  "tipoJornada": "PADRAO",
  "marcacoes": [
    { "id": "uuid", "tipo": "ENTRADA", "dataHora": "...", "latitude": ..., "longitude": ... }
  ],
  "proximaMarcacao": "SAIDA_ALMOCO",
  "todasFeitas": false
}
```

### Sincronizar Offline
```
POST /marcacoes/sync
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "marcacoes": [
    { "tipo": "ENTRADA", "dataHoraUtc": "...", "dataHoraLocal": "...", ... }
  ]
}

Response (200):
{
  "resultados": [
    { "sucesso": true, "id": "uuid" },
    { "sucesso": false, "erro": "Já existe marcação para este dia" }
  ]
}
```

## Ajustes

### Solicitar Ajuste
```
POST /ajustes
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "tipo": "ENTRADA",
  "dataHoraAjuste": "2026-04-14T08:00:00.000Z",
  "justificativa": "Esqueci de registrar ontem"
}

Response (201):
{
  "id": "uuid",
  "tipo": "ENTRADA",
  "dataHoraAjuste": "2026-04-14T08:00:00.000Z",
  "justificativa": "Esqueci de registrar ontem",
  "aprovado": null,
  "createdAt": "2026-04-15T10:00:00.000Z"
}
```

### Listar Ajustes (Admin)
```
GET /ajustes?status=pendente
Authorization: Bearer <accessToken>
```

### Avaliar Ajuste (Admin)
```
PUT /ajustes/:id/avaliar
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{ "aprovado": true }
```

## Espelho de Ponto

### Gerar PDF
```
GET /espelho/:usuarioId/:mes
Authorization: Bearer <accessToken>
Response: PDF binary stream
```

### Assinar Espelho
```
POST /espelho/:usuarioId/:mes/assinar
Authorization: Bearer <accessToken>

Response (200):
{
  "message": "Espelho assinado com sucesso",
  "assinatura": {
    "mesReferencia": "2026-04",
    "assinadoEm": "2026-04-15T10:00:00.000Z",
    "hashEspelho": "sha256-hash..."
  }
}
```

## Exportação (Admin)

### Exportar Marcações
```
GET /export/marcacoes?formato=xlsx&dataInicio=2026-04-01&dataFim=2026-04-30
Authorization: Bearer <accessToken>
Response: Excel/CSV binary stream
```

## Push Notifications

### Obter VAPID Key
```
GET /push/vapid-public-key

Response (200):
{ "publicKey": "BEl62iUYgU..." }
```

### Subscribe
```
POST /push/subscribe
Authorization: Bearer <accessToken>
Content-Type: application/json

Request:
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BPS...",
    "auth": "tGhIt..."
  }
}
```

## Códigos de Erro

| Status | Descrição |
|--------|-----------|
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 429 | Rate limit excedido |
| 500 | Erro interno |

## Tipos de Marcação

```typescript
enum TipoMarcacao {
  ENTRADA = "ENTRADA",
  SAIDA_ALMOCO = "SAIDA_ALMOCO",
  RETORNO_ALMOCO = "RETORNO_ALMOCO",
  SAIDA = "SAIDA"
}

enum TipoJornada {
  PADRAO = "PADRAO",    // 4 marcações
  REDUZIDA = "REDUZIDA"  // 2 marcações
}

enum Perfil {
  ADMIN = "ADMIN",
  COLABORADOR = "COLABORADOR"
}
```
