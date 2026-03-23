

## Recuperação de Senha

### O que será feito

1. **Link "Esqueci a senha"** na LoginPage — abaixo do campo de senha, visível apenas no modo login
2. **Modo de recuperação** na própria LoginPage — ao clicar, mostra apenas campo de email + botão "Enviar link de recuperação". Chama `supabase.auth.resetPasswordForEmail()` com redirect para `/reset-password`
3. **Nova página `/reset-password`** — formulário para definir nova senha. Detecta token de recovery na URL, chama `supabase.auth.updateUser({ password })`, redireciona para `/dashboard`
4. **Rota no App.tsx** — adicionar `/reset-password` como rota pública

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/pages/LoginPage.tsx` | Adicionar estado `isForgotPassword`, link "Esqueci a senha", formulário simplificado com apenas email quando ativo |
| `src/pages/ResetPasswordPage.tsx` | **Novo** — campo de nova senha + confirmação, botão "Redefinir senha" |
| `src/App.tsx` | Adicionar rota `/reset-password` (pública) |

### Detalhes técnicos

- `resetPasswordForEmail` usa `redirectTo: window.location.origin + '/reset-password'`
- `ResetPasswordPage` escuta `onAuthStateChange` para evento `PASSWORD_RECOVERY` e então permite o update
- Mesmo design visual da LoginPage (painel direito)

