---
task: "Adicionar Cliente"
order: 2
input:
  - name: Nome do cliente informado pelo usuário
  - instagram_access_token: Token de acesso da Meta Graph API (long-lived, 60 dias)
  - instagram_user_id: Instagram Business Account User ID
output:
  - config_file: squads/instagram-publisher/clients/{slug}/config.json criado com sucesso
  - slug: Identificador único do cliente gerado automaticamente
---

# Adicionar Cliente

Cadastra um novo cliente no sistema com suas credenciais da Meta Graph API, criando a estrutura de pasta e arquivo de configuração necessários.

## Process

1. Solicitar o nome do cliente (ex: "Restaurante Oliveira") — pedir apenas o nome primeiro
2. Gerar o slug automaticamente: lowercase, sem acentos, espaços → hifens, remover caracteres especiais (ex: "Restaurante Oliveira" → "restaurante-oliveira")
3. Verificar se já existe pasta `clients/{slug}/` — se sim, adicionar sufixo `-2`, `-3` etc.
4. Solicitar o Instagram Access Token (long-lived) — informar que ele tem ~60 dias de validade
5. Validar que o token tem pelo menos 50 caracteres; se não, recusar e pedir novamente
6. Solicitar o Instagram User ID (somente números)
7. Exibir resumo de confirmação com token truncado (últimos 6 chars) e aguardar confirmação
8. Criar a pasta e o arquivo `config.json` com todos os dados + data atual como `token_added_at`
9. Abrir o Instagram (`https://www.instagram.com`) via Playwright usando o perfil persistente em `_opensquad/_browser_profile/`
10. Informar ao usuário: "Faça o login no Instagram. Quando terminar, avise para continuar."
11. Aguardar confirmação do usuário de que o login foi concluído
12. Fechar o browser — a sessão fica salva automaticamente no perfil persistente
13. Confirmar ao usuário que o login foi salvo e não será necessário novamente para este cliente

## Output Format

```json
{
  "name": "Nome do Cliente",
  "slug": "nome-do-cliente",
  "instagram_user_id": "17841400000000000",
  "token": "EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token_preview": "...xxxxxx",
  "token_added_at": "YYYY-MM-DD",
  "created_at": "YYYY-MM-DD"
}
```

## Output Example

Usuário informa:
- Nome: "Clínica Saúde Total"
- Token: `EAABwzLixnjYBOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- User ID: `17841400000000042`

Arquivo gerado em `clients/clinica-saude-total/config.json`:
```json
{
  "name": "Clínica Saúde Total",
  "slug": "clinica-saude-total",
  "instagram_user_id": "17841400000000042",
  "token": "EAABwzLixnjYBOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token_preview": "...xxxxxx",
  "token_added_at": "2025-05-18",
  "created_at": "2025-05-18"
}
```

Mensagem após criar o config.json:
```
✅ Cliente adicionado com sucesso!
   Nome:       Clínica Saúde Total
   Slug:       clinica-saude-total
   User ID:    17841400000000042
   Token:      ...xxxxxx (válido até ~17/07/2025)

🌐 Abrindo o Instagram para login...
   Faça o login na conta do cliente e avise quando terminar.
```

Após confirmação do usuário:
```
✅ Sessão salva! Nas próximas publicações, o login não será necessário.
```

## Quality Criteria

- [ ] Slug único verificado antes de criar
- [ ] Token validado com mínimo de 50 caracteres
- [ ] `token_added_at` salvo como data atual no formato YYYY-MM-DD
- [ ] Token exibido ao usuário apenas com os últimos 6 caracteres
- [ ] Arquivo `config.json` criado e legível após a operação
- [ ] Browser aberto com o perfil persistente (`_opensquad/_browser_profile/`) após salvar o config
- [ ] Login aguardado com confirmação explícita do usuário antes de fechar o browser
- [ ] Sessão salva — usuário informado de que não precisará fazer login novamente

## Veto Conditions

Rejeitar e refazer se:
1. Token informado tem menos de 50 caracteres (token inválido)
2. User ID não é numérico ou está vazio
3. Browser aberto sem usar o perfil persistente (sessão não seria salva entre execuções)
