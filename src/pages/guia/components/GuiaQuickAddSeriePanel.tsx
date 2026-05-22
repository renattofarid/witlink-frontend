import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronRight, Plus, Loader2 } from "lucide-react";
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
  productoNombre,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const confirmedCount = seriesLocales.filter(
    (s) => s.status === "confirmed",
  ).length;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<QuickAddSerieFormValues>({
    resolver: zodResolver(quickAddSerieSchema) as any,
    defaultValues: EMPTY_QUICK,
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onAgregar(values);
      reset(EMPTY_QUICK);
      firstInputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  const macProps = (field: "mac" | "emta_mac") => ({
    ...register(field),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(field, formatMac(e.target.value), { shouldValidate: true });
    },
  });

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
        <div className="px-3 pb-3 space-y-2">
          {/* Quick-add input row */}
          <div className="flex flex-wrap gap-1.5 items-start">
            {necesitaSerie && (
              <div className="flex flex-col gap-0.5">
                <Input
                  {...register("serie")}
                  ref={firstInputRef}
                  placeholder="Serie / S.N."
                  className={cn(
                    "h-7 text-xs w-36 font-mono",
                    errors.serie && "border-destructive",
                  )}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                />
                {errors.serie && (
                  <span className="text-[10px] text-destructive">
                    {errors.serie.message}
                  </span>
                )}
              </div>
            )}
            {necesitaMac && (
              <div className="flex flex-col gap-0.5">
                <Input
                  {...macProps("mac")}
                  placeholder="MAC (00:1A:2B:3C:4D:5E)"
                  className={cn(
                    "h-7 text-xs w-40 font-mono",
                    errors.mac && "border-destructive",
                  )}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                />
                {errors.mac && (
                  <span className="text-[10px] text-destructive">
                    {errors.mac.message}
                  </span>
                )}
              </div>
            )}
            {necesitaEmtaMac && (
              <div className="flex flex-col gap-0.5">
                <Input
                  {...macProps("emta_mac")}
                  placeholder="EMTA MAC"
                  className={cn(
                    "h-7 text-xs w-40 font-mono",
                    errors.emta_mac && "border-destructive",
                  )}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                />
                {errors.emta_mac && (
                  <span className="text-[10px] text-destructive">
                    {errors.emta_mac.message}
                  </span>
                )}
              </div>
            )}
            {necesitaUa && (
              <div className="flex flex-col gap-0.5">
                <Input
                  {...register("ua")}
                  placeholder="UA (17 chars)"
                  className={cn(
                    "h-7 text-xs w-36 font-mono",
                    errors.ua && "border-destructive",
                  )}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                />
                {errors.ua && (
                  <span className="text-[10px] text-destructive">
                    {errors.ua.message}
                  </span>
                )}
              </div>
            )}
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-xs shrink-0"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Plus className="size-3" />
              )}
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
