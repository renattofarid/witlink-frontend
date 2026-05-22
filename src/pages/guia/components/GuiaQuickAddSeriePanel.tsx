import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
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
  const clean = value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  const chunks = clean.match(/.{1,2}/g) ?? [];
  return chunks.join(":").substring(0, 17);
}

const EMPTY_QUICK: QuickAddSerieFormValues = {
  serie: null,
  mac: null,
  emta_mac: null,
  ua: null,
};

interface GuiaQuickAddSeriePanelProps {
  productoGuiaId: number;
  productoNombre: string | null | undefined;
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
  productoGuiaId,
  necesitaSerie,
  necesitaMac,
  necesitaEmtaMac,
  necesitaUa,
  seriesLocales,
  onAgregar,
  onEliminar,
  onRetry,
  isPendingEliminar,
}: GuiaQuickAddSeriePanelProps) {
  const [open, setOpen] = useState(false);

  const serieRef = useRef<HTMLInputElement | null>(null);
  const macRef = useRef<HTMLInputElement | null>(null);
  const emtaMacRef = useRef<HTMLInputElement | null>(null);
  const uaRef = useRef<HTMLInputElement | null>(null);

  // Ordered list of active fields based on product flags
  const activeFields = (
    [
      necesitaSerie && { key: "serie" as const, ref: serieRef },
      necesitaMac && { key: "mac" as const, ref: macRef },
      necesitaEmtaMac && { key: "emta_mac" as const, ref: emtaMacRef },
      necesitaUa && { key: "ua" as const, ref: uaRef },
    ] as const
  ).filter(Boolean) as { key: string; ref: React.MutableRefObject<HTMLInputElement | null> }[];

  const confirmedCount = seriesLocales.filter(
    (s) => s.status === "confirmed",
  ).length;

  const serieField = useForm<QuickAddSerieFormValues>({
    resolver: zodResolver(quickAddSerieSchema) as any,
    defaultValues: EMPTY_QUICK,
  });
  const { register, handleSubmit, reset, setValue, formState: { errors } } = serieField;

  const doSubmit = handleSubmit((values) => {
    // Fire-and-forget: the row appears immediately as "pending" in the list below
    void onAgregar(values);
    reset(EMPTY_QUICK);
    setTimeout(() => activeFields[0]?.ref.current?.focus(), 0);
  });

  // On Enter: advance to next field, or submit on last field
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

  return (
    <div className="border-t bg-muted/20">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? (
          <ChevronDown className="size-3 shrink-0" />
        ) : (
          <ChevronRight className="size-3 shrink-0" />
        )}
        <span>
          Registro rápido de series
          {confirmedCount > 0 && (
            <span className="ml-1 text-green-600 font-medium">
              ({confirmedCount} confirmada{confirmedCount !== 1 ? "s" : ""})
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
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
                  placeholder="00:1A:2B:3C:4D:5E"
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
                  placeholder="00:1A:2B:3C:4D:5E"
                  className={cn(
                    "h-8 text-xs font-mono",
                    errors.emta_mac && "border-destructive",
                  )}
                  onChange={(e) =>
                    setValue("emta_mac", formatMac(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  onKeyDown={handleKeyDown("emta_mac")}
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
                  placeholder="17 caracteres"
                  className={cn(
                    "h-8 text-xs font-mono",
                    errors.ua && "border-destructive",
                  )}
                  onKeyDown={handleKeyDown("ua")}
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
            <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
              {seriesLocales.map((serie, i) => (
                <GuiaSerieLocalRow
                  key={serie.localId}
                  serie={serie}
                  index={i}
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
