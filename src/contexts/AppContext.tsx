import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  companyId: string | null;
  partners: Partner[];
  proposals: Proposal[];
  history: HistoryEvent[];
  totalSupply: number;
  systemCreatedDate: string;
  currentUser: { name: string; company: string; initials: string };
  loading: boolean;
}

interface AppContextType extends AppState {
  castVote: (proposalId: string, partnerName: string, vote: "approved" | "rejected") => void;
  addProposal: (proposal: Omit<Proposal, "id" | "votes" | "status" | "approvalPercentage">) => void;
  updateCompanySetup: (setup: CompanySetup) => void;
  refreshData: () => Promise<void>;
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const emptyState: AppState = {
  companyName: "",
  companyId: null,
  partners: [],
  proposals: [],
  history: [],
  totalSupply: 1000000,
  systemCreatedDate: "",
  currentUser: { name: "", company: "", initials: "" },
  loading: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth();
  const [state, setState] = useState<AppState>(emptyState);

  const loadFromDatabase = async () => {
    if (!user && !isDemo) {
      setState({ ...emptyState, loading: false });
      return;
    }

    if (isDemo) {
      setState({
        companyName: "Empresa Demo",
        companyId: "demo",
        partners: [
          { id: "d1", name: "Ana Silva", role: "CEO", percentage: 40, tokens: 400000, status: "active", initials: "AS" },
          { id: "d2", name: "Bruno Costa", role: "CTO", percentage: 30, tokens: 300000, status: "active", initials: "BC" },
          { id: "d3", name: "Carla Dias", role: "COO", percentage: 20, tokens: 200000, status: "active", initials: "CD" },
          { id: "d4", name: "Pool de Reserva", role: "—", percentage: 10, tokens: 100000, status: "reserve", initials: "PR" },
        ],
        proposals: [
          {
            id: "dp1",
            number: "#001",
            title: "Aprovação de novo sócio investidor",
            description: "Proposta para entrada de investidor-anjo com 5% de participação.",
            status: "active",
            quorum: 67,
            approvalPercentage: 57,
            daysRemaining: 5,
            votes: [
              { partner: "Ana Silva", status: "approved", tokens: 400000 },
              { partner: "Bruno Costa", status: "pending", tokens: 300000 },
              { partner: "Carla Dias", status: "pending", tokens: 200000 },
            ],
            date: new Date().toLocaleDateString("pt-BR"),
          },
          {
            id: "dp2",
            number: "#002",
            title: "Distribuição de lucros Q1 2026",
            description: "Distribuição proporcional dos lucros do primeiro trimestre.",
            status: "approved",
            quorum: 51,
            approvalPercentage: 100,
            votes: [
              { partner: "Ana Silva", status: "approved", tokens: 400000 },
              { partner: "Bruno Costa", status: "approved", tokens: 300000 },
              { partner: "Carla Dias", status: "approved", tokens: 200000 },
            ],
            date: new Date(Date.now() - 7 * 86400000).toLocaleDateString("pt-BR"),
            participation: "100%",
          },
        ],
        history: [
          { id: "dh1", date: "jan/2026", description: "Sistema criado. Cotas iniciais distribuídas.", color: "blue" },
          { id: "dh2", date: "mar/2026", description: "Distribuição de lucros Q1 2026 (aprovada)", color: "green" },
        ],
        totalSupply: 1000000,
        systemCreatedDate: "15 de janeiro de 2026",
        currentUser: { name: "Usuário Demo", company: "Empresa Demo", initials: "UD" },
        loading: false,
      });
      return;
    }

    try {
      // Get user profile with company_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) {
        setState({
          ...emptyState,
          loading: false,
          currentUser: {
            name: user.user_metadata?.full_name || user.email || "",
            company: "",
            initials: getInitials(user.user_metadata?.full_name || user.email || "U"),
          },
        });
        return;
      }

      const companyId = profile.company_id;

      // Fetch company, partners, proposals, votes in parallel
      const [companyRes, partnersRes, proposalsRes] = await Promise.all([
        supabase.from("companies").select("*").eq("id", companyId).single(),
        supabase.from("partners").select("*").eq("company_id", companyId).order("created_at"),
        supabase.from("proposals").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      ]);

      const company = companyRes.data;
      const dbPartners = partnersRes.data || [];
      const dbProposals = proposalsRes.data || [];

      // Fetch votes for all proposals
      const proposalIds = dbProposals.map((p) => p.id);
      let dbVotes: any[] = [];
      if (proposalIds.length > 0) {
        const { data } = await supabase.from("votes").select("*").in("proposal_id", proposalIds);
        dbVotes = data || [];
      }

      // Map partners
      const mappedPartners: Partner[] = dbPartners.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role || "—",
        percentage: Number(p.percentage),
        tokens: p.token_amount,
        status: p.status === "active" ? "active" as const : "reserve" as const,
        initials: getInitials(p.name),
      }));

      // Map proposals with votes
      const mappedProposals: Proposal[] = dbProposals.map((p, i) => {
        const pVotes = dbVotes.filter((v) => v.proposal_id === p.id);
        const partnerMap = new Map(dbPartners.map((pt) => [pt.id, pt]));

        const votes: Vote[] = pVotes.map((v) => ({
          partner: partnerMap.get(v.partner_id)?.name || "Desconhecido",
          status: v.vote === "approve" ? "approved" as const : "rejected" as const,
          tokens: v.token_weight,
        }));

        // For open proposals, add pending votes for partners who haven't voted
        if (p.status === "open") {
          const votedPartnerIds = new Set(pVotes.map((v) => v.partner_id));
          dbPartners
            .filter((pt) => pt.status === "active" && !votedPartnerIds.has(pt.id))
            .forEach((pt) => {
              votes.push({
                partner: pt.name,
                status: "pending",
                tokens: pt.token_amount,
              });
            });
        }

        const totalVotingTokens = votes.reduce((s, v) => s + v.tokens, 0);
        const approvedTokens = votes.filter((v) => v.status === "approved").reduce((s, v) => s + v.tokens, 0);
        const approvalPercentage = totalVotingTokens > 0 ? Math.round((approvedTokens / totalVotingTokens) * 100) : 0;

        const closesAt = p.closes_at ? new Date(p.closes_at) : null;
        const now = new Date();
        const daysRemaining = closesAt ? Math.max(0, Math.ceil((closesAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : undefined;

        return {
          id: p.id,
          number: `#${String(dbProposals.length - i).padStart(3, "0")}`,
          title: p.title,
          description: p.description || "",
          status: p.status === "open" ? "active" as const : p.status as "approved" | "rejected",
          quorum: p.quorum_required,
          approvalPercentage,
          daysRemaining,
          votes,
          date: new Date(p.created_at).toLocaleDateString("pt-BR"),
          participation: p.status !== "open" ? `${approvalPercentage}%` : undefined,
        };
      });

      // Build history from proposals
      const history: HistoryEvent[] = [
        {
          id: "setup",
          date: new Date(company?.created_at || "").toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
          description: "Sistema criado. Cotas iniciais distribuídas.",
          color: "blue",
        },
        ...dbProposals
          .filter((p) => p.status !== "open")
          .map((p) => ({
            id: p.id,
            date: new Date(p.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
            description: `${p.title} (${p.status === "approved" ? "aprovada" : "rejeitada"})`,
            color: "green" as const,
          })),
      ];

      setState({
        companyName: company?.name || "",
        companyId,
        partners: mappedPartners,
        proposals: mappedProposals,
        history,
        totalSupply: company?.total_supply || 1000000,
        systemCreatedDate: new Date(company?.created_at || "").toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        currentUser: {
          name: profile.full_name || user.email || "",
          company: company?.name || "",
          initials: getInitials(profile.full_name || user.email || "U"),
        },
        loading: false,
      });
    } catch (err) {
      console.error("Error loading data:", err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadFromDatabase();
  }, [user, isDemo]);

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

  const addProposal = async (proposal: Omit<Proposal, "id" | "votes" | "status" | "approvalPercentage">) => {
    if (!state.companyId) {
      // Fallback to local-only
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
      return;
    }

    // Save to database
    const deadlineDays = proposal.daysRemaining || 3;
    const closesAt = new Date();
    closesAt.setDate(closesAt.getDate() + deadlineDays);

    const { data: { user: authUser } } = await supabase.auth.getUser();

    const { error } = await supabase.from("proposals").insert({
      company_id: state.companyId,
      title: proposal.title,
      description: proposal.description,
      quorum_required: proposal.quorum,
      closes_at: closesAt.toISOString(),
      created_by: authUser?.id || null,
    });

    if (error) {
      console.error("Error creating proposal:", error);
      return;
    }

    // Reload data
    await loadFromDatabase();
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

  const refreshData = async () => {
    await loadFromDatabase();
  };

  return (
    <AppContext.Provider value={{ ...state, castVote, addProposal, updateCompanySetup, refreshData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
