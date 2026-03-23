import { useAppContext } from "@/contexts/AppContext";
import { Eye } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const PIE_COLORS = ["#1E3A8A", "#2563EB", "#60A5FA", "#CBD5E1"];

export default function SociosPage() {
  const { partners, companyName } = useAppContext();
  const pieData = partners.map((p) => ({ name: p.name, value: p.percentage }));

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <p className="section-label mb-1">Sócios</p>
        <h1 className="text-2xl font-medium">Sócios — {companyName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão detalhada de todos os sócios e participações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Table */}
        <div className="rounded-lg border border-border bg-background">
          <div className="p-6 pb-4 flex items-center gap-3">
            <h2 className="text-lg font-medium">Todos os sócios</h2>
            <span className="h-5 px-2 rounded-full bg-success/10 text-success text-xs font-medium flex items-center">
              {partners.filter((p) => p.status === "active").length} ativos
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface text-left">
                  <th className="px-6 py-3 font-medium text-muted-foreground">Sócio</th>
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
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {p.initials}
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{p.role}</td>
                    <td className="px-6 py-3 font-bold text-gold">{p.percentage}%</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.tokens.toLocaleString("pt-BR")}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}>
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

        {/* Chart */}
        <div className="rounded-lg border border-border bg-background shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Distribuição</h2>
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
      </div>
    </div>
  );
}
