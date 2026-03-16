import { useState } from "react";

interface CreateProposalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { type: string; title: string; description: string; quorum: string; deadline: string }) => void;
}

export default function CreateProposalModal({ open, onClose, onSubmit }: CreateProposalModalProps) {
  const [formData, setFormData] = useState({
    type: "Entrada de novo sócio",
    title: "",
    description: "",
    quorum: "67",
    deadline: "72h",
  });

  if (!open) return null;

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onSubmit(formData);
    setFormData({ type: "Entrada de novo sócio", title: "", description: "", quorum: "67", deadline: "72h" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative bg-background rounded-xl shadow-lg border border-border w-full max-w-lg p-6 space-y-5">
        <h2 className="text-xl font-bold">Nova proposta de governança</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
            >
              {["Entrada de novo sócio", "Transferência de cota", "Saída de sócio", "Alteração de regras", "Outro"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Título da proposta</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              placeholder="Ex: Entrada de novo sócio"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição detalhada</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
              rows={4}
              placeholder="Descreva a proposta em detalhes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Quórum necessário</label>
              <select
                value={formData.quorum}
                onChange={(e) => setFormData({ ...formData, quorum: e.target.value })}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                {["51", "67", "75", "100"].map((q) => (
                  <option key={q} value={q}>{q}%</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Prazo de votação</label>
              <select
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-1 w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                {["24h", "48h", "72h", "7 dias"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-border text-sm font-medium transition-fast hover:bg-surface"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-fast hover:opacity-90"
          >
            Criar proposta
          </button>
        </div>
      </div>
    </div>
  );
}
