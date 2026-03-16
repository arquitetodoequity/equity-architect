import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Partner {
  id: string;
  name: string;
  role: string;
  percentage: number;
  tokens: number;
  status: "active" | "reserve";
  initials: string;
}

export interface Vote {
  partner: string;
  status: "approved" | "rejected" | "pending";
  tokens: number;
}

export interface Proposal {
  id: string;
  number: string;
  title: string;
  description: string;
  status: "active" | "approved" | "rejected";
  quorum: number;
  approvalPercentage: number;
  daysRemaining?: number;
  votes: Vote[];
  date: string;
  participation?: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  description: string;
  color: "blue" | "green";
}

export interface CompanySetup {
  companyName: string;
  totalSupply: number;
  partners: { name: string; role: string; percentage: number; type: string }[];
  poolReserve: number;
  tokenTypes: string[];
  hasVesting: boolean;
  cliffMonths: number;
  vestingMonths: number;
  vestingType: string;
  transferRules: {
    between: string;
    external: string;
    exit: string;
    nonCompete: boolean;
    nonCompeteMonths: number;
  };
  quorums: {
    operational: number;
    entry: number;
    exit: number;
    transfer: number;
    rulesChange: number;
    dissolution: number;
  };
  newPartnerMode: string;
  votingDeadline: string;
}

interface AppState {
  companyName: string;
  partners: Partner[];
  proposals: Proposal[];
  history: HistoryEvent[];
  totalSupply: number;
  systemCreatedDate: string;
  currentUser: { name: string; company: string; initials: string };
}

interface AppContextType extends AppState {
  castVote: (proposalId: string, partnerName: string, vote: "approved" | "rejected") => void;
  addProposal: (proposal: Omit<Proposal, "id" | "votes" | "status" | "approvalPercentage">) => void;
  updateCompanySetup: (setup: CompanySetup) => void;
}

const defaultState: AppState = {
  companyName: "Apex Marketing Agency",
  totalSupply: 1000000,
  systemCreatedDate: "15 de março de 2025",
  currentUser: { name: "Ricardo Alves", company: "Apex Marketing Agency", initials: "RA" },
  partners: [
    { id: "1", name: "Ricardo Alves", role: "CEO", percentage: 40, tokens: 400000, status: "active", initials: "RA" },
    { id: "2", name: "Ana Lima", role: "COO", percentage: 30, tokens: 300000, status: "active", initials: "AL" },
    { id: "3", name: "Bruno Costa", role: "Head de Vendas", percentage: 20, tokens: 200000, status: "active", initials: "BC" },
    { id: "4", name: "Pool de Reserva", role: "—", percentage: 10, tokens: 100000, status: "reserve", initials: "PR" },
  ],
  proposals: [
    {
      id: "4",
      number: "#004",
      title: "Transferência de 5% do pool de reserva para Marina Torres",
      description: "Marina Torres concluiu 6 meses como Head de Produto e atingiu as metas de onboarding. Proposta de transferência de 50.000 tokens do pool para seu endereço.",
      status: "active",
      quorum: 67,
      approvalPercentage: 60,
      daysRemaining: 3,
      date: "09/03/2026",
      votes: [
        { partner: "Ricardo Alves", status: "approved", tokens: 400000 },
        { partner: "Ana Lima", status: "pending", tokens: 300000 },
        { partner: "Bruno Costa", status: "pending", tokens: 200000 },
      ],
    },
    {
      id: "3",
      number: "#003",
      title: "Entrada de Marina Torres",
      description: "Aprovação da entrada de Marina Torres como parceira.",
      status: "approved",
      quorum: 67,
      approvalPercentage: 90,
      date: "28/02/2026",
      participation: "90%",
      votes: [],
    },
    {
      id: "2",
      number: "#002",
      title: "Ajuste de cota: +5% Bruno Costa",
      description: "Transferência de 5% do pool para Bruno Costa.",
      status: "approved",
      quorum: 67,
      approvalPercentage: 100,
      date: "12/06/2025",
      participation: "100%",
      votes: [],
    },
    {
      id: "1",
      number: "#001",
      title: "Configuração inicial do sistema",
      description: "Criação do sistema e distribuição inicial de cotas.",
      status: "approved",
      quorum: 67,
      approvalPercentage: 100,
      date: "15/03/2025",
      participation: "100%",
      votes: [],
    },
  ],
  history: [
    { id: "1", date: "Mar 2025", description: "Sistema criado. Cotas iniciais distribuídas.", color: "blue" },
    { id: "2", date: "Jun 2025", description: "Bruno Costa recebeu adicional de 5% (transferência do pool).", color: "green" },
    { id: "3", date: "Fev 2026", description: "Entrada de Marina Torres aprovada (proposta #003, 90% dos votos).", color: "green" },
  ],
};

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const castVote = (proposalId: string, partnerName: string, vote: "approved" | "rejected") => {
    setState((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p) => {
        if (p.id !== proposalId) return p;
        const updatedVotes = p.votes.map((v) =>
          v.partner === partnerName ? { ...v, status: vote } : v
        ) as Vote[];
        const totalVotingTokens = updatedVotes.reduce((s, v) => s + v.tokens, 0);
        const approvedTokens = updatedVotes.filter((v) => v.status === "approved").reduce((s, v) => s + v.tokens, 0);
        const approvalPercentage = Math.round((approvedTokens / totalVotingTokens) * 100);
        return { ...p, votes: updatedVotes, approvalPercentage };
      }),
    }));
  };

  const addProposal = (proposal: Omit<Proposal, "id" | "votes" | "status" | "approvalPercentage">) => {
    const newProposal: Proposal = {
      ...proposal,
      id: String(state.proposals.length + 1),
      status: "active",
      approvalPercentage: 0,
      votes: state.partners
        .filter((p) => p.status === "active")
        .map((p) => ({ partner: p.name, status: "pending" as const, tokens: p.tokens })),
    };
    setState((prev) => ({ ...prev, proposals: [newProposal, ...prev.proposals] }));
  };

  const updateCompanySetup = (setup: CompanySetup) => {
    const supply = setup.totalSupply;
    const newPartners: Partner[] = setup.partners.map((p, i) => ({
      id: String(i + 1),
      name: p.name,
      role: p.role,
      percentage: p.percentage,
      tokens: Math.round((p.percentage / 100) * supply),
      status: "active" as const,
      initials: getInitials(p.name),
    }));

    if (setup.poolReserve > 0) {
      newPartners.push({
        id: String(newPartners.length + 1),
        name: "Pool de Reserva",
        role: "—",
        percentage: setup.poolReserve,
        tokens: Math.round((setup.poolReserve / 100) * supply),
        status: "reserve",
        initials: "PR",
      });
    }

    const firstPartner = setup.partners[0];
    setState((prev) => ({
      ...prev,
      companyName: setup.companyName,
      totalSupply: supply,
      partners: newPartners,
      currentUser: {
        name: firstPartner?.name || prev.currentUser.name,
        company: setup.companyName,
        initials: firstPartner ? getInitials(firstPartner.name) : prev.currentUser.initials,
      },
      systemCreatedDate: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }),
      proposals: [],
      history: [
        { id: "1", date: new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" }), description: "Sistema criado. Cotas iniciais distribuídas.", color: "blue" },
      ],
    }));
  };

  return (
    <AppContext.Provider value={{ ...state, castVote, addProposal, updateCompanySetup }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
