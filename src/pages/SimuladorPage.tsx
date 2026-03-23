import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Info, Download } from "lucide-react";
import { toast } from "sonner";

export default function SimuladorPage() {
  const { partners } = useAppContext();
  const [valor, setValor] = useState("50000");
  const [periodo, setPeriodo] = useState("Fevereiro 2026");
  const [showResults, setShowResults] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);

  const numericVal = parseFloat(valor.replace(/\D/g, "")) || 0;
  const activePartners = partners.filter((p) => p.status === "active");
  const poolPartner = partners.find((p) => p.status === "reserve");

  const results = activePartners.map((p) => ({
    ...p,
    amount: numericVal * (p.percentage / 100),
  }));

  const totalDistributed = results.reduce((s, r) => s + r.amount, 0);
  const poolAmount = poolPartner ? numericVal * (poolPartner.percentage / 100) : 0;

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setValor(raw);
  };

  const displayValue = numericVal ? numericVal.toLocaleString("pt-BR") : "";

  const handleConfirm = () => {
    setConfirmModal(false);
    toast.success("Distribuição registrada com sucesso");
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <p className="section-label mb-1">Simulador &gt; Distribuição</p>
        <h1 className="text-2xl font-medium">Simulador de Distribuição</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calcule o valor de cada sócio. O pagamento continua sendo feito pelo seu banco.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Este simulador é apenas um calculador. Nenhum valor é transferido por aqui. Use os resultados para executar o pagamento no seu banco.
        </p>
      </div>

      {/* Configuration card */}
      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <h2 className="text-lg font-medium">Configurar distribuição</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Valor total a distribuir</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <input
                value={displayValue}
                onChange={handleInputChange}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm transition-fast focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Período de referência</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
            >
              {["Janeiro 2026", "Fevereiro 2026", "Março 2026"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Base de cálculo</label>
            <select className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm" disabled>
              <option>Cotas atuais (registradas em 01/03/2026)</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowResults(true)}
          className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90"
        >
          Calcular distribuição
        </button>
      </div>

      {/* Results */}
      {showResults && numericVal > 0 && (
        <div className="rounded-lg border border-border bg-background">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-medium">Resultado da distribuição — {periodo}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Valor total: {formatCurrency(numericVal)} · Base: cotas de 01/03/2026 · {activePartners.length} sócios
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface text-left">
                  <th className="px-6 py-3 font-medium text-muted-foreground">Sócio</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Cota</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Cálculo</th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">Valor a receber</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id} className={`transition-fast hover:bg-surface ${i % 2 === 1 ? "bg-surface/50" : ""}`}>
                    <td className="px-6 py-3 font-medium">{r.name}</td>
                    <td className="px-6 py-3 font-bold text-gold">{r.percentage}%</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {r.percentage}% × {formatCurrency(numericVal)}
                    </td>
                    <td className="px-6 py-3 font-bold text-gold">{formatCurrency(r.amount)}</td>
                  </tr>
                ))}
                {poolPartner && (
                  <tr className="bg-surface/50">
                    <td className="px-6 py-3 font-medium text-muted-foreground">{poolPartner.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{poolPartner.percentage}%</td>
                    <td className="px-6 py-3 text-muted-foreground">—</td>
                    <td className="px-6 py-3 text-muted-foreground">não distribuído</td>

                  </tr>
                )}
                <tr className="border-t border-border font-bold">
                  <td className="px-6 py-3">TOTAL</td>
                  <td className="px-6 py-3">100%</td>
                  <td className="px-6 py-3"></td>
                  <td className="px-6 py-3 text-gold">{formatCurrency(totalDistributed)}</td>
                  <td className="px-6 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
            Os {poolPartner?.percentage}% do pool ({formatCurrency(poolAmount)}) não foram distribuídos. Inclua-os em uma proposta de alocação se desejar.
          </div>
          <div className="px-6 py-4 flex gap-3">
            <button className="h-9 px-4 rounded-lg border border-border text-sm font-medium transition-fast hover:bg-surface flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportar como PDF
            </button>
            <button
              onClick={() => setConfirmModal(true)}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90"
            >
              Registrar distribuição realizada
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setConfirmModal(false)} />
          <div className="relative bg-background rounded-xl shadow-lg border border-border w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-medium">Confirmar registro</h2>
            <p className="text-sm text-muted-foreground">
              Confirmar que o pagamento foi realizado em {new Date().toLocaleDateString("pt-BR")} via banco?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium transition-fast hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
