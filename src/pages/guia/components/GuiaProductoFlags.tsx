import { cn } from "@/lib/utils";

interface GuiaProductoFlagsProps {
  necesitaSerie: boolean | null | undefined;
  necesitaMac: boolean | null | undefined;
  necesitaEmtaMac: boolean | null | undefined;
  necesitaUa: boolean | null | undefined;
}

export function GuiaProductoFlags({
  necesitaSerie,
  necesitaMac,
  necesitaEmtaMac,
  necesitaUa,
}: GuiaProductoFlagsProps) {
  const flags = [
    { label: "Serie", value: necesitaSerie },
    { label: "MAC", value: necesitaMac },
    { label: "EMTA MAC", value: necesitaEmtaMac },
    { label: "UA", value: necesitaUa },
  ] as const;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
        Requiere:
      </span>
      {flags.map(({ label, value }) => (
        <span
          key={label}
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
            value === true
              ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-400"
              : "bg-muted border-border text-muted-foreground line-through",
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
