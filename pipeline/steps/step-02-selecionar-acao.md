---
type: checkpoint
---

# Step 02: Selecionar Ação

Menu principal do sistema. O usuário escolhe entre publicar conteúdo, gerenciar clientes ou visualizar agendamentos.

## Context Loading

Não requer arquivos adicionais — é o menu de navegação principal.

## Instructions

### Process

1. Apresentar as opções via AskUserQuestion
2. Rotear para o step correspondente baseado na escolha:
   - "Publicar conteúdo" → ir para step-04 (selecionar cliente)
   - "Gerenciar clientes" → ir para step-03 (gerenciar clientes)
   - "Ver agendamentos" → acionar Artur Agenda para listar a fila

## Output Format

AskUserQuestion com opções:
- Publicar conteúdo — Selecionar cliente e postar no Instagram
- Gerenciar clientes — Adicionar, reconectar ou excluir contas
- Ver agendamentos — Visualizar e gerenciar posts agendados

## Output Example

```
O que deseja fazer?

1. 📤 Publicar conteúdo — Selecionar cliente e postar no Instagram
2. 🗂️  Gerenciar clientes — Adicionar, reconectar ou excluir contas
3. 🗓️  Ver agendamentos — Visualizar e gerenciar posts agendados
```

## Veto Conditions

Rejeitar e refazer se:
1. O roteamento leva para o step errado (ex: "Publicar" vai para gerenciar clientes)
2. Menos de 2 opções apresentadas

## Quality Criteria

- [ ] Exatamente 3 opções apresentadas
- [ ] Roteamento correto para cada opção escolhida
