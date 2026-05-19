# Guia para Obter Credenciais do Instagram

Para conectar um cliente ao Instagram Publisher, você precisa de dois dados:
1. **Instagram Access Token** (token de acesso long-lived, válido ~60 dias)
2. **Instagram User ID** (ID numérico da conta Business)

## Pré-requisitos

Antes de começar, o cliente deve ter:
- [ ] Conta **Business** ou **Creator** no Instagram (contas pessoais não funcionam)
- [ ] Página vinculada no **Facebook** conectada à conta do Instagram
- [ ] App criado em [developers.facebook.com](https://developers.facebook.com/) (tipo: Empresa)

---

## Passo 1: Criar o App no Meta (uma vez por agência)

1. Acesse [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Clique em **"Criar app"**
3. Selecione o tipo: **Empresa**
4. Preencha o nome do app e email de contato
5. Vá em **Configurações → Básico** e anote o **App ID** e **App Secret**

---

## Passo 2: Obter o Token de Curta Duração (1 hora)

1. Acesse o **Graph API Explorer**: [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. No dropdown superior, selecione seu app
3. Clique em **"Gerar token de acesso"**
4. Ative as permissões:
   - `instagram_content_publish`
   - `instagram_basic`
   - `pages_read_engagement`
5. Clique em **"Gerar token de acesso"** e autorize com a conta do cliente
6. Copie o token gerado (começa com `EAA...`)

---

## Passo 3: Converter para Token Long-Lived (60 dias)

Faça uma requisição GET para:

```
https://graph.facebook.com/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={SEU_APP_ID}
  &client_secret={SEU_APP_SECRET}
  &fb_exchange_token={TOKEN_CURTO}
```

Copie o `access_token` da resposta — este é o token que você vai usar no sistema.

---

## Passo 4: Obter o Instagram User ID

1. No Graph API Explorer (com o token long-lived), faça GET em:
   ```
   /me/accounts
   ```
2. Localize a **Página do Facebook** do cliente na resposta e anote o `id`
3. Faça GET em:
   ```
   /{page-id}?fields=instagram_business_account
   ```
4. Copie o `id` dentro de `instagram_business_account` — esse é o **Instagram User ID**

---

## Renovação do Token

Tokens expiram em ~60 dias. Para renovar:
1. Use o token ainda válido ou gere um novo token curto (Passo 2)
2. Converta para long-lived (Passo 3)
3. No sistema, use a opção **"Reconectar cliente"** para atualizar o token

---

## Problemas Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `OAuthException: token expired` | Token venceu (60+ dias) | Reconectar cliente com novo token |
| `Permission denied: instagram_content_publish` | Permissão não concedida | Regenerar token com a permissão |
| `Invalid user id` | User ID errado | Refazer o Passo 4 para obter o ID correto |
| `Account not Business` | Conta pessoal/Creator sem API | Converter conta para Business no app do Instagram |
