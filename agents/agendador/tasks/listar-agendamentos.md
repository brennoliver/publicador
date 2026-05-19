---
task: "Listar Agendamentos"
order: 2
input:
  - scheduled_queue: squads/instagram-publisher/output/scheduled-queue.json
output:
  - queue_display: Tabela formatada de posts agendados ordenada por data de publicação
---

# Listar Agendamentos

Exibe todos os posts na fila de agendamentos, ordenados cronologicamente, com status e informações principais de cada item.

## Process

1. Ler `squads/instagram-publisher/output/scheduled-queue.json`
2. Se arquivo não existe ou array vazio: informar que não há posts agendados
3. Filtrar por status "pending" (ignorar publicados ou cancelados)
4. Ordenar por `scheduled_at` (mais próximo primeiro)
5. Verificar quais posts têm `scheduled_at` nas próximas 2 horas e marcar com 🔔
6. Exibir tabela com: ID (curto), cliente, formato, data/hora e status
7. Exibir total de posts pendentes ao final

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🗓️  Fila de Agendamentos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID           CLIENTE                FORMATO    DATA/HORA         STATUS
sch-...a3f2  Restaurante Oliveira   Carrossel  20/05/2025 12:00  ⏳ Pendente
sch-...b7c1  Clínica Saúde Total    Imagem     22/05/2025 09:00  ⏳ Pendente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2 post(s) agendado(s)
```

## Output Example

`scheduled-queue.json` contém 3 itens (2 pendentes, 1 publicado):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🗓️  Fila de Agendamentos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 sch-...a3f2  Restaurante Oliveira   Carrossel  20/05/2025 12:00  ⏳ Pendente (em 1h30)
   sch-...b7c1  Clínica Saúde Total    Imagem     22/05/2025 09:00  ⏳ Pendente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2 post(s) agendado(s)  |  🔔 1 publicação nas próximas 2 horas
```

## Quality Criteria

- [ ] Apenas itens com status "pending" exibidos
- [ ] Ordenação cronológica do mais próximo ao mais distante
- [ ] Posts com publicação em até 2 horas marcados com 🔔
- [ ] ID exibido em formato curto (últimos 8 caracteres do ID completo)
- [ ] Total correto ao final

## Veto Conditions

Rejeitar e refazer se:
1. Itens já publicados ou cancelados aparecem na lista
2. Ordenação incorreta (post mais distante aparece antes do mais próximo)
