import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppProvider } from "@/contexts/AppContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import SociosPage from "@/pages/SociosPage";
import VotacoesPage from "@/pages/VotacoesPage";
import SimuladorPage from "@/pages/SimuladorPage";
import ConfiguracoesPage from "@/pages/ConfiguracoesPage";
import OnboardingPage from "@/pages/OnboardingPage";
import SetupPage from "@/pages/SetupPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route
                path="/setup"
                element={
                  <ProtectedRoute>
                    <SetupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/socios" element={<SociosPage />} />
                <Route path="/votacoes" element={<VotacoesPage />} />
                <Route path="/simulador" element={<SimuladorPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
