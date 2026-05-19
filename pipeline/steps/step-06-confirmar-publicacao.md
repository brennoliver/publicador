---
type: checkpoint
---

# Step 06: Confirmar Publicação

Ponto de aprovação obrigatório. Paula Publisher exibe o preview completo do post e o usuário confirma, edita ou cancela antes de qualquer publicação.

## Context Loading

Carregar antes de exibir:
- `squads/instagram-publisher/output/post-data.yaml` — dados completos do post montado

## Instructions

### Process

1. Acionar Paula Publisher para executar a task `preview-post`
2. Paula exibe o painel completo com todos os dados do post
3. Apresentar via AskUserQuestion as opções: Publicar, Editar legenda, Cancelar
4. Se "Publicar": prosseguir para step-07
5. Se "Editar legenda": retornar ao step-05 para edição
6. Se "Cancelar": retornar ao menu principal (step-02)

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 PREVIEW DO POST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Cliente:    {Nome}
📐 Formato:    {Formato}
🕒 Publicação: Imediata | Agendada para {data}

📁 Arquivo(s):
   {lista de arquivos}

📝 Legenda ({N}/2200 chars):
   {legenda completa}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 PREVIEW DO POST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Cliente:    Restaurante Oliveira
📐 Formato:    Carrossel (3 imagens)
🕒 Publicação: Imediata

📁 Arquivo(s):
   Slide 1: prato1.jpg
   Slide 2: prato2.jpg
   Slide 3: prato3.jpg

📝 Legenda (174/2200 chars):
   Novos pratos do cardápio de inverno chegaram! 🍲
   Venha experimentar nossa sopa de abóbora e o risoto trufado.
   Reserve sua mesa pelo link na bio.
   #gastronomia #restaurantesp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Publicar  |  ✏️ Editar legenda  |  ❌ Cancelar
```

## Veto Conditions

Rejeitar e refazer se:
1. O step-07 (publicação) é acionado sem passar por este checkpoint
2. Algum campo do post não aparece no preview

## Quality Criteria

- [ ] Preview completo exibido com todos os campos do post-data.yaml
- [ ] Três opções claramente apresentadas (publicar/editar/cancelar)
- [ ] Roteamento correto para cada escolha
