---
execution: inline
agent: squads/instagram-publisher/agents/gerenciador
outputFile: squads/instagram-publisher/output/clients-action-result.md
---

# Step 03: Gerenciar Clientes

Aciona Carlos Clientes para executar operações de gerenciamento de contas — listar, adicionar, reconectar ou excluir.

## Context Loading

Carregar antes de executar:
- `squads/instagram-publisher/clients/` — diretório com todos os clientes cadastrados
- `squads/instagram-publisher/pipeline/data/clients-schema.md` — schema do config.json
- `squads/instagram-publisher/pipeline/data/guia-credenciais.md` — instruções para obter token e user_id

## Instructions

### Process

1. Acionar Carlos Clientes
2. Carlos executa a task `listar-clientes` para exibir o estado atual
3. Apresentar submenu de gerenciamento via AskUserQuestion:
   - Adicionar novo cliente
   - Reconectar conta (atualizar token)
   - Excluir cliente
   - Voltar ao menu principal
4. Executar a task correspondente à escolha do usuário
5. Após concluir a operação, perguntar se deseja realizar outra ação ou voltar ao menu principal

## Output Format

```
🗂️  Gerenciamento de Clientes

[Lista atual de clientes]

O que deseja fazer?
1. ➕ Adicionar novo cliente
2. 🔄 Reconectar conta (token expirado)
3. 🗑️  Excluir cliente
4. ← Voltar ao menu principal
```

## Output Example

Com 2 clientes cadastrados:

```
🗂️  Gerenciamento de Clientes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Restaurante Oliveira    (token válido até 17/07/2025)
⚠️  Clínica Saúde Total    (token expira em 3 dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O que deseja fazer?
1. ➕ Adicionar novo cliente
2. 🔄 Reconectar conta (token expirado)
3. 🗑️  Excluir cliente
4. ← Voltar ao menu principal
```

## Veto Conditions

Rejeitar e refazer se:
1. A lista de clientes não é exibida antes do submenu
2. A task errada é executada para a ação escolhida

## Quality Criteria

- [ ] Lista de clientes exibida com status correto
- [ ] Submenu de 4 opções apresentado
- [ ] Operação executada corretamente pela task adequada do Carlos Clientes
- [ ] Opção de retorno ao menu principal sempre disponível
