---
task: "Preview do Post"
order: 2
input:
  - post_data: Estrutura completa do post montada na task anterior
output:
  - preview_display: Painel visual exibido no terminal com todos os dados do post
  - user_approval: Confirmação ou rejeição do usuário
---

# Preview do Post

Exibe um painel visual completo com todos os dados do post antes de publicar, permitindo que a equipe revise e confirme ou cancele a publicação.

## Process

1. Ler o `post_data` recebido da task montar-post
2. Verificar o formato do post e preparar a exibição adequada:
   - Imagem/Reels/Stories: exibir o nome do arquivo com ícone de tipo
   - Carrossel: listar todos os arquivos em ordem numerada
3. Exibir o painel completo com separadores visuais, cliente, formato, arquivos e legenda
4. Para carrossel: mostrar "Slide 1", "Slide 2", etc. com o nome de cada arquivo
5. Exibir a legenda completa com contagem de caracteres
6. Se agendado: exibir data e hora de publicação em formato DD/MM/YYYY HH:MM
7. Perguntar ao usuário: publicar, editar ou cancelar

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 PREVIEW DO POST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Cliente:    {Nome do Cliente}
📐 Formato:    {Formato} 
🕒 Publicação: Imediata | Agendada para {DD/MM/YYYY HH:MM}

📁 Arquivo(s):
   {lista de arquivos}

📝 Legenda ({N}/2200 chars):
   {legenda completa}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Publicar    ✏️  Editar    ❌ Cancelar
```

## Output Example

Post de carrossel agendado para Restaurante Oliveira:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 PREVIEW DO POST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Cliente:    Restaurante Oliveira
📐 Formato:    Carrossel (3 imagens)
🕒 Publicação: Agendada para 20/05/2025 12:00

📁 Arquivo(s):
   Slide 1: prato1.jpg
   Slide 2: prato2.jpg
   Slide 3: prato3.jpg

📝 Legenda (174/2200 chars):
   Novos pratos do cardápio de inverno chegaram! 🍲
   Venha experimentar nossa sopa de abóbora e o risoto trufado.
   Reserve sua mesa pelo link na bio.
   #gastronomia #restaurantesp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Publicar    ✏️  Editar    ❌ Cancelar
```

## Quality Criteria

- [ ] Todos os campos do post_data aparecem no preview
- [ ] Para carrossel: cada slide numerado individualmente
- [ ] Contagem de caracteres da legenda exibida corretamente
- [ ] Para agendamento: data/hora formatada em DD/MM/YYYY HH:MM
- [ ] Opções de publicar/editar/cancelar claramente apresentadas

## Veto Conditions

Rejeitar e refazer se:
1. Algum campo do post_data não aparece no preview (ex: legenda truncada ou arquivo omitido)
2. A contagem de caracteres está incorreta
