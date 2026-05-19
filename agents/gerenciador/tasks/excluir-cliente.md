---
task: "Excluir Cliente"
order: 4
input:
  - slug: Identificador do cliente a ser excluído
output:
  - confirmation: Confirmação da exclusão com nome do cliente removido
---

# Excluir Cliente

Remove permanentemente um cliente e todas as suas configurações do sistema.

## Process

1. Listar clientes disponíveis para o usuário escolher qual excluir
2. Ler o `config.json` do cliente selecionado para exibir o nome completo na confirmação
3. Exibir alerta de confirmação com o nome do cliente — deixar claro que a ação é irreversível
4. Aguardar confirmação explícita (s/n)
5. Usar Bash para remover a pasta `squads/instagram-publisher/clients/{slug}/` recursivamente
6. Confirmar remoção ao usuário

## Output Format

```
⚠️  ATENÇÃO — Esta ação é irreversível

   Você está prestes a excluir o cliente:
   "{Nome do Cliente}"

   Isso removerá todas as credenciais e configurações.
   Tem certeza? [s/n]
```

## Output Example

Usuário seleciona: Studio Fotografia Lima

```
⚠️  ATENÇÃO — Esta ação é irreversível

   Você está prestes a excluir o cliente:
   "Studio Fotografia Lima"

   Isso removerá todas as credenciais e configurações.
   Tem certeza? [s/n]
```

Usuário responde "s":

```
🗑️  Cliente "Studio Fotografia Lima" excluído com sucesso.
```

## Quality Criteria

- [ ] Nome completo do cliente exibido na mensagem de confirmação (não o slug)
- [ ] Usuário confirma explicitamente antes da exclusão
- [ ] Pasta `clients/{slug}/` completamente removida após exclusão
- [ ] Mensagem de sucesso exibida após remoção bem-sucedida

## Veto Conditions

Rejeitar e refazer se:
1. A exclusão é executada sem confirmação explícita do usuário
2. A pasta do cliente ainda existe após a operação de remoção
