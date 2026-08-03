import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoRegistradosBannerProps {
  /** Bulk-search terms that had no match under the applied filters. */
  items: string[];
  /**
   * Noun phrase describing the searched terms, e.g. "las series buscadas" or
   * "los SOTs buscados". Used in the banner title.
   */
  descripcion: string;
}

/**
 * Persistent, dismissible banner listing bulk-search terms with no matches.
 * It stays visible until the user dismisses it, but reappears whenever the set
 * of missing terms changes (a new bulk search with different misses).
 *
 * Render it inside a `flex-wrap` filter container with the banner spanning the
 * full width so it drops onto its own line below the filters.
 */
export default function NoRegistradosBanner({
  items,
  descripcion,
}: NoRegistradosBannerProps) {
  const itemsKey = items.join(",");
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  if (items.length === 0 || dismissedKey === itemsKey) return null;

  return (
    <div className="w-full rounded-lg border border-amber-500/40 bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            No se encontraron {items.length} de {descripcion}
          </p>
          <p className="mt-0.5 max-h-24 overflow-auto break-words font-mono text-xs text-amber-700 dark:text-amber-400/90">
            {items.join(", ")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-amber-700 hover:text-amber-900 dark:text-amber-400"
          onClick={() => setDismissedKey(itemsKey)}
          title="Descartar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
