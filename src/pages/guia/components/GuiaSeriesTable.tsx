import { useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FormInput } from "@/components/FormInput";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ProductoFormValues, SerieFormValues } from "../lib/guia.schema";

function formatMac(value: string): string {
  const clean = value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  const chunks = clean.match(/.{1,2}/g) ?? [];
  return chunks.join(":").substring(0, 17);
}

interface GuiaSeriesTableProps {
  productSubForm: UseFormReturn<ProductoFormValues>;
  watchedSeries: SerieFormValues[];
  watchedCantidad: number | string | null | undefined;
  disabledSerie: boolean;
  disabledMac: boolean;
  disabledEmtaMac: boolean;
  disabledUa: boolean;
  onAdvance: (rowIndex: number, field: string) => void;
}

export function GuiaSeriesTable({
  productSubForm,
  watchedSeries,
  watchedCantidad,
  disabledSerie,
  disabledMac,
  disabledEmtaMac,
  disabledUa,
  onAdvance,
}: GuiaSeriesTableProps) {
  // Refs para evitar closures stale en useMemo de columnas
  const flagsRef = useRef({ disabledSerie, disabledMac, disabledEmtaMac, disabledUa });
  flagsRef.current = { disabledSerie, disabledMac, disabledEmtaMac, disabledUa };
  const formRef = useRef(productSubForm);
  formRef.current = productSubForm;
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  const columns = useMemo((): ColumnDef<SerieFormValues>[] => [
    {
      id: "num",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.index + 1}</span>
      ),
    },
    {
      id: "serie",
      header: () => (
        <span className={cn(flagsRef.current.disabledSerie ? "text-muted-foreground/40" : "text-muted-foreground")}>
          Serie
        </span>
      ),
      cell: ({ row }) => {
        const { disabledSerie } = flagsRef.current;
        const form = formRef.current;
        const index = row.index;
        return (
          <FormInput
            id={`series-${index}-serie`}
            name={`series.${index}.serie`}
            control={form.control}
            disabled={disabledSerie}
            placeholder="SN123456"
            uppercase
            className={cn("h-7 text-xs", disabledSerie && "opacity-40 cursor-not-allowed")}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdvanceRef.current(index, "serie"); } }}
          />
        );
      },
    },
    {
      id: "mac",
      header: () => (
        <span className={cn(flagsRef.current.disabledMac ? "text-muted-foreground/40" : "text-muted-foreground")}>
          MAC
        </span>
      ),
      cell: ({ row }) => {
        const { disabledMac } = flagsRef.current;
        const form = formRef.current;
        const index = row.index;
        return (
          <Controller
            control={form.control}
            name={`series.${index}.mac` as any}
            render={({ field, fieldState }) => (
              <FormInput
                id={`series-${index}-mac`}
                name={`series.${index}.mac`}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(formatMac(e.target.value))}
                onBlur={field.onBlur}
                disabled={disabledMac}
                placeholder="00:1A:2B:3C:4D:5E"
                maxLength={17}
                error={fieldState.error?.message}
                className={cn("h-7 text-xs font-mono", disabledMac && "opacity-40 cursor-not-allowed")}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdvanceRef.current(index, "mac"); } }}
              />
            )}
          />
        );
      },
    },
    {
      id: "emta_mac",
      header: () => (
        <span className={cn(flagsRef.current.disabledEmtaMac ? "text-muted-foreground/40" : "text-muted-foreground")}>
          EMTA MAC
        </span>
      ),
      cell: ({ row }) => {
        const { disabledEmtaMac } = flagsRef.current;
        const form = formRef.current;
        const index = row.index;
        return (
          <Controller
            control={form.control}
            name={`series.${index}.emta_mac` as any}
            render={({ field, fieldState }) => (
              <FormInput
                id={`series-${index}-emta_mac`}
                name={`series.${index}.emta_mac`}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(formatMac(e.target.value))}
                onBlur={field.onBlur}
                disabled={disabledEmtaMac}
                placeholder="00:1A:2B:3C:4D:5E"
                maxLength={17}
                error={fieldState.error?.message}
                className={cn("h-7 text-xs font-mono", disabledEmtaMac && "opacity-40 cursor-not-allowed")}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdvanceRef.current(index, "emta_mac"); } }}
              />
            )}
          />
        );
      },
    },
    {
      id: "ua",
      header: () => (
        <span className={cn(flagsRef.current.disabledUa ? "text-muted-foreground/40" : "text-muted-foreground")}>
          UA
        </span>
      ),
      cell: ({ row }) => {
        const { disabledUa } = flagsRef.current;
        const form = formRef.current;
        const index = row.index;
        return (
          <FormInput
            id={`series-${index}-ua`}
            name={`series.${index}.ua`}
            control={form.control}
            disabled={disabledUa}
            placeholder="XX:XX:XX:XX:XX:XX"
            maxLength={17}
            uppercase
            className={cn("h-7 text-xs font-mono", disabledUa && "opacity-40 cursor-not-allowed")}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdvanceRef.current(index, "ua"); } }}
          />
        );
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
          Series · {watchedSeries.length}/{Number(watchedCantidad) || 0}
        </p>
        <Separator className="flex-1" />
      </div>

      <DataTable
        columns={columns}
        data={watchedSeries}
        variant="outline"
        isVisibleColumnFilter={false}
        className="block! w-full"
      />

      {productSubForm.formState.errors.series?.message && (
        <p className="text-xs text-destructive">
          {productSubForm.formState.errors.series.message as string}
        </p>
      )}
    </div>
  );
}
