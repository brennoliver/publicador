---
execution: inline
agent: squads/instagram-publisher/agents/publicadora
inputFile: squads/instagram-publisher/output/post-data.yaml
outputFile: squads/instagram-publisher/output/log.md
---

# Step 07: Publicar ou Agendar

Execução final: Paula Publisher publica o post imediatamente via Meta Graph API, ou Artur Agenda registra o post na fila de publicações agendadas.

## Context Loading

Carregar antes de executar:
- `squads/instagram-publisher/output/post-data.yaml` — dados completos do post aprovado
- `squads/instagram-publisher/output/selected-client.json` — token completo do cliente
- `squads/instagram-publisher/output/scheduled-queue.json` — fila de agendamentos (para o Artur)

## Instructions

### Process

1. Ler `post_data.publish` de `output/post-data.yaml`
2. **Se "immediate"**: Paula Publisher executa a task `publicar-post`
   - Invocar o script de publicação com os parâmetros corretos para o formato
   - Exibir resultado com permalink se bem-sucedido
   - Registrar em `output/log.md`
3. **Se "scheduled"**: Passar controle ao Artur Agenda para executar `registrar-agendamento`
   - Solicitar data/hora de publicação
   - Registrar na fila `output/scheduled-queue.json`
   - Confirmar agendamento com ID gerado
4. Após qualquer resultado, perguntar se deseja fazer outra publicação ou encerrar

## Output Format

Sucesso imediato:
```
✅ Post publicado com sucesso!
   Cliente:   {Nome}
   Formato:   {Formato}
   Post URL:  https://www.instagram.com/p/{code}/
   
   Publicar outro? [s/n]
```

Agendado:
```
🗓️  Post agendado com sucesso!
   ID:         sch-...
   Cliente:    {Nome}
   Publicação: DD/MM/YYYY HH:MM
   
   Fazer outra publicação? [s/n]
```

## Output Example

Publicação imediata de carrossel:

Script executado:
```bash
node /Users/brennobarbosa/_opensquad/skills/instagram-publisher/scripts/publish.js \
  --images "/Users/brenno/Desktop/prato1.jpg,/Users/brenno/Desktop/prato2.jpg,/Users/brenno/Desktop/prato3.jpg" \
  --caption "Novos pratos do cardápio de inverno chegaram! 🍲..." \
  --token "EAABwzLixnjYBO..." \
  --user-id "17841400000000001"
```

Output:
```
✅ Post publicado com sucesso!
   Cliente:   Restaurante Oliveira
   Formato:   Carrossel (3 imagens)
   Post URL:  https://www.instagram.com/p/C8xAbCdEfGh/
   Post ID:   17896129714003915
   
   Fazer outra publicação? [s/n]
```

Entrada adicionada em `output/log.md`:
```
| 2025-05-18 14:32 | Restaurante Oliveira | carrossel | https://www.instagram.com/p/C8xAbCdEfGh/ | ✅ sucesso |
```

## Veto Conditions

Rejeitar e refazer se:
1. A publicação é tentada sem o token do cliente carregado de `output/selected-client.json`
2. O resultado (sucesso ou falha) não é registrado em `output/log.md`

## Quality Criteria

- [ ] Parâmetros do script incluem todos os campos necessários (token, user_id, imagens, legenda)
- [ ] Permalink exibido ao usuário após sucesso
- [ ] Erro da API exibido sem supressão em caso de falha
- [ ] Resultado registrado no log independente de sucesso ou falha
- [ ] Usuário perguntado se quer publicar outro post ao final
