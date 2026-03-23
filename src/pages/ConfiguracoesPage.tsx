import { Settings } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <p className="section-label mb-1">Configurações</p>
        <h1 className="text-2xl font-medium">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie as configurações da sua empresa</p>
      </div>
      <div className="rounded-lg border border-border bg-background shadow-sm p-12 text-center">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-muted-foreground">Configurações em breve.</p>
      </div>
    </div>
  );
}
