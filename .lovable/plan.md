

## Status das 5 Correções

| # | Correção | Status |
|---|----------|--------|
| 1 | Sidebar: navItems com "Sócios" e paths corretos | **Já feito** — labels e paths estão corretos, `isActive` usa match exato |
| 2 | Setup salva no Context (`updateCompanySetup`) | **Pendente** — `handleFinish` no SetupPage apenas faz toast + navigate, não salva nada no AppContext. AppContext não tem `updateCompanySetup`. |
| 3 | Nova Proposta no Dashboard abre modal | **Pendente** — botão existe mas não tem `onClick`. Modal não foi extraído para componente separado. |
| 4 | Classe `.input-field` no CSS | **Já feito** — existe na linha 88 do index.css |
| 5 | NotFound em português | **Pendente** — ainda está em inglês ("Oops! Page not found", "Return to Home") |

## Plano de Implementação

### 1. Correção 2 — Setup salva no Context

**AppContext.tsx:**
- Adicionar interface `CompanySetup` com campos: `companyName`, `totalSupply`, `partners`, `tokenTypes`, `hasVesting`, `cliffMonths`, `vestingMonths`, `transferRules`, `quorums`
- Adicionar `updateCompanySetup` ao `AppContextType` e ao Provider
- A função atualiza `companyName`, `totalSupply`, e converte os partners do setup para o formato `Partner[]` do contexto (incluindo pool de reserva)

**SetupPage.tsx:**
- Importar `useAppContext` e chamar `updateCompanySetup` no `handleFinish` antes do `navigate("/dashboard")`

### 2. Correção 3 — Extrair modal de criação de proposta

**Criar `src/components/CreateProposalModal.tsx`:**
- Extrair o modal (linhas 179-263 de VotacoesPage) para componente próprio
- Props: `open: boolean`, `onClose: () => void`, `onSubmit: (data) => void`
- Estado do formulário interno ao componente

**VotacoesPage.tsx:**
- Substituir o modal inline pelo componente `CreateProposalModal`

**DashboardPage.tsx:**
- Adicionar estado `modalOpen`, importar `CreateProposalModal`, conectar ao botão "+ Nova Proposta"

### 3. Correção 5 — NotFound em português

**NotFound.tsx:**
- Trocar textos para: "Página não encontrada", "A página que você procura não existe.", "Voltar para o início"

