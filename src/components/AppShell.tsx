import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, BriefcaseBusiness, ChevronLeft, ChevronRight, FilePlus2, LogOut, Menu, Settings, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { dealStorage } from "@/services/dealStorage";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageToggle } from "@/components/LanguageToggle";

const SidebarContent = ({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const nav = [
    { label: t("nav.dashboard"), path: "/", icon: BarChart3 },
    { label: t("nav.newDeal"), path: "/deals/new", icon: FilePlus2 },
    { label: t("nav.aiUnderwriter"), path: "/underwriter/new", icon: Sparkles },
    { label: t("nav.deals"), path: "/deals", icon: BriefcaseBusiness },
    { label: t("nav.settings"), path: "/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("auth.signOutSuccess"));
    navigate("/auth/login");
  };

  return (
    <div className="flex h-full flex-col bg-[#16365D] text-white">
      <div className={cn("flex flex-col items-center border-b border-white/10 px-5 pt-5 pb-4", collapsed && "items-center px-2 pt-4")}>
        {collapsed ? (
          <span className="text-lg font-extrabold tracking-tight text-white">GK</span>
        ) : (
          <>
            <img src="/brand/gokapital-logo.png" alt="GoKapital" style={{ filter: "brightness(0) invert(1)" }} className="w-[140px]" />
            <div className="mt-3 text-center">
              <div className="text-sm font-extrabold tracking-tight text-white">{t("nav.dealAnalyzer")}</div>
              <div className="mt-0.5 text-[10px] font-medium text-slate-400">{t("nav.internalPrototype")}</div>
            </div>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-5" aria-label={t("nav.dashboard")}>
        {nav.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === "/" || path === "/deals"} onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white",
              isActive && "bg-[#4AB547] text-white hover:bg-[#43A840]",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? label : undefined}>
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/10 px-3 py-3">
          <button type="button" onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white">
            <LogOut className="h-[18px] w-[18px]" /> {t("nav.signOut")}
          </button>
        </div>
      )}
    </div>
  );
};

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    dealStorage.getAll();
    const warning = dealStorage.consumeRecoveryWarning();
    if (warning) toast.warning("Prototype data restored", { description: warning });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-[#16365D]">
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 lg:block", collapsed ? "w-20" : "w-56")}>
        <SidebarContent collapsed={collapsed} />
        <button type="button" onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 bottom-7 flex h-7 w-7 items-center justify-center rounded-full border border-[#DDE3E8] bg-white text-[#16365D] shadow-sm hover:bg-slate-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-[#102A49]/60" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-72 shadow-xl">
            <button type="button" onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className={cn("min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-56")}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#DDE3E8] bg-white px-4 lg:hidden">
          <div className="flex items-center">
            <button type="button" onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-[#DDE3E8] p-2 text-[#16365D]" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <img src="/brand/gokapital-logo.png" alt="GoKapital" className="ml-2 h-7 w-auto" />
          </div>
          <LanguageToggle />
        </header>
        <div className="hidden justify-end px-8 pt-4 lg:flex">
          <LanguageToggle />
        </div>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-4">{children}</main>
      </div>
    </div>
  );
};