---
type: checkpoint
---

# Step 01: Tela Inicial

Ponto de entrada do sistema. Apresenta o menu principal com as opções disponíveis e verifica se há posts agendados próximos de publicação.

## Context Loading

Carregar antes de exibir:
- `squads/instagram-publisher/output/scheduled-queue.json` — verificar posts agendados para as próximas 2 horas
- `squads/instagram-publisher/clients/` — contar quantos clientes estão cadastrados

## Instructions

### Process

1. Ler a fila de agendamentos e verificar se há posts com `scheduled_at` nas próximas 2 horas com status "pending"
2. Se houver posts próximos de publicação, exibir alerta no topo com o número de posts e o mais próximo
3. Contar quantos clientes estão em `clients/` para exibir no rodapé
4. Apresentar o menu principal com as 3 opções via AskUserQuestion

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📤  Instagram Publisher
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 ALERTA: {N} post(s) agendado(s) para as próximas 2 horas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{N} cliente(s) cadastrado(s)
```

Seguido de AskUserQuestion com as opções do menu principal.

## Output Example

Sistema com 3 clientes e 1 post agendado para em 45 minutos:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📤  Instagram Publisher
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 ALERTA: 1 post agendado para 20/05/2025 12:00
   Cliente: Restaurante Oliveira — Carrossel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 cliente(s) cadastrado(s)
```

## Veto Conditions

Rejeitar e refazer se:
1. O menu principal não é exibido (sistema trava em erro de leitura de arquivo)
2. Alerta de post próximo não aparece quando há posts nas próximas 2 horas

## Quality Criteria

- [ ] Alerta exibido quando há posts nas próximas 2 horas
- [ ] Contagem de clientes correta
- [ ] Menu principal sempre disponível independente de erros de leitura
