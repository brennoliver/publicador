---
task: "Publicar Post"
order: 3
input:
  - post_data: Estrutura completa do post aprovada no preview
  - client_token: Token de acesso completo lido do config.json do cliente
output:
  - publish_result: Resultado da publicação (sucesso com permalink ou falha com erro)
  - log_entry: Entrada registrada em squads/instagram-publisher/output/log.md
---

# Publicar Post

Executa a publicação do post aprovado no Instagram do cliente via Meta Graph API, ou passa os dados para o Artur Agenda se a publicação for agendada.

## Process

1. Verificar se `post_data.publish` é "immediate" ou "scheduled"
2. **Se "scheduled"**: passar `post_data` completo para Artur Agenda e encerrar esta task
3. **Se "immediate"**: ler o token completo de `clients/{slug}/config.json`
4. Detectar o formato do post e invocar o script adequado:
   - **Imagem**: `node {skill_path}/scripts/publish.js --images "{file}" --caption "{caption}" --token "{token}" --user-id "{user_id}"`
   - **Carrossel**: `node {skill_path}/scripts/publish.js --images "{file1},{file2},...{fileN}" --caption "{caption}" --token "{token}" --user-id "{user_id}"`
   - **Reels/Vídeo**: script de vídeo com os mesmos parâmetros + `--type reels`
   - **Stories**: script com os mesmos parâmetros + `--type stories`
5. Capturar o resultado do script: verificar se retornou `success: true` e `post_url`
6. Em caso de sucesso: exibir permalink e registrar no log
7. Em caso de falha: exibir o código e mensagem de erro da API e perguntar como proceder

## Output Format

Sucesso:
```
✅ Post publicado com sucesso!
   Cliente:   {Nome do Cliente}
   Formato:   {Formato}
   Post URL:  https://www.instagram.com/p/{shortcode}/
   Post ID:   {id}
```

Falha:
```
❌ Falha na publicação
   Cliente:   {Nome do Cliente}
   Erro:      {código} — {mensagem da API}
   
   O que fazer?
   1. Tentar novamente
   2. Verificar o token (pode ter expirado)
   3. Cancelar
```

## Output Example

Carrossel publicado com sucesso para Restaurante Oliveira:

```
✅ Post publicado com sucesso!
   Cliente:   Restaurante Oliveira
   Formato:   Carrossel (3 imagens)
   Post URL:  https://www.instagram.com/p/C8xAbCdEfGh/
   Post ID:   17896129714003915
   
   📝 Registrado em output/log.md
```

Entrada adicionada em `output/log.md`:
```
| 2025-05-18 14:32 | Restaurante Oliveira | carrossel | https://www.instagram.com/p/C8xAbCdEfGh/ | ✅ sucesso |
```

## Quality Criteria

- [ ] Script invocado com os parâmetros corretos para o formato escolhido
- [ ] Token lido diretamente do config.json (nunca de variável de ambiente hard-coded)
- [ ] Permalink exibido ao usuário após sucesso
- [ ] Resultado registrado no log (tanto sucesso quanto falha)
- [ ] Em caso de erro: mensagem original da API exibida sem supressão

## Veto Conditions

Rejeitar e refazer se:
1. A publicação é tentada sem que o post tenha passado pelo preview e sido aprovado
2. O resultado (sucesso ou falha) não é registrado no log
