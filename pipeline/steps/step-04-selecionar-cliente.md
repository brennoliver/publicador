---
type: checkpoint
outputFile: squads/instagram-publisher/output/selected-client.json
---

# Step 04: Selecionar Cliente

O usuário escolhe para qual cliente deseja publicar conteúdo. O cliente selecionado é salvo para ser usado pelos steps seguintes.

## Context Loading

Carregar antes de exibir:
- `squads/instagram-publisher/clients/` — listar todos os clientes disponíveis

## Instructions

### Process

1. Ler todos os subdiretórios de `clients/` e seus `config.json`
2. Filtrar apenas clientes com token válido (não expirado) — marcar os expirados mas não os ocultar
3. Apresentar a lista via AskUserQuestion com o nome de cada cliente e status do token
4. Após seleção, salvar o `config.json` completo do cliente em `output/selected-client.json`
5. Se o cliente tem token expirado, avisar antes de continuar e sugerir reconectar primeiro

## Output Format

AskUserQuestion com opções dinâmicas baseadas nos clientes cadastrados, com o nome e status de cada um.

## Output Example

3 clientes disponíveis (2 ativos, 1 com token expirado):

```
Para qual cliente deseja publicar?

1. ✅ Restaurante Oliveira — conta ativa
2. ✅ Studio Fotografia Lima — conta ativa
3. ⚠️  Clínica Saúde Total — token expirando em 3 dias (ainda funciona)
4. ← Voltar ao menu principal
```

Após selecionar "Restaurante Oliveira", salvar em `output/selected-client.json`:
```json
{
  "name": "Restaurante Oliveira",
  "slug": "restaurante-oliveira",
  "instagram_user_id": "17841400000000001",
  "token": "EAABwzLixnjYBO...",
  "token_preview": "...abc123",
  "token_added_at": "2025-05-18"
}
```

## Veto Conditions

Rejeitar e refazer se:
1. Nenhum cliente aparece na lista (diretório `clients/` vazio não deve bloquear — deve sugerir adicionar)
2. O `config.json` do cliente selecionado não é salvo em `output/selected-client.json`

## Quality Criteria

- [ ] Lista dinâmica baseada em clientes reais cadastrados
- [ ] Status do token visível na lista
- [ ] Cliente selecionado salvo em `output/selected-client.json`
- [ ] Opção de voltar ao menu sempre disponível
