

# Revisão Visual — Alinhamento com Brand Guidelines

## Diagnóstico: O que está fora do briefing

Comparando o código atual com as imagens do brand guide, identifiquei estas divergências:

| Elemento | Atual | Briefing |
|---|---|---|
| **Tipografia H1/H2** | `font-bold` (700) | weight 500 (`font-medium`) |
| **Labels de seção** | `text-xs text-muted-foreground` | 11-13px, **uppercase**, letter-spacing 0.08em |
| **Cor do texto principal** | `#111111` | `#000000` (preto absoluto) |
| **Botões primários** | `bg-[#2563EB]` (azul) | `bg-[#C5A059]` (ouro) com texto preto |
| **Botões secundários** | `border-border` | `border-[#2C2C2C]` ou `border-gold` |
| **Cards** | `shadow-sm` + `border` | **Sem sombra** (`shadow-none`), borda 0.5px |
| **Cantos** | `rounded-lg` (8px) em tudo | 8px cards, **6px botões** |
| **Efeitos** | Alguns hover com shadow-md | Zero gradiente, zero glow, flat |
| **Body text** | `text-sm` (14px) | 15-16px (entre `text-sm` e `text-base`) |
| **Paleta secundária** | Grafite/Carvão ausentes | Adicionar #1A1A1A e #2C2C2C |

## Plano de Implementação

### 1. Atualizar CSS variables e base styles (`src/index.css`)

- Mudar `--foreground` para `#000000`
- Adicionar variáveis para grafite (#1A1A1A) e carvão (#2C2C2C)
- Mudar `--primary` de azul para ouro (#C5A059)
- Manter azul como variável separada (ex: `--action`) para sidebar e links
- Headings: `font-medium` (500) em vez de `font-bold` (700)
- Adicionar classe utilitária `.section-label` para labels uppercase com tracking
- Remover `shadow-sm` default — sem sombra em cards
- Adicionar `.btn-primary` com bg ouro, `.btn-secondary` com borda carvão
- Body font-size base: 15px

### 2. Atualizar `tailwind.config.ts`

- Adicionar cores `grafite`, `carvao` no theme
- Ajustar `borderRadius` para botões (6px)
- Manter sidebar colors como estão (modo Corporate Noir já funciona lá)

### 3. Atualizar todas as telas (7 arquivos)

Aplicar de forma consistente em cada arquivo:

**Em todas as telas:**
- H1/H2: trocar `font-bold` por `font-medium`
- Labels de seção (breadcrumbs, headers de tabela): adicionar `uppercase tracking-widest`
- Cards: remover `shadow-sm`, usar `shadow-none` e borda fina
- Botões primários: `bg-gold text-black` em vez de `bg-primary text-white`
- Hover de cards: remover `hover:shadow-md`, manter apenas `hover:bg-surface`
- Números-chave em ouro: manter como está (já correto)

**Arquivos afetados:**
- `LoginPage.tsx` — botões de login, tipografia
- `DashboardPage.tsx` — cards, tabela, botão Nova Proposta
- `SociosPage.tsx` — cards, tabela
- `VotacoesPage.tsx` — cards, botão Criar Proposta
- `SimuladorPage.tsx` — cards, botões
- `SetupPage.tsx` — botões, campos
- `OnboardingPage.tsx` — botões, cards de governança
- `ConfiguracoesPage.tsx` — tipografia
- `CreateProposalModal.tsx` — botões
- `AppSidebar.tsx` — manter como está (modo Noir correto)
- `ResetPasswordPage.tsx` — botões
- `NotFound.tsx` — tipografia

### 4. Sidebar — sem alteração

A sidebar já opera em modo Corporate Noir (fundo escuro, texto branco, ouro como acento). Está alinhada com o briefing.

### Escopo total

- ~12 arquivos editados
- Sem mudança de banco de dados
- Sem mudança de lógica — apenas visual
- Resultado: interface alinhada com o brand guide "Luminous Minimalist" com botões ouro, sem sombras, tipografia weight 500

