---
task: "Registrar Agendamento"
order: 1
input:
  - post_data: Estrutura completa do post vinda da Paula Publisher
  - scheduled_datetime: Data e hora de publicação informada pelo usuário (DD/MM/YYYY HH:MM)
output:
  - schedule_entry: Entrada adicionada em scheduled-queue.json com ID único
  - schedule_id: Identificador único do agendamento retornado ao usuário
---

# Registrar Agendamento

Recebe os dados completos de um post aprovado e o registra na fila de publicações agendadas com data/hora futura.

## Process

1. Receber `post_data` completo da Paula Publisher (arquivo, legenda, formato, cliente)
2. Solicitar a data e hora de publicação no formato DD/MM/YYYY HH:MM
3. Validar que a data/hora informada é no futuro (comparar com timestamp atual)
4. Converter para ISO 8601: "20/05/2025 12:00" → "2025-05-20T12:00:00"
5. Gerar ID único: `sch-{timestamp-unix}-{random-4-chars}` (ex: `sch-1747598400-a3f2`)
6. Ler o arquivo `output/scheduled-queue.json` (criar se não existir com array vazio)
7. Adicionar nova entrada ao array e reescrever o arquivo
8. Exibir confirmação com ID do agendamento, data formatada e nome do cliente

## Output Format

```json
{
  "id": "sch-1747598400-a3f2",
  "client_name": "Nome do Cliente",
  "client_slug": "slug-do-cliente",
  "instagram_user_id": "17841400000000000",
  "format": "imagem | carrossel | reels | stories",
  "files": ["/caminho/para/arquivo.jpg"],
  "caption": "Legenda do post...",
  "scheduled_at": "2025-05-20T12:00:00",
  "scheduled_at_display": "20/05/2025 12:00",
  "status": "pending",
  "created_at": "2025-05-18T14:35:00"
}
```

## Output Example

Paula Publisher passa post de imagem para Clínica Saúde Total
Usuário informa: 22/05/2025 09:00

Entrada adicionada ao `scheduled-queue.json`:
```json
{
  "id": "sch-1747598400-b7c1",
  "client_name": "Clínica Saúde Total",
  "client_slug": "clinica-saude-total",
  "instagram_user_id": "17841400000000042",
  "format": "imagem",
  "files": ["/Users/brenno/Desktop/post-saude.jpg"],
  "caption": "Cuide da sua saúde com nossas consultas especializadas. Agende pelo link na bio! 🏥 #saude #clinica",
  "scheduled_at": "2025-05-22T09:00:00",
  "scheduled_at_display": "22/05/2025 09:00",
  "status": "pending",
  "created_at": "2025-05-18T14:35:00"
}
```

Mensagem ao usuário:
```
🗓️  Post agendado com sucesso!
   ID:         sch-1747598400-b7c1
   Cliente:    Clínica Saúde Total
   Formato:    Imagem
   Publicação: 22/05/2025 09:00
```

## Quality Criteria

- [ ] Data/hora futura validada antes de salvar
- [ ] ID único gerado e retornado ao usuário
- [ ] Entrada adicionada ao array sem sobrescrever as existentes
- [ ] Status inicial definido como "pending"
- [ ] Data exibida ao usuário em DD/MM/YYYY HH:MM

## Veto Conditions

Rejeitar e refazer se:
1. Data/hora informada é no passado
2. A entrada é adicionada mas outros itens da fila são perdidos (sobrescrita incorreta do arquivo)
