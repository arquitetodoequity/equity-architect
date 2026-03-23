import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, Shield, CheckCircle2, X, Plus } from "lucide-react";

interface OnboardingPartner {
  name: string;
  percentage: number;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("Marketing");
  const [revenue, setRevenue] = useState("Até R$ 50k");
  const [partners, setPartners] = useState<OnboardingPartner[]>([
    { name: "Ricardo Alves", percentage: 40 },
    { name: "Ana Lima", percentage: 30 },
  ]);
  const [newName, setNewName] = useState("");
  const [newPercentage, setNewPercentage] = useState("");
  const [governance, setGovernance] = useState("moderate");

  const totalAllocated = partners.reduce((s, p) => s + p.percentage, 0);

  const addPartner = () => {
    const pct = parseInt(newPercentage);
    if (!newName.trim() || !pct || totalAllocated + pct > 100) return;
    setPartners([...partners, { name: newName, percentage: pct }]);
    setNewName("");
    setNewPercentage("");
  };

  const removePartner = (idx: number) => {
    setPartners(partners.filter((_, i) => i !== idx));
  };

  const governanceOptions = [
    { key: "simple", label: "Simples", desc: "Maioria simples (51%) — grupos pequenos de alta confiança" },
    { key: "moderate", label: "Moderado", desc: "Decisões importantes exigem 67% — padrão recomendado" },
    { key: "strict", label: "Rigoroso", desc: "Decisões críticas exigem 75% — maior proteção para todos" },
  ];

  const quorumTable = [
    { type: "Entrada de sócio", quorum: "67%" },
    { type: "Saída de sócio", quorum: "67%" },
    { type: "Mudança de regras", quorum: "75%" },
    { type: "Encerramento", quorum: "100%" },
  ];

  const stepIcons = [Building2, Users, Shield, CheckCircle2];
  const StepIcon = stepIcons[step - 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-fast" style={{ width: `${(step / 4) * 100}%` }} />
      </div>
      <div className="px-6 py-3 text-xs text-muted-foreground">
        Etapa {step} de 4
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-8">
          <div className="flex justify-center">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${step === 4 ? "bg-success/10 text-success animate-scale-in" : "bg-primary/10 text-primary"}`}>
              <StepIcon className="h-8 w-8" />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 text-center">
              <div>
                <h1 className="text-2xl font-medium">Bem-vindo ao Arquiteto do Equity</h1>
                <p className="text-sm text-muted-foreground mt-2">Vamos configurar sua empresa em menos de 5 minutos.</p>
              </div>
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-sm font-medium">Nome da empresa</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Apex Marketing Agency"
                    className="mt-1 w-full h-10 px-4 rounded-lg border border-border bg-background text-sm transition-fast focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Setor</label>
                  <select value={sector} onChange={(e) => setSector(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                    {["Marketing", "Finanças", "Contabilidade", "BPO", "Vendas", "Tecnologia", "Outro"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Faturamento mensal</label>
                  <select value={revenue} onChange={(e) => setRevenue(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
                    {["Até R$ 50k", "R$ 50k–100k", "R$ 100k–300k", "Acima de R$ 300k"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <div>
                <h1 className="text-2xl font-medium">Quem são os sócios?</h1>
                <p className="text-sm text-muted-foreground mt-2">Adicione os sócios e suas participações.</p>
              </div>
              <div className="space-y-3 text-left">
                {partners.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
                    <span className="flex-1 text-sm font-medium">{p.name}</span>
                    <span className="text-sm font-bold text-gold">{p.percentage}%</span>
                    <button onClick={() => removePartner(i)} className="text-muted-foreground hover:text-destructive transition-fast">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome do sócio"
                    className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm"
                  />
                  <input
                    value={newPercentage}
                    onChange={(e) => setNewPercentage(e.target.value)}
                    placeholder="%"
                    className="w-16 h-10 px-3 rounded-lg border border-border bg-background text-sm text-center"
                  />
                  <button
                    onClick={addPartner}
                    className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Adicionar
                  </button>
                </div>
                {/* Progress */}
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-full bg-primary rounded-full transition-fast" style={{ width: `${totalAllocated}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{totalAllocated}% alocado — {100 - totalAllocated}% disponível</p>
                </div>
                <p className="text-xs text-muted-foreground">Você pode ajustar as participações a qualquer momento.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div>
                <h1 className="text-2xl font-bold">Como as decisões serão tomadas?</h1>
                <p className="text-sm text-muted-foreground mt-2">Escolha o modelo de governança.</p>
              </div>
              <div className="space-y-3 text-left">
                {governanceOptions.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGovernance(g.key)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-fast ${
                      governance === g.key ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="text-sm font-bold">{g.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{g.desc}</p>
                  </button>
                ))}
              </div>
              <div className="rounded-lg border border-border overflow-hidden text-left">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface">
                      <th className="px-4 py-2 font-medium text-muted-foreground text-left">Tipo de decisão</th>
                      <th className="px-4 py-2 font-medium text-muted-foreground text-left">Quórum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quorumTable.map((q, i) => (
                      <tr key={q.type} className={i % 2 === 1 ? "bg-surface/50" : ""}>
                        <td className="px-4 py-2">{q.type}</td>
                        <td className="px-4 py-2 font-medium">{q.quorum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div>
                <h1 className="text-2xl font-bold">Tudo pronto!</h1>
                <p className="text-sm text-muted-foreground mt-2">Seu sistema de cotas está configurado.</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-6 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Empresa</span>
                  <span className="font-medium">{companyName || "Apex Marketing Agency"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sócios</span>
                  <span className="font-medium">{partners.length} cadastrados ({partners.map((p) => `${p.name} ${p.percentage}%`).join(", ")})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pool de reserva</span>
                  <span className="font-medium">{100 - totalAllocated}% disponível</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Governança</span>
                  <span className="font-medium">Quórum {governance === "simple" ? "simples (51%)" : governance === "moderate" ? "moderado (67%)" : "rigoroso (75%)"}</span>
                </div>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  Um acordo digital será enviado para todos os sócios assinarem.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium transition-fast hover:bg-surface"
              >
                Voltar
              </button>
            )}
            <button
              onClick={() => (step < 4 ? setStep(step + 1) : navigate("/dashboard"))}
              className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90"
            >
              {step < 4 ? "Continuar" : "Começar a usar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
