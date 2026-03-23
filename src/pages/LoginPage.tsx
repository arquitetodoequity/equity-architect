import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PieChart, Mail, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("forgot") === "1") {
      setIsForgotPassword(true);
    }
  }, [searchParams]);

  // If already logged in, redirect
  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Link de recuperação enviado para seu email!");
      setIsForgotPassword(false);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    if (isSignUp) {
      if (!fullName.trim()) {
        toast.error("Informe seu nome completo");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Conta criada com sucesso!");
        navigate("/setup");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error("Email ou senha incorretos");
      } else {
        navigate("/dashboard");
      }
    }
    setLoading(false);
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
          <h1 className="text-3xl font-medium leading-tight mb-4">
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
            <h2 className="text-2xl font-medium">
              {isForgotPassword
                ? "Recuperar senha"
                : isSignUp
                ? "Criar conta"
                : "Entrar na plataforma"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isForgotPassword
                ? "Enviaremos um link para redefinir sua senha"
                : isSignUp
                ? "Preencha os dados para começar"
                : "Gerencie cotas e governança com precisão"}
            </p>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-fast hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar link de recuperação
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-primary hover:underline transition-fast"
                >
                  Voltar para o login
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome completo</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full h-10 px-4 rounded-lg border border-border bg-background text-sm transition-fast focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}

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
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Senha</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-primary hover:underline transition-fast"
                      >
                        Esqueci a senha
                      </button>
                    )}
                  </div>
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
                  disabled={loading}
                  className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-fast hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSignUp ? "Criar conta" : "Entrar"}
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Já tem conta?" : "Novo por aqui?"}{" "}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline transition-fast"
                  >
                    {isSignUp ? "Fazer login" : "Criar conta"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
