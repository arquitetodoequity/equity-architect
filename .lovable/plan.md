
Objetivo: corrigir o travamento em “Verificando link de recuperação...” e garantir que a troca de senha do usuário do Arquiteto do Equity funcione de ponta a ponta.

Diagnóstico (com base no código + logs):
- O envio de recuperação está funcionando (evento de recovery foi disparado).
- Há tentativas com `/verify` retornando `403: One-time token not found` (link expirado/reutilizado).
- A `ResetPasswordPage` atual só sai do loading quando recebe `PASSWORD_RECOVERY` ou sessão válida; quando o link é inválido/expirado, ela não entra em estado de erro e fica em spinner infinito.

Plano de correção:
1. Atualizar `src/pages/ResetPasswordPage.tsx` para usar estado explícito de fluxo:
   - `checking` (validando link),
   - `ready` (mostrar formulário),
   - `invalid` (link inválido/expirado).
2. No `useEffect` da reset page:
   - Ler `window.location.hash`/query para detectar parâmetros de recovery e possíveis erros.
   - Considerar como válido tanto evento `PASSWORD_RECOVERY` quanto sessão autenticada após verify.
   - Adicionar fallback com timeout curto: se não houver sessão/token válido, migrar para `invalid` (evita loading infinito).
   - Limpar hash da URL após processar token (higiene e evita reprocessamento).
3. Ajustar UI da `ResetPasswordPage`:
   - Manter spinner apenas no estado `checking`.
   - No estado `invalid`, mostrar mensagem clara: “Link inválido ou expirado” + ação “Solicitar novo link” + “Voltar para login”.
   - No estado `ready`, manter formulário atual de nova senha/confirmar senha.
4. Ajuste pequeno em `src/pages/LoginPage.tsx`:
   - Permitir abrir automaticamente o modo “Esqueci a senha” via query param (ex.: `?forgot=1`) quando vier da tela de link inválido.
5. Validação funcional (QA):
   - Link novo de recuperação: deve abrir formulário e permitir redefinir.
   - Link expirado/reutilizado: deve mostrar erro amigável (sem spinner eterno).
   - Acesso direto em `/reset-password` sem token: deve cair em estado inválido.
   - Login com nova senha após redefinição: deve funcionar normalmente.

Escopo:
- Sem mudança de schema/tabelas.
- Correção focada apenas no fluxo de recuperação de senha do próprio sistema.
