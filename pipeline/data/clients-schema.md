# Schema do config.json — Clientes

Cada cliente é armazenado em `squads/instagram-publisher/clients/{slug}/config.json`.

## Campos

```json
{
  "name": "string — Nome completo do cliente (ex: Restaurante Oliveira)",
  "slug": "string — Identificador URL-safe gerado do nome (ex: restaurante-oliveira)",
  "instagram_user_id": "string — Instagram Business Account ID numérico (ex: 17841400000000001)",
  "token": "string — Token de acesso long-lived completo da Meta Graph API",
  "token_preview": "string — Últimos 6 caracteres do token para exibição (ex: ...abc123)",
  "token_added_at": "string — Data em que o token foi adicionado/renovado (YYYY-MM-DD)",
  "created_at": "string — Data de cadastro do cliente (YYYY-MM-DD)"
}
```

## Exemplo

```json
{
  "name": "Restaurante Oliveira",
  "slug": "restaurante-oliveira",
  "instagram_user_id": "17841400000000001",
  "token": "EAABwzLixnjYBOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token_preview": "...xxxxxx",
  "token_added_at": "2025-05-18",
  "created_at": "2025-05-18"
}
```

## Regras de Geração de Slug

1. Converter para lowercase
2. Remover acentos e caracteres especiais (ç→c, ã→a, é→e, etc.)
3. Substituir espaços por hifens
4. Remover caracteres que não sejam letras, números ou hifens
5. Garantir unicidade adicionando sufixo numérico se necessário

Exemplos:
- "Clínica Saúde Total" → `clinica-saude-total`
- "Studio Fotografia Lima" → `studio-fotografia-lima`
- "Café & Bistrô" → `cafe-bistro`

## Estrutura de Diretórios

```
squads/instagram-publisher/
  clients/
    restaurante-oliveira/
      config.json
    clinica-saude-total/
      config.json
    studio-fotografia-lima/
      config.json
```

## Expiração do Token

Tokens de longa duração da Meta Graph API expiram em aproximadamente 60 dias.
- `token_added_at` + 55 dias → status ⚠️ (próximo de expirar)
- `token_added_at` + 60 dias → status ❌ (expirado)
- Dentro de 55 dias → status ✅ (válido)
