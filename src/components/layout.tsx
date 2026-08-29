import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import HeaderComponent from "./header";
import { AuthInitializer } from "./AuthInitializer";
import { ErrorBoundary } from "./ErrorBoundary";
import { useTabsStore } from "@/store/tabs.store";
import { useAuthStore } from "@/pages/auth/lib/auth.store";

interface Props {
  children: React.ReactNode;
}

function TabTracker() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { openTab, setActiveRoute, setLastPath } = useTabsStore();

  useEffect(() => {
    if (!user) return;

    const allOptions = (user.grupos_menu ?? []).flatMap((g) =>
      g.opciones_menu.map((o) => ({ route: o.ruta, title: o.nombre, iconName: o.icono })),
    );

    const match = allOptions
      .filter((o) => location.pathname === o.route || location.pathname.startsWith(o.route + "/"))
      .sort((a, b) => b.route.length - a.route.length)[0];

    if (match) {
      openTab(match);
      setActiveRoute(match.route);
      setLastPath(match.route, location.pathname);
    }
  }, [location.pathname, user, openTab, setActiveRoute, setLastPath]);

  return null;
}

function PageContent({ children }: Props) {
  const location = useLocation();
  return (
    <div className="flex flex-1 flex-col gap-4 p-2 w-full">
      <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>
    </div>
  );
}

export default function LayoutComponent({ children }: Props) {
  return (
    <SidebarProvider>
      <AuthInitializer />
      <AppSidebar />
      <SidebarInset className="overflow-auto">
        <HeaderComponent />
        <TabTracker />
        <PageContent>{children}</PageContent>
      </SidebarInset>
    </SidebarProvider>
  );
}
