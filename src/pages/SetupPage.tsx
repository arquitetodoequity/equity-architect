import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, Layers, Clock, ArrowLeftRight, Shield, CheckCircle2, Plus, X, Info, HelpCircle, Loader2 } from "lucide-react";
import { PieChart } from "lucide-react";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SetupPartner {
  name: string;
  role: string;
  percentage: number;
  type: string;
}

type TransferBetween = "free" | "approval" | "blocked";
type TransferExternal = "unanimous" | "preference" | "never";
type ExitRule = "fair_value" | "original_value" | "pool_return";
type NewPartnerMode = "pool" | "new_emission" | "both";
type VestingType = "time" | "milestone";

export default function SetupPage() {
  const navigate = useNavigate();
  const { updateCompanySetup } = useAppContext();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Step 1 — Company
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("Marketing");
  const [revenue, setRevenue] = useState("Até R$ 50k");
  const [totalSupply, setTotalSupply] = useState("1000000");

  // Step 2 — Partners
  const [partners, setPartners] = useState<SetupPartner[]>([]);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPct, setNewPct] = useState("");
  const [newType, setNewType] = useState("Fundador");
  const [poolReserve, setPoolReserve] = useState(10);

  // Step 3 — Token types
  const [tokenTypes, setTokenTypes] = useState<string[]>(["ON"]);
  const [tokenNotes, setTokenNotes] = useState("");

  // Step 4 — Vesting
  const [hasVesting, setHasVesting] = useState(false);
  const [hasCliff, setHasCliff] = useState(true);
  const [cliffMonths, setCliffMonths] = useState(12);
  const [vestingMonths, setVestingMonths] = useState(48);
  const [vestingType, setVestingType] = useState<VestingType>("time");
  const [milestoneDesc, setMilestoneDesc] = useState("");

  // Step 5 — Transfer rules
  const [transferBetween, setTransferBetween] = useState<TransferBetween>("approval");
  const [transferExternal, setTransferExternal] = useState<TransferExternal>("preference");
  const [exitRule, setExitRule] = useState<ExitRule>("fair_value");
  const [nonCompete, setNonCompete] = useState(false);
  const [nonCompeteMonths, setNonCompeteMonths] = useState(12);

  // Step 6 — Governance
  const [quorums, setQuorums] = useState({
    operational: 51,
    entry: 67,
    exit: 67,
    transfer: 67,
    rulesChange: 75,
    dissolution: 100,
  });
  const [newPartnerMode, setNewPartnerMode] = useState<NewPartnerMode>("pool");
  const [votingDeadline, setVotingDeadline] = useState("72h");

  const totalAllocated = partners.reduce((s, p) => s + p.percentage, 0);
  const totalWithPool = totalAllocated + poolReserve;

  const addPartner = () => {
    const pct = parseFloat(newPct);
    if (!newName.trim() || !pct || totalAllocated + pct + poolReserve > 100) return;
    setPartners([...partners, { name: newName, role: newRole, percentage: pct, type: newType }]);
    setNewName("");
    setNewRole("");
    setNewPct("");
  };

  const removePartner = (idx: number) => setPartners(partners.filter((_, i) => i !== idx));

  const toggleTokenType = (t: string) => {
    setTokenTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Get current user
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Não autenticado");

      // 1. Create company
      const { data: company, error: companyErr } = await supabase
        .from("companies")
        .insert({
          name: companyName,
          total_supply: parseInt(totalSupply) || 1000000,
          sector,
          monthly_revenue: revenue,
        })
        .select()
        .single();
      if (companyErr) throw companyErr;

      const companyId = company.id;

      // 2. Link profile to company
      await supabase.from("profiles").update({ company_id: companyId }).eq("id", authUser.id);

      // 3. Insert partners
      const partnerRows: {
        company_id: string;
        name: string;
        role: string;
        percentage: number;
        token_amount: number;
        partner_type: "founder" | "key_person" | "pool";
        status: "active" | "inactive" | "reserve";
      }[] = partners.map((p) => ({
        company_id: companyId,
        name: p.name,
        role: p.role,
        percentage: p.percentage,
        token_amount: Math.round((p.percentage / 100) * (parseInt(totalSupply) || 1000000)),
        partner_type: (p.type === "Fundador" ? "founder" : "key_person") as "founder" | "key_person" | "pool",
        status: "active" as "active" | "inactive" | "reserve",
      }));

      // Add pool reserve as partner
      if (poolReserve > 0) {
        partnerRows.push({
          company_id: companyId,
          name: "Pool de Reserva",
          role: "—",
          percentage: poolReserve,
          token_amount: Math.round((poolReserve / 100) * (parseInt(totalSupply) || 1000000)),
          partner_type: "pool" as const,
          status: "reserve" as const,
        });
      }

      if (partnerRows.length > 0) {
        const { error: partnersErr } = await supabase.from("partners").insert(partnerRows);
        if (partnersErr) throw partnersErr;
      }

      // 4. Insert token types
      const tokenTypeMap: Record<string, "ON" | "PN" | "PHANTOM" | "GOLDEN"> = {
        ON: "ON", PN: "PN", PHANTOM: "PHANTOM", GOLDEN: "GOLDEN",
      };
      const tokenRows = tokenTypes.map((t) => ({
        company_id: companyId,
        name: tokenTypeMap[t] || ("ON" as const),
        has_voting_rights: t === "ON" || t === "GOLDEN",
        has_economic_rights: t === "ON" || t === "PN" || t === "PHANTOM",
      }));
      if (tokenRows.length > 0) {
        const { error: tokenErr } = await supabase.from("token_types").insert(tokenRows);
        if (tokenErr) throw tokenErr;
      }

      // 5. Insert vesting config
      const { error: vestingErr } = await supabase.from("vesting_configs").insert({
        company_id: companyId,
        has_vesting: hasVesting,
        cliff_months: hasCliff ? cliffMonths : 0,
        vesting_months: vestingMonths,
        vesting_type: vestingType as "time" | "milestone",
      });
      if (vestingErr) throw vestingErr;

      // 6. Insert governance rules
      const { error: govErr } = await supabase.from("governance_rules").insert({
        company_id: companyId,
        quorum_standard: quorums.operational,
        quorum_entry: quorums.entry,
        quorum_exit: quorums.exit,
        quorum_rules_change: quorums.rulesChange,
        quorum_dissolution: quorums.dissolution,
        new_partner_mode: newPartnerMode as "pool" | "new_emission" | "both",
      });
      if (govErr) throw govErr;

      // Update local context too
      updateCompanySetup({
        companyName,
        totalSupply: parseInt(totalSupply) || 1000000,
        partners,
        poolReserve,
        tokenTypes,
        hasVesting,
        cliffMonths,
        vestingMonths,
        vestingType,
        transferRules: {
          between: transferBetween,
          external: transferExternal,
          exit: exitRule,
          nonCompete,
          nonCompeteMonths,
        },
        quorums,
        newPartnerMode,
        votingDeadline,
      });

      toast.success("Partnership instalado com sucesso!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Setup error:", err);
      toast.error(err.message || "Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  const canContinue = () => {
    if (step === 1) return companyName.trim().length > 0;
    if (step === 2) return partners.length >= 1 && totalWithPool <= 100;
    if (step === 3) return tokenTypes.length >= 1;
    return true;
  };

  const stepIcons = [Building2, Users, Layers, Clock, ArrowLeftRight, Shield, CheckCircle2];
  const StepIcon = step <= totalSteps ? stepIcons[step - 1] : CheckCircle2;

  const tokenTypeCards = [
    {
      key: "ON",
      label: "Ordinária (ON)",
      desc: "Direito a voto + direito econômico. Para sócios fundadores com controle total.",
      badges: ["✓ Voto proporcional", "✓ Dividendos", "✓ Liquidação"],
    },
    {
      key: "PN",
      label: "Preferencial (PN)",
      desc: "Sem voto, mas com prioridade econômica. Para investidores ou colaboradores seniores.",
      badges: ["✗ Voto", "✓ Dividendos prioritários", "✓ Liquidação preferencial"],
    },
    {
      key: "PHANTOM",
      label: "Phantom Equity",
      desc: "Benefício econômico sem token real. Ideal para colaboradores-chave sem participação societária.",
      badges: ["✗ Voto", "✓ Participação nos resultados", "✗ Liquidação"],
    },
    {
      key: "GOLDEN",
      label: "Golden Share",
      desc: "Poder de veto em decisões críticas, independente do percentual. Para fundador controlador.",
      badges: ["✓ Veto absoluto", "✗ Econômico adicional", "✓ Proteção do fundador"],
    },
  ];

  // Final screen
  if (step > totalSteps) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-8 text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
          </div>
          <div className="w-16 h-0.5 bg-gold mx-auto" />

          <div>
            <h1 className="text-4xl font-medium">Partnership instalado.</h1>
            <p className="text-muted-foreground mt-2">Seu sistema de cotas está configurado e pronto para operar.</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 text-left space-y-3">
            <Row label="Empresa" value={companyName} />
            <Row label="Supply total" value={`${parseInt(totalSupply).toLocaleString("pt-BR")} tokens = 100%`} />
            <Row label="Sócios" value={`${partners.length} cadastrados | Pool de reserva: ${poolReserve}%`} />
            <Row label="Tipos de cota" value={tokenTypes.join(", ")} />
            <Row label="Vesting" value={hasVesting ? `Ativo — ${vestingMonths} meses${hasCliff ? ` com cliff de ${cliffMonths} meses` : ""}` : "Não aplicável"} />
            <Row label="Governança" value={`Quórum padrão ${quorums.operational}%`} />
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">
              Um acordo digital (MOU) será gerado com base nestas configurações. Você receberá um link para assinatura de todos os sócios.
            </p>
          </div>

          <button
            onClick={handleFinish}
            disabled={saving}
            className="w-full max-w-[400px] mx-auto h-11 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-fast hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Salvando..." : "Acessar o dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with logo + progress */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <PieChart className="h-6 w-6 text-gold shrink-0" />
          <span className="font-bold text-sm">Arquiteto do Equity</span>
          <div className="flex-1 ml-4">
            <div className="h-1.5 bg-muted rounded-full">
              <div className="h-full bg-gold rounded-full transition-fast" style={{ width: `${(step / totalSteps) * 100}%` }} />
            </div>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">Etapa {step} de {totalSteps}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <StepIcon className="h-7 w-7" />
            </div>
          </div>

          {/* STEP 1 — Company */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-medium">Vamos começar pela empresa</h1>
                <p className="text-sm text-muted-foreground mt-2">Estas informações definem a base do seu sistema de cotas.</p>
              </div>
              <div className="space-y-4">
                <Field label="Nome da empresa" required>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Apex Marketing Agency" className="input-field" />
                </Field>
                <Field label="Setor">
                  <select value={sector} onChange={(e) => setSector(e.target.value)} className="input-field">
                    {["Marketing", "Finanças", "Contabilidade", "BPO", "Vendas", "Tecnologia", "Consultoria", "Outro"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Faturamento mensal">
                  <select value={revenue} onChange={(e) => setRevenue(e.target.value)} className="input-field">
                    {["Até R$ 50k", "R$ 50k–100k", "R$ 100k–300k", "Acima de R$ 300k"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Supply total de tokens (= 100% da empresa)" tooltip="Recomendamos 1.000.000 tokens. Isso permite granularidade de até 0,0001% por token.">
                  <input value={parseInt(totalSupply).toLocaleString("pt-BR")} onChange={(e) => setTotalSupply(e.target.value.replace(/\D/g, ""))} placeholder="1.000.000" className="input-field" />
                </Field>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Os tokens representam participação gerencial interna — não são criptomoedas negociáveis. Nenhuma integração bancária é criada aqui.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Partners */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-medium">Quem são os sócios e quanto cada um recebe?</h1>
                <p className="text-sm text-muted-foreground mt-2">Defina a distribuição inicial. Você pode reservar parte para novos sócios ou vesting futuro.</p>
              </div>

              {/* Partner list */}
              <div className="space-y-2">
                {partners.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.role} · {p.type}</p>
                    </div>
                    <span className="text-sm font-bold text-gold">{p.percentage}%</span>
                    <button onClick={() => removePartner(i)} className="text-muted-foreground hover:text-destructive transition-fast">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <div className="space-y-3 p-4 rounded-lg border border-border bg-surface/50">
                <div className="grid grid-cols-2 gap-3">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome completo" className="input-field" />
                  <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Cargo" className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={newPct} onChange={(e) => setNewPct(e.target.value)} placeholder="Participação (%)" className="input-field" type="number" />
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} className="input-field">
                    <option>Fundador</option>
                    <option>Colaborador-chave</option>
                    <option>Advisor</option>
                  </select>
                </div>
                <button onClick={addPartner} className="h-9 px-4 rounded-lg border border-primary text-primary text-sm font-medium transition-fast hover:bg-primary/5 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Adicionar sócio
                </button>
              </div>

              {/* Distribution bar */}
              <div className="space-y-2">
                <div className="h-3 rounded-full bg-muted flex overflow-hidden">
                  <div className="bg-primary transition-fast" style={{ width: `${totalAllocated}%` }} />
                  <div className="bg-gold transition-fast" style={{ width: `${poolReserve}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" /> Alocado: {totalAllocated}%</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-gold" /> Pool: {poolReserve}%</span>
                  <span>Livre: {Math.max(0, 100 - totalWithPool)}%</span>
                </div>
                {totalWithPool > 100 && (
                  <p className="text-xs text-destructive font-medium">Total excede 100%. Ajuste as participações ou o pool.</p>
                )}
              </div>

              {/* Pool slider */}
              <div>
                <label className="text-sm font-medium">Pool de reserva para futuros sócios: {poolReserve}%</label>
                <input type="range" min={0} max={30} value={poolReserve} onChange={(e) => setPoolReserve(Number(e.target.value))} className="w-full mt-2 accent-gold" />
              </div>
            </div>
          )}

          {/* STEP 3 — Token types */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-medium">Que tipo de cotas existirão?</h1>
                <p className="text-sm text-muted-foreground mt-2">Você pode ter tipos diferentes de participação para sócios, colaboradores e investidores.</p>
              </div>
              <div className="space-y-3">
                {tokenTypeCards.map((card) => {
                  const selected = tokenTypes.includes(card.key);
                  return (
                    <button
                      key={card.key}
                      onClick={() => toggleTokenType(card.key)}
                      className={`w-full p-5 rounded-lg border-2 text-left transition-fast ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded border-2 flex items-center justify-center text-xs ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                          {selected && "✓"}
                        </div>
                        <p className="text-sm font-medium">{card.label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 ml-8">{card.desc}</p>
                      <div className="flex flex-wrap gap-2 mt-3 ml-8">
                        {card.badges.map((b) => (
                          <span key={b} className={`text-xs px-2 py-0.5 rounded-full ${b.startsWith("✓") ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="text-sm font-medium">Observações sobre os tipos de cota (opcional)</label>
                <textarea value={tokenNotes} onChange={(e) => setTokenNotes(e.target.value)} rows={2} placeholder="Notas adicionais..." className="input-field mt-1 min-h-[60px] resize-none" />
              </div>
            </div>
          )}

          {/* STEP 4 — Vesting */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-medium">Haverá vesting?</h1>
                <p className="text-sm text-muted-foreground mt-2">Vesting define quando cada sócio realmente "ganha" sua participação ao longo do tempo.</p>
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <span className="text-sm font-medium">Ativar vesting</span>
                <button onClick={() => setHasVesting(!hasVesting)} className={`relative h-6 w-11 rounded-full transition-fast ${hasVesting ? "bg-primary" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-fast ${hasVesting ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              {!hasVesting ? (
                <p className="text-sm text-muted-foreground p-4 rounded-lg bg-surface border border-border">
                  Sem vesting: todos os tokens são distribuídos integralmente na largada.
                </p>
              ) : (
                <div className="space-y-5">
                  {/* Cliff toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Haverá cliff?</span>
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg bg-foreground text-background text-xs z-10">
                          Cliff é um período mínimo antes de qualquer token ser liberado. Exemplo: 1 ano de cliff significa que o sócio não recebe nada se sair antes de 12 meses.
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setHasCliff(!hasCliff)} className={`relative h-6 w-11 rounded-full transition-fast ${hasCliff ? "bg-primary" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-fast ${hasCliff ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>

                  {hasCliff && (
                    <div>
                      <label className="text-sm font-medium">Duração do cliff: {cliffMonths} meses</label>
                      <input type="range" min={3} max={24} value={cliffMonths} onChange={(e) => setCliffMonths(Number(e.target.value))} className="w-full mt-2 accent-primary" />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Duração total do vesting: {vestingMonths} meses</label>
                    <input type="range" min={12} max={60} value={vestingMonths} onChange={(e) => setVestingMonths(Number(e.target.value))} className="w-full mt-2 accent-primary" />
                  </div>

                  <Field label="Tipo de vesting">
                    <select value={vestingType} onChange={(e) => setVestingType(e.target.value as VestingType)} className="input-field">
                      <option value="time">Por tempo (linear) — tokens liberados mensalmente após o cliff</option>
                      <option value="milestone">Por marcos (milestone) — tokens liberados ao atingir objetivos</option>
                    </select>
                  </Field>

                  {vestingType === "milestone" && (
                    <div>
                      <label className="text-sm font-medium">Descreva os marcos principais</label>
                      <textarea value={milestoneDesc} onChange={(e) => setMilestoneDesc(e.target.value)} rows={3} placeholder="Ex: Marco 1 (25%): Cliente piloto fechado. Marco 2 (50%): Break-even atingido..." className="input-field mt-1 min-h-[80px] resize-none" />
                    </div>
                  )}

                  {/* Timeline diagram */}
                  <div className="p-4 rounded-lg border border-border bg-surface">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Linha do tempo</p>
                    <div className="relative h-8 flex items-center">
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-border" />
                      <div className="absolute left-0 h-3 w-3 rounded-full bg-gold z-10" />
                      {hasCliff && (
                        <div className="absolute h-3 w-3 rounded-full bg-gold z-10" style={{ left: `${(cliffMonths / vestingMonths) * 100}%` }} />
                      )}
                      <div className="absolute right-0 h-3 w-3 rounded-full bg-gold z-10" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Início</span>
                      {hasCliff && <span style={{ marginLeft: `${(cliffMonths / vestingMonths) * 80}%` }}>Cliff ({cliffMonths}m)</span>}
                      <span>{vestingMonths}m</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5 — Transfer rules */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-medium">Quais são as regras de transferência de cotas?</h1>
                <p className="text-sm text-muted-foreground mt-2">Defina o que acontece quando um sócio quer sair ou transferir sua participação.</p>
              </div>

              {/* Block A */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Transferência entre sócios existentes</h3>
                <RadioGroup value={transferBetween} onChange={(v) => setTransferBetween(v as TransferBetween)} options={[
                  { value: "free", label: "Livre — qualquer sócio pode transferir para outro" },
                  { value: "approval", label: "Requer aprovação do grupo" },
                  { value: "blocked", label: "Bloqueada — não permitida" },
                ]} />
              </div>

              {/* Block B */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold">Transferência para terceiros (fora do grupo)</h3>
                <RadioGroup value={transferExternal} onChange={(v) => setTransferExternal(v as TransferExternal)} options={[
                  { value: "unanimous", label: "Permitida com aprovação unânime" },
                  { value: "preference", label: "Não permitida — direito de preferência para sócios atuais" },
                  { value: "never", label: "Nunca permitida" },
                ]} />
              </div>

              {/* Block C */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold">Saída de sócio</h3>
                <RadioGroup value={exitRule} onChange={(v) => setExitRule(v as ExitRule)} options={[
                  { value: "fair_value", label: "Venda pelo valor justo acordado no MOU" },
                  { value: "original_value", label: "Recompra pelo grupo pelo valor original de entrada" },
                  { value: "pool_return", label: "Tokens retornam ao pool de reserva" },
                ]} />

                <label className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <input type="checkbox" checked={nonCompete} onChange={(e) => setNonCompete(e.target.checked)} className="accent-primary h-4 w-4" />
                  <span className="text-sm">Aplicar cláusula de não-concorrência</span>
                  {nonCompete && (
                    <input type="number" value={nonCompeteMonths} onChange={(e) => setNonCompeteMonths(Number(e.target.value))} className="w-20 h-8 px-2 rounded-md border border-border bg-background text-sm text-center ml-auto" placeholder="meses" />
                  )}
                </label>
              </div>
            </div>
          )}

          {/* STEP 6 — Governance */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Como as decisões serão tomadas?</h1>
                <p className="text-sm text-muted-foreground mt-2">Defina o quórum para cada tipo de decisão. Você pode ajustar depois.</p>
              </div>

              {/* Quorum table */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Quórum por tipo de decisão</h3>
                {[
                  { key: "operational" as const, label: "Decisões operacionais do dia a dia" },
                  { key: "entry" as const, label: "Entrada de novo sócio" },
                  { key: "exit" as const, label: "Saída ou exclusão de sócio" },
                  { key: "transfer" as const, label: "Transferência de cota" },
                  { key: "rulesChange" as const, label: "Alteração das regras de governança" },
                  { key: "dissolution" as const, label: "Encerramento do sistema" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                    <span className="flex-1 text-sm">{item.label}</span>
                    <span className="text-sm font-bold text-gold w-12 text-right">{quorums[item.key]}%</span>
                    <input
                      type="range"
                      min={51}
                      max={100}
                      value={quorums[item.key]}
                      onChange={(e) => setQuorums({ ...quorums, [item.key]: Number(e.target.value) })}
                      className="w-32 accent-primary"
                    />
                  </div>
                ))}
              </div>

              {/* New partners */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold">Novos sócios</h3>
                <RadioGroup value={newPartnerMode} onChange={(v) => setNewPartnerMode(v as NewPartnerMode)} options={[
                  { value: "pool", label: "Transferência do pool de reserva (sem diluição)" },
                  { value: "new_emission", label: "Emissão de novos tokens (dilui todos proporcionalmente)" },
                  { value: "both", label: "Ambos permitidos, decidido caso a caso" },
                ]} />
              </div>

              {/* Voting deadline */}
              <Field label="Prazo padrão de votação">
                <select value={votingDeadline} onChange={(e) => setVotingDeadline(e.target.value)} className="input-field">
                  <option>24h</option>
                  <option>48h</option>
                  <option>72h</option>
                  <option>7 dias</option>
                </select>
              </Field>
            </div>
          )}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="border-t border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium transition-fast hover:bg-surface">
              Voltar
            </button>
          )}
          <button
            onClick={() => canContinue() && setStep(step + 1)}
            disabled={!canContinue()}
            className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step < totalSteps ? "Continuar" : "Finalizar setup"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper components
function Field({ label, tooltip, required, children }: { label: string; tooltip?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
        {tooltip && (
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-3 rounded-lg bg-foreground text-background text-xs z-10">{tooltip}</div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function RadioGroup({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-fast flex items-center gap-3 ${
            value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${value === opt.value ? "border-primary" : "border-border"}`}>
            {value === opt.value && <div className="h-2 w-2 rounded-full bg-primary" />}
          </div>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
