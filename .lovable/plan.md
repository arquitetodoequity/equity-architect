

# O que falta para cumprir o propósito da ferramenta

Baseado nos 3 documentos (Product Vision, Tech Manual, Off-Grid Manual v4) e no estado atual do código, aqui está a análise completa.

---

## O que o MVP precisa entregar (3 módulos)

Segundo o **Product Vision**, o MVP vende com 3 módulos — e só isso:

1. **Onboarding sem fricção** — login social, setup rápido
2. **Cap Table visual** — dashboard, simulador, histórico
3. **Governança e acordo** — votações ponderadas, geração de MOU

---

## O que já está construído e funciona

| Funcionalidade | Status |
|---|---|
| Login (email/senha, visual) | ✅ Feito (mock, sem auth real) |
| Setup wizard (6 etapas) | ✅ Feito (salva no Context) |
| Dashboard / Cap Table visual | ✅ Feito (gráfico, tabela, timeline) |
| Simulador de distribuição | ✅ Feito (cálculo dinâmico em BRL) |
| Votações com peso ponderado | ✅ Feito (aprovar/rejeitar, barra de quórum) |
| Criação de propostas (modal) | ✅ Feito (compartilhado Dashboard + Votações) |
| Sidebar com navegação | ✅ Feito |
| Página de Sócios | ✅ Feito (tabela + gráfico) |
| Banco de dados (tabelas criadas) | ✅ Feito (8 tabelas no Lovable Cloud) |

---

## O que falta — ordenado por prioridade

### PRIORIDADE 1 — Bloqueante para validação com clientes

| # | O que falta | Por que é crítico |
|---|---|---|
| 1 | **Autenticação real** (email/senha + Google) | Sem auth, nenhum dado persiste por usuário. Os dados ficam só no Context e somem ao recarregar. |
| 2 | **Conectar telas ao banco de dados** | Setup, Dashboard, Votações e Simulador usam apenas dados mockados no Context. Nada é salvo no Lovable Cloud. |
| 3 | **Convite de sócios por email** | O Product Vision define: "parceiro recebe convite por email, clica, cria senha, vê a própria cota". Sem isso, só o dono usa o sistema. |
| 4 | **Geração automática do MOU** | Módulo 3 do MVP. Aprovação de proposta deve gerar um documento (acordo digital) com os dados da empresa e enviar para assinatura. |

### PRIORIDADE 2 — Importante para a experiência completa

| # | O que falta | Detalhe |
|---|---|---|
| 5 | **Perfil individual do sócio** | Botão "Ver" na tabela existe mas não abre nada. Deveria mostrar: cota, histórico, evolução. |
| 6 | **Notificações** | Sócio precisa ser avisado quando uma votação abre ou quando precisa agir. |
| 7 | **Tela de Configurações funcional** | Atualmente mostra apenas "em breve". Deveria permitir editar regras de governança, quórum, dados da empresa. |
| 8 | **Histórico de distribuições** | O simulador calcula mas não guarda registro. Deveria listar distribuições já realizadas. |
| 9 | **Exportação PDF do cap table** | Mencionado no prompt original e no Product Vision como necessidade para reuniões. |

### PRIORIDADE 3 — Polimento

| # | O que falta | Detalhe |
|---|---|---|
| 10 | **Responsividade mobile** | Sidebar colapsa mas nenhuma tela foi otimizada para celular. |
| 11 | **Estados vazios** | Quando não há votações ou sócios, deveria mostrar ilustração + mensagem orientadora. |
| 12 | **Proteção de rotas** | Qualquer pessoa acessa /dashboard direto pela URL sem estar logada. |

---

## O que NÃO entra agora (conforme Product Vision)

- Integração blockchain (ERC-4337, Polygon) — é Fase 2+
- Snapshot API — substituído por votação interna no MVP
- Clicksign API — pode ser simulada inicialmente
- KYC, Soulbound Token, movimentação financeira

---

## Recomendação de próximos passos

A ordem lógica para avançar é:

1. **Autenticação real** com email/senha (Lovable Cloud Auth)
2. **Persistir dados no banco** — Setup salva nas tabelas, Dashboard lê do banco
3. **Convite de sócios** — email com link para criar conta e ver cota
4. **Perfil do sócio** — tela individual com detalhes
5. **Geração do MOU** — PDF automático baseado nos dados do setup

Quer que eu comece pela autenticação real e persistência de dados?

