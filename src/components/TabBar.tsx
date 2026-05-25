import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useTabsStore } from "@/store/tabs.store";
import { getIcon } from "./app-sidebar";
import { cn } from "@/lib/utils";

export default function TabBar() {
  const navigate = useNavigate();
  const { tabs, activeRoute, closeTab } = useTabsStore();

  if (tabs.length === 0) return null;

  const handleClose = (e: React.MouseEvent, route: string) => {
    e.stopPropagation();
    closeTab(route);
    if (activeRoute === route) {
      const idx = tabs.findIndex((t) => t.route === route);
      const next = tabs[idx - 1] ?? tabs[idx + 1];
      navigate(next ? next.route : "/inicio");
    }
  };

  return (
    <div className="flex items-center gap-0 border-b border-border bg-background overflow-x-auto scrollbar-thin px-1">
      {tabs.map((tab) => {
        const Icon = getIcon(tab.iconName);
        const isActive = activeRoute === tab.route;
        return (
          <button
            key={tab.route}
            onClick={() => navigate(tab.route)}
            className={cn(
              "group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
              isActive
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{tab.title}</span>
            <span
              role="button"
              onClick={(e) => handleClose(e, tab.route)}
              className={cn(
                "ml-0.5 rounded-sm p-0.5 transition-colors",
                isActive
                  ? "opacity-60 hover:opacity-100 hover:bg-primary/10"
                  : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-muted",
              )}
            >
              <X className="size-3" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
