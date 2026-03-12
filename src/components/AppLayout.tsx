import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { useAppContext } from "@/contexts/AppContext";

export default function AppLayout() {
  const { currentUser } = useAppContext();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-end px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{currentUser.name}</span>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
              {currentUser.initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
