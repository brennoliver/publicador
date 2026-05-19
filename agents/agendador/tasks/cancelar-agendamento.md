---
task: "Cancelar Agendamento"
order: 3
input:
  - schedule_id: ID do agendamento a ser cancelado (fornecido pelo usuário)
output:
  - updated_queue: scheduled-queue.json com o item marcado como "cancelled"
  - confirmation: Confirmação de cancelamento com nome do cliente e data do post removido
---

# Cancelar Agendamento

Remove um post específico da fila de agendamentos usando seu ID único.

## Process

1. Listar agendamentos pendentes (via task listar-agendamentos) para o usuário identificar o ID
2. Solicitar o ID do agendamento a cancelar (o usuário pode colar o ID da lista)
3. Localizar o item no `scheduled-queue.json` pelo campo `id`
4. Se não encontrado: informar que o ID não existe ou já foi publicado/cancelado
5. Exibir os dados do post (cliente, formato, data) para confirmação do usuário
6. Aguardar confirmação
7. Atualizar apenas o campo `status` do item para "cancelled" (nunca remover do arquivo — manter histórico)
8. Confirmar cancelamento ao usuário

## Output Format

```
🗑️  Cancelar Agendamento

   ID:         sch-...a3f2
   Cliente:    {Nome do Cliente}
   Formato:    {Formato}
   Data:       DD/MM/YYYY HH:MM

   Confirmar cancelamento? [s/n]
```

Após confirmação:
```
✅ Agendamento cancelado.
   O post de {Nome do Cliente} para {DD/MM/YYYY HH:MM} foi removido da fila.
```

## Output Example

Usuário cancela `sch-1747598400-a3f2`:

```
🗑️  Cancelar Agendamento

   ID:         sch-...a3f2
   Cliente:    Restaurante Oliveira
   Formato:    Carrossel (3 imagens)
   Data:       20/05/2025 12:00

   Confirmar cancelamento? [s/n]
```

Usuário confirma → item atualizado no JSON:
```json
{
  "id": "sch-1747598400-a3f2",
  "status": "cancelled",
  ...
}
```

Mensagem:
```
✅ Agendamento cancelado.
   O post de Restaurante Oliveira para 20/05/2025 12:00 foi removido da fila.
```

## Quality Criteria

- [ ] Item localizado pelo ID exato
- [ ] Dados do post exibidos antes da confirmação
- [ ] Apenas o campo `status` do item alterado para "cancelled"
- [ ] Outros itens da fila não são afetados
- [ ] Confirmação exibida com nome do cliente e data

## Veto Conditions

Rejeitar e refazer se:
1. O cancelamento é executado sem confirmação do usuário
2. Outros itens da fila são alterados ou removidos
