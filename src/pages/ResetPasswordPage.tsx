import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PieChart, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FlowState = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("checking");

  useEffect(() => {
    // Check for error in URL hash (e.g. expired token)
    const hash = window.location.hash;
    if (hash.includes("error") || hash.includes("error_code")) {
      setFlowState("invalid");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    // Check for error in query params
    const errorParam = searchParams.get("error") || searchParams.get("error_code");
    if (errorParam) {
      setFlowState("invalid");
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setFlowState("ready");
      }
    });

    // Check if already in a valid session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setFlowState("ready");
      }
    });

    // Timeout fallback — avoid infinite spinner
    const timeout = setTimeout(() => {
      setFlowState((prev) => (prev === "checking" ? "invalid" : prev));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha redefinida com sucesso!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-6 w-6 text-gold" />
          <span className="font-bold text-lg">Arquiteto do Equity</span>
        </div>

        {flowState === "checking" && (
          <>
            <div>
              <h2 className="text-2xl font-medium">Redefinir senha</h2>
              <p className="text-sm text-muted-foreground mt-1">Verificando link de recuperação...</p>
            </div>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </>
        )}

        {flowState === "invalid" && (
          <>
            <div>
              <h2 className="text-2xl font-medium">Link inválido ou expirado</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Este link de recuperação já foi utilizado ou expirou. Solicite um novo link.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 py-6">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <button
                onClick={() => navigate("/?forgot=1")}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-150 hover:opacity-90"
              >
                Solicitar novo link
              </button>
            </div>
          </>
        )}

        {flowState === "ready" && (
          <>
            <div>
              <h2 className="text-2xl font-bold">Redefinir senha</h2>
              <p className="text-sm text-muted-foreground mt-1">Digite sua nova senha abaixo.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nova senha</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-150"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar senha</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all duration-150 hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Redefinir senha
              </button>
            </form>
          </>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-primary hover:underline transition-all duration-150"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
}
