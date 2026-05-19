---
task: "Montar Post"
order: 1
input:
  - client_config: config.json do cliente selecionado
  - media_file: Caminho do arquivo de mídia (imagem, vídeo ou múltiplas imagens para carrossel)
  - caption: Legenda do post (máx 2200 caracteres)
  - format: Formato do post (imagem, carrossel, reels, stories)
  - publish_option: Imediato ou agendado
output:
  - post_data: Estrutura completa do post pronta para preview e publicação
---

# Montar Post

Coleta todos os dados necessários para o post — arquivo(s) de mídia, legenda, formato e opção de publicação — e valida cada campo antes de passar para o preview.

## Process

1. Solicitar o caminho do arquivo de mídia principal (o usuário pode colar o caminho completo)
2. Perguntar o formato do post: imagem, carrossel, reels ou stories
3. Para carrossel: solicitar os caminhos adicionais de imagens (mínimo 2, máximo 10) — pedir um por vez até o usuário digitar "pronto"
4. Solicitar a legenda — exibir contador de caracteres ao final (ex: "523/2200 caracteres")
5. Validar a legenda: se ultrapassar 2200 caracteres, avisar e pedir para encurtar antes de continuar
6. Perguntar se quer publicar imediatamente ou agendar
7. Montar o objeto `post_data` com todos os campos validados e passar para a task de preview

## Output Format

```yaml
post_data:
  client:
    name: "Nome do Cliente"
    slug: "slug-do-cliente"
    instagram_user_id: "17841400000000000"
  format: "imagem | carrossel | reels | stories"
  files:
    - "/caminho/para/arquivo1.jpg"
    - "/caminho/para/arquivo2.jpg"  # apenas para carrossel
  caption: "Texto da legenda aqui..."
  caption_length: 523
  publish: "immediate | scheduled"
  scheduled_at: null  # ou "2025-06-01T15:00:00" se agendado
```

## Output Example

Cliente: Restaurante Oliveira
Formato: carrossel
Arquivos: `/Users/brenno/Desktop/prato1.jpg`, `/Users/brenno/Desktop/prato2.jpg`, `/Users/brenno/Desktop/prato3.jpg`
Legenda: "Novos pratos do cardápio de inverno chegaram! 🍲 Venha experimentar nossa sopa de abóbora e o risoto trufado. Reserve sua mesa pelo link na bio. #gastronomia #restaurantesp"

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

## Quality Criteria

- [ ] Todos os arquivos informados existem no caminho indicado
- [ ] Legenda dentro de 2200 caracteres
- [ ] Para carrossel: entre 2 e 10 arquivos
- [ ] Formato registrado como um dos 4 valores válidos
- [ ] `publish` definido como "immediate" ou "scheduled"

## Veto Conditions

Rejeitar e refazer se:
1. Qualquer arquivo informado não existe no caminho indicado
2. Legenda ultrapassa 2200 caracteres
