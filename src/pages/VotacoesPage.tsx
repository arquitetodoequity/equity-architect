import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Plus, Calendar, Users, Check, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import CreateProposalModal from "@/components/CreateProposalModal";

export default function VotacoesPage() {
  const { proposals, castVote, addProposal } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);

  const activeProposals = proposals.filter((p) => p.status === "active");
  const completedProposals = proposals.filter((p) => p.status !== "active");

  const handleCreateProposal = (formData: { title: string; description: string; quorum: string; deadline: string }) => {
    addProposal({
      number: `#${String(proposals.length + 1).padStart(3, "0")}`,
      title: formData.title,
      description: formData.description,
      quorum: parseInt(formData.quorum),
      daysRemaining: formData.deadline === "24h" ? 1 : formData.deadline === "48h" ? 2 : formData.deadline === "72h" ? 3 : 7,
      date: new Date().toLocaleDateString("pt-BR"),
    });
    setModalOpen(false);
    toast.success("Proposta criada com sucesso");
  };

  const handleVote = (proposalId: string, vote: "approved" | "rejected") => {
    castVote(proposalId, "Ana Lima", vote);
    toast.success(vote === "approved" ? "Voto de aprovação registrado" : "Voto de rejeição registrado");
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="section-label mb-1">Governança &gt; Votações</p>
          <h1 className="text-2xl font-medium">Governança — Votações</h1>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90 flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" /> Criar proposta
        </button>
      </div>

      {/* Active proposals */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-medium">Em andamento</h2>
          <span className="h-5 px-2 rounded-full bg-warning/10 text-warning text-xs font-medium flex items-center">
            {activeProposals.length} ativa{activeProposals.length !== 1 ? "s" : ""}
          </span>
        </div>

        {activeProposals.length === 0 ? (
          <div className="rounded-lg border border-border bg-background p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma votação em aberto.</p>
          </div>
        ) : (
          activeProposals.map((p) => (
            <div key={p.id} className="rounded-lg border border-warning bg-[#FFFBEB] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-medium">
                  Em votação
                </span>
                <span className="text-sm text-muted-foreground">Proposta {p.number}</span>
              </div>
              <h3 className="text-lg font-medium">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Encerra em {p.daysRemaining} dias</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Quórum: {p.quorum}%</span>
                <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> {p.approvalPercentage}% aprovado</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-warning/20 rounded-full relative">
                <div className="h-full bg-warning rounded-full transition-fast" style={{ width: `${p.approvalPercentage}%` }} />
                <div className="absolute top-0 h-full border-r-2 border-dashed border-foreground/30" style={{ left: `${p.quorum}%` }} />
              </div>

              {/* Votes */}
              <div className="space-y-2">
                {p.votes.map((v) => (
                  <div key={v.partner} className="flex items-center gap-3 text-sm">
                    {v.status === "approved" ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : v.status === "rejected" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{v.partner}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className={v.status === "approved" ? "text-success" : v.status === "rejected" ? "text-destructive" : "text-muted-foreground"}>
                      {v.status === "approved" ? `Aprovado (${v.tokens.toLocaleString("pt-BR")} tokens)` : v.status === "rejected" ? "Rejeitado" : "Aguardando"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Vote buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleVote(p.id, "approved")}
                  className="h-10 rounded-lg bg-success text-primary-foreground font-medium text-sm transition-fast hover:opacity-90"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleVote(p.id, "rejected")}
                  className="h-10 rounded-lg border border-destructive text-destructive font-medium text-sm transition-fast hover:bg-destructive/5"
                >
                  Rejeitar
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Ao votar, um registro permanente será criado.</p>
            </div>
          ))
        )}
      </section>

      {/* Completed proposals */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-medium">Concluídas</h2>
          <span className="h-5 px-2 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            {completedProposals.length} propostas
          </span>
        </div>
        <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-left">
                <th className="px-6 py-3 font-medium text-muted-foreground">Proposta</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Resultado</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Participação</th>
                <th className="px-6 py-3 font-medium text-muted-foreground">Data</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {completedProposals.map((p, i) => (
                <tr key={p.id} className={`transition-fast hover:bg-surface ${i % 2 === 1 ? "bg-surface/50" : ""}`}>
                  <td className="px-6 py-3">
                    <span className="text-muted-foreground">{p.number}</span>{" "}
                    <span className="font-medium">{p.title}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                      Aprovada
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{p.participation}</td>
                  <td className="px-6 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-6 py-3">
                    <button className="text-xs text-primary transition-fast hover:underline">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <CreateProposalModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateProposal} />
    </div>
  );
}
