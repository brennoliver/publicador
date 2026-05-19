---
execution: inline
agent: squads/instagram-publisher/agents/publicadora
inputFile: squads/instagram-publisher/output/selected-client.json
outputFile: squads/instagram-publisher/output/post-data.yaml
---

# Step 05: Montar Post

Paula Publisher coleta todos os dados do post — arquivo(s) de mídia, formato, legenda e opção de publicação. Valida cada campo antes de gerar o `post-data.yaml`.

## Context Loading

Carregar antes de executar:
- `squads/instagram-publisher/output/selected-client.json` — dados do cliente selecionado
- `squads/instagram-publisher/pipeline/data/formatos-suportados.md` — requisitos por formato

## Instructions

### Process

1. Exibir o nome do cliente selecionado para confirmar o contexto
2. Executar a task `montar-post` da Paula Publisher:
   - Solicitar arquivo(s) de mídia
   - Solicitar formato
   - Solicitar legenda com contador de caracteres
   - Solicitar publicação imediata ou agendada
3. Validar todos os campos conforme `pipeline/data/formatos-suportados.md`
4. Salvar o `post_data` completo em `output/post-data.yaml`
5. Informar que o próximo passo é o preview antes de publicar

## Output Format

```yaml
post_data:
  client:
    name: "{nome}"
    slug: "{slug}"
    instagram_user_id: "{id}"
  format: "{imagem|carrossel|reels|stories}"
  files:
    - "{caminho completo do arquivo}"
  caption: "{legenda}"
  caption_length: {número}
  publish: "{immediate|scheduled}"
  scheduled_at: null
```

## Output Example

Publicação imediata de carrossel para Restaurante Oliveira:

```yaml
post_data:
  client:
    name: "Restaurante Oliveira"
    slug: "restaurante-oliveira"
    instagram_user_id: "17841400000000001"
  format: "carrossel"
  files:
    - "/Users/brenno/Desktop/prato1.jpg"
    - "/Users/brenno/Desktop/prato2.jpg"
    - "/Users/brenno/Desktop/prato3.jpg"
  caption: "Novos pratos do cardápio de inverno chegaram! 🍲 Venha experimentar nossa sopa de abóbora e o risoto trufado. Reserve sua mesa pelo link na bio. #gastronomia #restaurantesp"
  caption_length: 174
  publish: "immediate"
  scheduled_at: null
```

## Veto Conditions

Rejeitar e refazer se:
1. Arquivo de mídia informado não existe no caminho indicado
2. Legenda ultrapassa 2200 caracteres

## Quality Criteria

- [ ] Cliente selecionado exibido no início para confirmação de contexto
- [ ] Todos os campos validados antes de salvar
- [ ] `post-data.yaml` gerado com estrutura completa
- [ ] Para carrossel: entre 2 e 10 arquivos verificados
