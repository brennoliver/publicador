---
task: "Reconectar Cliente"
order: 3
input:
  - slug: Identificador do cliente a ser reconectado
  - new_token: Novo token de acesso long-lived gerado no Meta Graph API Explorer
output:
  - updated_config: config.json atualizado com novo token e nova data token_added_at
---

# Reconectar Cliente

Atualiza o token de acesso de um cliente existente, renovando o acesso à conta do Instagram via Meta Graph API.

## Process

1. Listar clientes disponíveis com status (✅/⚠️/❌) para o usuário escolher qual reconectar
2. Solicitar o novo token de acesso long-lived (gerado no Meta Graph API Explorer)
3. Validar que o novo token tem pelo menos 50 caracteres
4. Ler o `config.json` atual do cliente para preservar `name`, `slug`, `instagram_user_id`, `created_at`
5. Exibir resumo: nome do cliente, User ID preservado, token novo truncado (últimos 6 chars)
6. Aguardar confirmação do usuário
7. Atualizar apenas os campos `token`, `token_preview` e `token_added_at` no `config.json`

## Output Format

```json
{
  "name": "{preservado}",
  "slug": "{preservado}",
  "instagram_user_id": "{preservado}",
  "token": "{novo token completo}",
  "token_preview": "...{últimos 6 chars}",
  "token_added_at": "{data de hoje YYYY-MM-DD}",
  "created_at": "{preservado}"
}
```

## Output Example

Cliente: Clínica Saúde Total (token expirado desde 10/05/2025)
Novo token informado: `EAABwzLixnjYBOyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`

Mensagem exibida antes de confirmar:
```
🔄 Reconectar cliente
   Cliente:    Clínica Saúde Total
   User ID:    17841400000000042 (mantido)
   Novo token: ...yyyyyy
   
   Confirmar atualização? [s/n]
```

Após confirmação:
```
✅ Token atualizado com sucesso!
   Clínica Saúde Total está reconectada.
   Novo token válido até ~17/07/2025
```

## Quality Criteria

- [ ] Apenas campos de token e data são sobrescritos — name, slug, user_id e created_at são preservados
- [ ] Novo `token_added_at` é a data atual
- [ ] Token exibido apenas com últimos 6 caracteres na confirmação
- [ ] Operação confirmada pelo usuário antes de gravar

## Veto Conditions

Rejeitar e refazer se:
1. O `config.json` do cliente não existe (cliente não cadastrado)
2. O novo token tem menos de 50 caracteres
