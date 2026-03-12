import { PieChart, LayoutDashboard, Vote, Calculator, Settings, Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Parceiros", path: "/dashboard", icon: PieChart },
  { label: "Votações", path: "/votacoes", icon: Vote },
  { label: "Simulador", path: "/simulador", icon: Calculator },
  { label: "Configurações", path: "/configuracoes", icon: Settings },
];

export default function AppSidebar() {
  const { currentUser } = useAppContext();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full w-60 bg-sidebar-bg text-sidebar-fg">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <PieChart className="h-7 w-7 text-gold" />
        <span className="text-lg font-bold tracking-tight">Arquiteto do Equity</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-fast ${
                isActive
                  ? "bg-sidebar-active text-sidebar-fg font-medium"
                  : "text-sidebar-fg/70 hover:text-sidebar-fg hover:bg-sidebar-fg/5"
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-fg/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sidebar-active flex items-center justify-center text-sm font-medium">
            {currentUser.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-sidebar-fg/50 truncate">{currentUser.company}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar-bg text-sidebar-fg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="relative">{sidebarContent}</div>
          <div className="flex-1 bg-foreground/40" onClick={() => setMobileOpen(false)}>
            <button className="absolute top-4 right-4 text-sidebar-fg" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden md:block shrink-0">{sidebarContent}</div>
    </>
  );
}
