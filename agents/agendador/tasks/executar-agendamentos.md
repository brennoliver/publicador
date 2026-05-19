---
task: "Executar Agendamentos"
order: 4
input:
  - scheduled_queue: squads/instagram-publisher/output/scheduled-queue.json
output:
  - published_posts: Lista de posts publicados nesta execução
  - updated_queue: scheduled-queue.json com status dos itens atualizados
---

# Executar Agendamentos

Verifica a fila de agendamentos, identifica posts com `scheduled_at` no passado ou igual ao momento atual, e aciona a Paula Publisher para cada um deles. Atualiza o status no arquivo após cada tentativa.

## Process

1. Ler `squads/instagram-publisher/output/scheduled-queue.json`
2. Se arquivo não existe ou array vazio: informar que não há posts agendados e encerrar
3. Filtrar itens com `status === "pending"` e `scheduled_at <= agora` (comparar timestamp ISO 8601 com data/hora atual)
4. Se nenhum item está pronto para publicar: exibir próximo agendamento e encerrar
5. Para cada item pronto (em ordem cronológica):
   a. Exibir que vai publicar: cliente, formato e horário agendado
   b. Ler `clients/{client_slug}/config.json` para obter o token atualizado
   c. Acionar a Paula Publisher passando o `post_data` completo com `publish: "immediate"` (sem pedir inputs)
   d. Se sucesso: atualizar `status` para "published" e adicionar `published_at` com timestamp atual
   e. Se falha: atualizar `status` para "failed", adicionar `failed_at` e `error_message` com o erro da API
   f. Reescrever o arquivo JSON preservando todos os outros itens
6. Exibir resumo da execução ao final

## Output Format

Início:
```
⚙️  Verificando agendamentos...
   Hora atual: 20/05/2025 12:03
   Posts prontos para publicar: 2
```

Por item:
```
📤 Publicando post #1 de 2
   Cliente:   Restaurante Oliveira
   Formato:   Carrossel
   Agendado:  20/05/2025 12:00
```

Resumo final:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Execução concluída
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Publicados:  2
Falhas:      0
Pendentes:   1 (próximo: 22/05/2025 09:00 — Clínica Saúde Total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Quando não há posts prontos:
```
⏳ Nenhum post pronto para publicar agora.
   Próximo agendamento: 22/05/2025 09:00 — Clínica Saúde Total (em 1d 21h)
```

## Schema de Atualização

Após publicação bem-sucedida:
```json
{
  "id": "sch-1747598400-a3f2",
  "status": "published",
  "published_at": "2025-05-20T12:03:15",
  "...demais campos inalterados..."
}
```

Após falha:
```json
{
  "id": "sch-1747598400-a3f2",
  "status": "failed",
  "failed_at": "2025-05-20T12:03:15",
  "error_message": "Error 190: Token de acesso inválido ou expirado",
  "...demais campos inalterados..."
}
```

## Output Example

Fila com 3 itens: 2 prontos para publicar, 1 futuro.

```
⚙️  Verificando agendamentos...
   Hora atual: 20/05/2025 12:03
   Posts prontos para publicar: 2

📤 Publicando post #1 de 2
   Cliente:   Restaurante Oliveira
   Formato:   Carrossel
   Agendado:  20/05/2025 12:00

✅ Post publicado com sucesso!
   Post URL:  https://www.instagram.com/p/C8xAbCdEfGh/

📤 Publicando post #2 de 2
   Cliente:   Loja ModaFit
   Formato:   Imagem
   Agendado:  20/05/2025 12:00

✅ Post publicado com sucesso!
   Post URL:  https://www.instagram.com/p/D2yXzKlMnOp/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Execução concluída
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Publicados:  2
Falhas:      0
Pendentes:   1 (próximo: 22/05/2025 09:00 — Clínica Saúde Total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Quality Criteria

- [ ] Apenas posts com `scheduled_at <= agora` e `status === "pending"` são processados
- [ ] Token lido do `config.json` do cliente (nunca hardcoded)
- [ ] Status atualizado corretamente após cada tentativa (published ou failed)
- [ ] Outros itens da fila não são afetados ao reescrever o arquivo
- [ ] Resumo exibe próximo agendamento pendente ao final
- [ ] Posts processados em ordem cronológica (mais antigo primeiro)

## Veto Conditions

Rejeitar e refazer se:
1. Posts com `scheduled_at` no futuro são publicados prematuramente
2. Um item falha e os demais deixam de ser processados (deve continuar mesmo com falha)
3. O arquivo JSON é sobrescrito perdendo itens não processados
