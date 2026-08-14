import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  quickAddSerieSchema,
  type QuickAddSerieFormValues,
} from "../lib/guia.schema";
import type { SerieLocal } from "../lib/guia.interface";
import { GuiaSerieLocalRow } from "./GuiaSerieLocalRow";

function formatMac(value: string): string {
  return value
    .replace(/[^0-9A-Fa-f]/g, "")
    .toUpperCase()
    .substring(0, 12);
}

const EMPTY_QUICK: QuickAddSerieFormValues = {
  serie: null,
  mac: null,
  emta_mac: null,
  ua: null,
};

const SHOW_RECENT = 10;

interface GuiaQuickAddSeriePanelProps {
  productoGuiaId: number;
  productoNombre: string | null | undefined;
  cantidad?: number;
  necesitaSerie: boolean;
  necesitaMac: boolean;
  necesitaEmtaMac: boolean;
  necesitaUa: boolean;
  seriesLocales: SerieLocal[];
  onAgregar: (fields: QuickAddSerieFormValues) => Promise<void>;
  onEliminar: (
    productoGuiaId: number,
    serieId: number,
    localId: string,
  ) => Promise<void>;
  onRetry: (localId: string) => Promise<void>;
  isPendingEliminar: (serieId: number) => boolean;
}

export function GuiaQuickAddSeriePanel({
  productoGuiaId: _productoGuiaId,
  necesitaSerie,
  necesitaMac,
  necesitaEmtaMac,
  necesitaUa,
  cantidad,
  seriesLocales,
  onAgregar,
  onEliminar,
  onRetry,
  isPendingEliminar,
}: GuiaQuickAddSeriePanelProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const serieRef = useRef<HTMLInputElement | null>(null);
  const macRef = useRef<HTMLInputElement | null>(null);
  const emtaMacRef = useRef<HTMLInputElement | null>(null);
  const uaRef = useRef<HTMLInputElement | null>(null);

  const activeFields = (
    [
      necesitaSerie && { key: "serie" as const, ref: serieRef },
      necesitaMac && { key: "mac" as const, ref: macRef },
      necesitaEmtaMac && { key: "emta_mac" as const, ref: emtaMacRef },
      necesitaUa && { key: "ua" as const, ref: uaRef },
    ] as const
  ).filter(Boolean) as {
    key: string;
    ref: React.RefObject<HTMLInputElement | null>;
  }[];

  const confirmedCount = seriesLocales.filter(
    (s) => s.status === "confirmed",
  ).length;
  const pendingCount = seriesLocales.filter(
    (s) => s.status === "pending",
  ).length;
  const errorCount = seriesLocales.filter((s) => s.status === "error").length;

  // Auto-scroll to bottom when entries are added
  useEffect(() => {
    if (listRef.current && open) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [seriesLocales.length, open]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<QuickAddSerieFormValues>({
    resolver: zodResolver(quickAddSerieSchema) as any,
    defaultValues: EMPTY_QUICK,
  }) as any;

  const doSubmit = handleSubmit((values: QuickAddSerieFormValues) => {
    const existing = seriesLocales.filter((s) => s.status !== "error");
    const cmp = (a?: string | null, b?: string | null) =>
      !!a && !!b && a.toUpperCase() === b.toUpperCase();

    let dup = false;
    if (values.serie && existing.some((s) => cmp(s.serie, values.serie))) {
      setError("serie", {
        type: "manual",
        message: "Ya existe en este producto",
      });
      dup = true;
    }
    if (values.mac && existing.some((s) => cmp(s.mac, values.mac))) {
      setError("mac", {
        type: "manual",
        message: "Ya existe en este producto",
      });
      dup = true;
    }
    if (
      values.emta_mac &&
      existing.some((s) => cmp(s.emtaMac, values.emta_mac))
    ) {
      setError("emta_mac", {
        type: "manual",
        message: "Ya existe en este producto",
      });
      dup = true;
    }
    if (values.ua && existing.some((s) => cmp(s.ua, values.ua))) {
      setError("ua", { type: "manual", message: "Ya existe en este producto" });
      dup = true;
    }
    if (dup) return;

    void onAgregar(values);
    reset(EMPTY_QUICK);
    setTimeout(() => activeFields[0]?.ref.current?.focus(), 0);
  });

  const checkFieldDuplicate = (
    field: "serie" | "mac" | "emta_mac" | "ua",
    value: string | null | undefined,
  ) => {
    if (!value?.trim()) return;
    const existing = seriesLocales.filter((s) => s.status !== "error");
    const localKey = field === "emta_mac" ? "emtaMac" : field;
    const cmp = (a: string, b: string) => a.toUpperCase() === b.toUpperCase();
    if (existing.some((s) => cmp((s as any)[localKey] ?? "", value))) {
      setError(field as any, {
        type: "manual",
        message: "Ya existe en este producto",
      });
    }
  };

  const handleKeyDown =
    (fieldKey: string) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const idx = activeFields.findIndex((f) => f.key === fieldKey);
      const next = activeFields[idx + 1];
      if (next) {
        next.ref.current?.focus();
      } else {
        doSubmit();
      }
    };

  const serieReg = register("serie");
  const macReg = register("mac");
  const emtaMacReg = register("emta_mac");
  const uaReg = register("ua");

  // Smart list: errors always visible at top; non-errors collapsed if > SHOW_RECENT
  const indexed = seriesLocales.map((s, i) => ({ serie: s, idx: i }));
  const errorEntries = indexed.filter((x) => x.serie.status === "error");
  const nonErrorEntries = indexed.filter((x) => x.serie.status !== "error");
  const hiddenCount = Math.max(0, nonErrorEntries.length - SHOW_RECENT);
  const visibleNonErrors = nonErrorEntries.slice(hiddenCount);

  return (
    <div className="border-t border-border/50 bg-muted/20">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="size-3.5 shrink-0 text-primary" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground/80">Registro rápido de series</span>
        </div>

        <div className="flex items-center gap-2">
          {cantidad != null && seriesLocales.length > 0 && (
            <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded border border-border/50">
              {confirmedCount}/{cantidad}
            </span>
          )}
          {confirmedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium border border-emerald-500/20">
              <CheckCircle2 className="size-3" />
              {confirmedCount}
            </span>
          )}
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded text-xs font-medium border border-amber-500/20">
              <Loader2 className="size-3 animate-spin" />
              {pendingCount}
            </span>
          )}
          {errorCount > 0 && (
            <span className="inline-flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-0.5 rounded text-xs font-medium border border-destructive/20">
              <AlertCircle className="size-3" />
              {errorCount}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* Input row */}
          <div className="flex flex-wrap gap-3 items-end">
            {necesitaSerie && (
              <div className="flex flex-col gap-1 flex-1 min-w-32.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Serie / S.N.
                </span>
                <Input
                  {...serieReg}
                  ref={(el) => {
                    serieReg.ref(el);
                    serieRef.current = el;
                  }}
                  placeholder="Ej: AB12345678"
                  className={cn(
                    "h-8 text-xs font-mono",
                    errors.serie && "border-destructive",
                  )}
                  onKeyDown={handleKeyDown("serie")}
                  onBlur={() =>
                    checkFieldDuplicate("serie", serieRef.current?.value)
                  }
                  autoComplete="off"
                />
                {errors.serie && (
                  <span className="text-[10px] text-destructive leading-tight">
                    {errors.serie.message}
                  </span>
                )}
              </div>
            )}

            {necesitaMac && (
              <div className="flex flex-col gap-1 flex-1 min-w-38.75">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  MAC
                </span>
                <Input
                  {...macReg}
                  ref={(el) => {
                    macReg.ref(el);
                    macRef.current = el;
                  }}
                  value={watch("mac") ?? ""}
                  placeholder="001A2B3C4D5E"
                  className={cn(
                    "h-8 text-xs font-mono",
                    errors.mac && "border-destructive",
                  )}
                  onChange={(e) =>
                    setValue("mac", formatMac(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  onKeyDown={handleKeyDown("mac")}
                  onBlur={() =>
                    checkFieldDuplicate("mac", macRef.current?.value)
                  }
                  autoComplete="off"
                />
                {errors.mac && (
                  <span className="text-[10px] text-destructive leading-tight">
                    {errors.mac.message}
                  </span>
                )}
              </div>
            )}

            {necesitaEmtaMac && (
              <div className="flex flex-col gap-1 flex-1 min-w-38.75">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  EMTA MAC
                </span>
                <Input
                  {...emtaMacReg}
                  ref={(el) => {
                    emtaMacReg.ref(el);
                    emtaMacRef.current = el;
                  }}
                  placeholder="001A2B3C4D5E"
                  className={cn(
                    "h-8 text-xs font-mono",
                    errors.emta_mac && "border-destructive",
                  )}
                  onKeyDown={handleKeyDown("emta_mac")}
                  onBlur={() =>
                    checkFieldDuplicate("emta_mac", emtaMacRef.current?.value)
                  }
                  autoComplete="off"
                />
                {errors.emta_mac && (
                  <span className="text-[10px] text-destructive leading-tight">
                    {errors.emta_mac.message}
                  </span>
                )}
              </div>
            )}

            {necesitaUa && (
              <div className="flex flex-col gap-1 flex-1 min-w-32.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  UA
                </span>
                <Input
                  {...uaReg}
                  ref={(el) => {
                    uaReg.ref(el);
                    uaRef.current = el;
                  }}
                  placeholder="Caracteres"
                  className={cn(
                    "h-8 text-xs font-mono",
                    errors.ua && "border-destructive",
                  )}
                  onKeyDown={handleKeyDown("ua")}
                  onBlur={() => checkFieldDuplicate("ua", uaRef.current?.value)}
                  autoComplete="off"
                />
                {errors.ua && (
                  <span className="text-[10px] text-destructive leading-tight">
                    {errors.ua.message}
                  </span>
                )}
              </div>
            )}

            <Button
              type="button"
              size="sm"
              className="h-8 px-3 shrink-0"
              onClick={() => doSubmit()}
              title="Agregar (Enter en el último campo)"
            >
              <Plus className="size-3" />
            </Button>
          </div>

          {/* Series list */}
          {seriesLocales.length > 0 && (
            <div
              ref={listRef}
              className="space-y-0.5 max-h-56 overflow-y-auto pr-0.5"
            >
              {/* Errors always visible at top */}
              {errorEntries.map(({ serie, idx }) => (
                <GuiaSerieLocalRow
                  key={serie.localId}
                  serie={serie}
                  index={idx}
                  necesitaSerie={necesitaSerie}
                  necesitaMac={necesitaMac}
                  necesitaEmtaMac={necesitaEmtaMac}
                  necesitaUa={necesitaUa}
                  onEliminar={onEliminar}
                  onRetry={onRetry}
                  isDeleting={
                    serie.servidorId
                      ? isPendingEliminar(serie.servidorId)
                      : false
                  }
                />
              ))}

              {/* Collapsed summary for old non-error entries */}
              {hiddenCount > 0 && (
                <div className="flex items-center gap-2 py-0.5 px-1 text-[10px] text-muted-foreground select-none">
                  <div className="flex-1 border-t border-dashed" />
                  <span>
                    {hiddenCount} anterior{hiddenCount !== 1 ? "es" : ""}
                  </span>
                  <div className="flex-1 border-t border-dashed" />
                </div>
              )}

              {/* Recent non-error entries */}
              {visibleNonErrors.map(({ serie, idx }) => (
                <GuiaSerieLocalRow
                  key={serie.localId}
                  serie={serie}
                  index={idx}
                  necesitaSerie={necesitaSerie}
                  necesitaMac={necesitaMac}
                  necesitaEmtaMac={necesitaEmtaMac}
                  necesitaUa={necesitaUa}
                  onEliminar={onEliminar}
                  onRetry={onRetry}
                  isDeleting={
                    serie.servidorId
                      ? isPendingEliminar(serie.servidorId)
                      : false
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
