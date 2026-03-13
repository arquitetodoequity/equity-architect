import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Mail, Eye, EyeOff, Check } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const bullets = [
    "Registro imutável de cotas",
    "Votações com peso proporcional",
    "Histórico permanente de decisões",
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left dark panel */}
      <div className="hidden md:flex w-2/5 bg-sidebar-bg text-sidebar-fg flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <PieChart className="h-8 w-8 text-gold" />
            <span className="text-xl font-bold">Arquiteto do Equity</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Clareza de propriedade.
            <br />
            Sem burocracia.
          </h1>
          <div className="w-16 h-px bg-gold mb-8" />
          <ul className="space-y-4">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-sidebar-fg/80">
                <Check className="h-4 w-4 text-gold shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">Versão 1.0 — 2026</p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <PieChart className="h-6 w-6 text-gold" />
            <span className="font-bold text-lg">Arquiteto do Equity</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Entrar na plataforma</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie cotas e governança com precisão
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm transition-fast focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-4 rounded-lg border border-border bg-background text-sm transition-fast focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-fast hover:opacity-90"
            >
              Entrar
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full h-10 rounded-lg border border-border text-sm font-medium transition-fast hover:bg-surface flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>

          <div className="text-center space-y-2">
            <button className="text-sm text-primary transition-fast hover:underline">
              Esqueci a senha
            </button>
            <p className="text-sm text-muted-foreground">
              Novo por aqui?{" "}
              <button className="text-primary hover:underline transition-fast">
                Fale com um especialista
              </button>
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/setup")}
              className="w-full h-10 rounded-lg border border-gold text-gold-dark text-sm font-medium transition-fast hover:bg-gold-hover"
            >
              Configurar nova empresa
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              className="w-full h-10 rounded-lg border border-border text-muted-foreground text-sm font-medium transition-fast hover:bg-surface"
            >
              Ver como novo usuário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
