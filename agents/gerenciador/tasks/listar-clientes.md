---
task: "Listar Clientes"
order: 1
input:
  - clients_dir: Diretório squads/instagram-publisher/clients/ com subpastas de cada cliente
output:
  - client_list: Lista de clientes com nome, slug, status do token e data estimada de expiração
---

# Listar Clientes

Escaneia todos os clientes cadastrados e apresenta um painel com o status de cada conta conectada.

## Process

1. Ler todos os subdiretórios de `squads/instagram-publisher/clients/` usando Bash `ls`
2. Para cada subdiretório, ler o arquivo `config.json` e extrair: `name`, `instagram_user_id`, `token_added_at`
3. Calcular status do token: se `token_added_at` está há mais de 55 dias, marcar como ⚠️ próximo de expirar; mais de 60 dias, marcar como ❌ expirado
4. Exibir a lista formatada com ícones de status, nome e data estimada de expiração
5. Se nenhum cliente encontrado, exibir mensagem de boas-vindas e instrução para adicionar o primeiro cliente

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🗂️  Clientes Cadastrados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Restaurante Oliveira        (token válido até 15/07/2025)
⚠️  Clínica Saúde Total        (token expira em 3 dias — reconectar!)
❌ Studio Fotografia Lima      (token expirado — reconectar para publicar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 cliente(s) cadastrado(s)
```

## Output Example

Pasta `clients/` contém: `restaurante-oliveira/`, `clinica-saude-total/`, `studio-fotografia-lima/`

`restaurante-oliveira/config.json`:
```json
{
  "name": "Restaurante Oliveira",
  "slug": "restaurante-oliveira",
  "instagram_user_id": "17841400000000001",
  "token_preview": "...abc123",
  "token_added_at": "2025-05-18"
}
```

Output exibido:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🗂️  Clientes Cadastrados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Restaurante Oliveira        (token válido até 17/07/2025)
⚠️  Clínica Saúde Total        (token expira em 3 dias — reconectar!)
❌ Studio Fotografia Lima      (token expirado em 10/05/2025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 cliente(s) cadastrado(s)
```

## Quality Criteria

- [ ] Todos os clientes em `clients/` aparecem na lista
- [ ] Status calculado corretamente baseado em `token_added_at`
- [ ] Clientes sem `config.json` são sinalizados com ❓ (pasta corrompida)
- [ ] Contagem total correta ao final

## Veto Conditions

Rejeitar e refazer se:
1. Um ou mais clientes cadastrados não aparecem na lista
2. O status de expiração está incorreto (ex: token adicionado hoje marcado como expirado)
