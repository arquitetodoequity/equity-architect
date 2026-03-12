import { useAppContext } from "@/contexts/AppContext";
import { Bell, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const PIE_COLORS = ["#1E3A8A", "#2563EB", "#60A5FA", "#CBD5E1"];

export default function DashboardPage() {
  const { partners, history, proposals, companyName } = useAppContext();
  const navigate = useNavigate();
  const activeProposal = proposals.find((p) => p.status === "active");

  const pieData = partners.map((p) => ({ name: p.name, value: p.percentage }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Dashboard &gt; Cap Table</p>
          <h1 className="text-2xl font-bold">Cap Table — {companyName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral das participações societárias</p>
        </div>
        <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90 flex items-center gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Nova Proposta
        </button>
      </div>

      {/* Active voting banner */}
      {activeProposal && (
        <div className="rounded-lg border border-warning bg-[#FFFBEB] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Bell className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                Votação em aberto: {activeProposal.title}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground">{activeProposal.daysRemaining} dias restantes</span>
                <div className="flex-1 max-w-48 h-2 bg-warning/20 rounded-full relative">
                  <div
                    className="h-full bg-warning rounded-full"
                    style={{ width: `${activeProposal.approvalPercentage}%` }}
                  />
                  <div
                    className="absolute top-0 h-full border-r-2 border-dashed border-foreground/30"
                    style={{ left: `${activeProposal.quorum}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{activeProposal.approvalPercentage}%</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/votacoes")}
            className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium transition-fast hover:opacity-90 shrink-0"
          >
            Ver votação
          </button>
        </div>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Partners table */}
          <div className="rounded-lg border border-border bg-background shadow-sm">
            <div className="p-6 pb-4 flex items-center gap-3">
              <h2 className="text-lg font-bold">Parceiros ativos</h2>
              <span className="h-5 px-2 rounded-full bg-success/10 text-success text-xs font-medium flex items-center">
                {partners.filter((p) => p.status === "active").length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface text-left">
                    <th className="px-6 py-3 font-medium text-muted-foreground">Parceiro</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Cargo</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Participação</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Tokens</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p, i) => (
                    <tr key={p.id} className={`transition-fast hover:bg-surface ${i % 2 === 1 ? "bg-surface/50" : ""}`}>
                      <td className="px-6 py-3 font-medium">{p.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{p.role}</td>
                      <td className="px-6 py-3 font-bold text-gold">{p.percentage}%</td>
                      <td className="px-6 py-3 text-muted-foreground">{p.tokens.toLocaleString("pt-BR")}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.status === "active" ? "Ativo" : "Reserva"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button className="h-7 px-3 rounded-md border border-border text-xs transition-fast hover:bg-surface flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
              Supply total: 1.000.000 tokens = 100%
            </div>
          </div>

          {/* History */}
          <div className="rounded-lg border border-border bg-background shadow-sm p-6">
            <h2 className="text-lg font-bold mb-6">Histórico de decisões</h2>
            <div className="space-y-6">
              {history.map((h, i) => (
                <div key={h.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full shrink-0 ${
                        h.color === "blue" ? "bg-primary" : "bg-success"
                      }`}
                    />
                    {i < history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{h.date}</p>
                    <p className="text-sm">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Pie chart */}
          <div className="rounded-lg border border-border bg-background shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Distribuição atual</h2>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" strokeWidth={2} stroke="hsl(var(--background))">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {partners.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-muted-foreground flex-1">{p.name}</span>
                  <span className="font-medium">{p.percentage}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t-2 border-gold" />
          </div>

          {/* Metric cards */}
          {[
            { label: "Parceiros ativos", value: "3", sub: "Sócios com cota alocada" },
            { label: "Pool disponível", value: "10%", sub: "Reserva para novos parceiros" },
            { label: "Última decisão", value: "28 fev 2026", sub: "Entrada de Marina Torres" },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-border bg-background shadow-sm p-6 transition-fast hover:shadow-md">
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-gold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
