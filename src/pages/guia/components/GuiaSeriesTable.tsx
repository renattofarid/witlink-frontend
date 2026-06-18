import { useMemo, useRef } from "react";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { FormInput } from "@/components/FormInput";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductoFormValues, SerieFormValues } from "../lib/guia.schema";

type FieldValidationStatus = "idle" | "loading" | "valid" | "invalid";

function ValidationIcon({ status }: { status: FieldValidationStatus | undefined }) {
  if (status === "loading") return <Loader2 className="size-3 text-amber-500 animate-spin shrink-0" />;
  if (status === "valid") return <CheckCircle2 className="size-3 text-green-500 shrink-0" />;
  if (status === "invalid") return <AlertCircle className="size-3 text-destructive shrink-0" />;
  return null;
}

function formatMac(value: string): string {
  return value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase().substring(0, 12);
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
  onRemoveSerie: (index: number) => void;
  onCheckDuplicate?: (
    rowIndex: number,
    field: "serie" | "mac" | "emta_mac" | "ua",
    value: string | null | undefined,
  ) => void;
  onValidateField?: (
    rowIndex: number,
    field: "serie" | "mac" | "emta_mac" | "ua",
    value: string | null | undefined,
  ) => Promise<void>;
  fieldValidationStatus?: Record<string, FieldValidationStatus>;
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
  onRemoveSerie,
  onCheckDuplicate,
  onValidateField,
  fieldValidationStatus,
}: GuiaSeriesTableProps) {
  // Refs para evitar closures stale en useMemo de columnas
  const flagsRef = useRef({ disabledSerie, disabledMac, disabledEmtaMac, disabledUa });
  flagsRef.current = { disabledSerie, disabledMac, disabledEmtaMac, disabledUa };
  const formRef = useRef(productSubForm);
  formRef.current = productSubForm;
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;
  const onRemoveSerieRef = useRef(onRemoveSerie);
  onRemoveSerieRef.current = onRemoveSerie;
  const onCheckDuplicateRef = useRef(onCheckDuplicate);
  onCheckDuplicateRef.current = onCheckDuplicate;
  const onValidateFieldRef = useRef(onValidateField);
  onValidateFieldRef.current = onValidateField;
  const fieldValidationStatusRef = useRef(fieldValidationStatus);
  fieldValidationStatusRef.current = fieldValidationStatus;
  const watchedSeriesRef = useRef(watchedSeries);
  watchedSeriesRef.current = watchedSeries;

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
          <div className="flex items-center gap-1">
            <FormInput
              id={`series-${index}-serie`}
              name={`series.${index}.serie`}
              control={form.control}
              disabled={disabledSerie}
              placeholder="SN123456"
              uppercase
              className={cn("h-7 text-xs", disabledSerie && "opacity-40 cursor-not-allowed")}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdvanceRef.current(index, "serie"); } }}
              onBlur={() => {
                const val = formRef.current.getValues(`series.${index}.serie`);
                onCheckDuplicateRef.current?.(index, "serie", val);
                void onValidateFieldRef.current?.(index, "serie", val);
              }}
            />
            <ValidationIcon status={fieldValidationStatusRef.current?.[`${index}.serie`]} />
          </div>
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
          <div className="flex items-center gap-1">
            <Controller
              control={form.control}
              name={`series.${index}.mac` as any}
              render={({ field, fieldState }) => (
                <FormInput
                  id={`series-${index}-mac`}
                  name={`series.${index}.mac`}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(formatMac(e.target.value))}
                  onBlur={() => {
                    field.onBlur();
                    onCheckDuplicateRef.current?.(index, "mac", field.value);
                    void onValidateFieldRef.current?.(index, "mac", field.value);
                  }}
                  disabled={disabledMac}
                  placeholder="001A2B3C4D5E"
                  error={fieldState.error?.message}
                  className={cn("h-7 text-xs font-mono", disabledMac && "opacity-40 cursor-not-allowed")}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdvanceRef.current(index, "mac"); } }}
                />
              )}
            />
            <ValidationIcon status={fieldValidationStatusRef.current?.[`${index}.mac`]} />
          </div>
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
          <div className="flex items-center gap-1">
            <FormInput
              id={`series-${index}-emta_mac`}
              name={`series.${index}.emta_mac`}
              control={form.control}
              disabled={disabledEmtaMac}
              placeholder="001A2B3C4D5E"
              maxLength={12}
              className={cn("h-7 text-xs font-mono", disabledEmtaMac && "opacity-40 cursor-not-allowed")}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdvanceRef.current(index, "emta_mac"); } }}
              onBlur={() => {
                const val = formRef.current.getValues(`series.${index}.emta_mac`);
                onCheckDuplicateRef.current?.(index, "emta_mac", val);
                void onValidateFieldRef.current?.(index, "emta_mac", val);
              }}
            />
            <ValidationIcon status={fieldValidationStatusRef.current?.[`${index}.emta_mac`]} />
          </div>
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
          <div className="flex items-center gap-1">
            <FormInput
              id={`series-${index}-ua`}
              name={`series.${index}.ua`}
              control={form.control}
              disabled={disabledUa}
              placeholder="Ingrese UA"
              uppercase
              className={cn("h-7 text-xs font-mono", disabledUa && "opacity-40 cursor-not-allowed")}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdvanceRef.current(index, "ua"); } }}
              onBlur={() => {
                const val = formRef.current.getValues(`series.${index}.ua`);
                onCheckDuplicateRef.current?.(index, "ua", val);
                void onValidateFieldRef.current?.(index, "ua", val);
              }}
            />
            <ValidationIcon status={fieldValidationStatusRef.current?.[`${index}.ua`]} />
          </div>
        );
      },
    },
    {
      id: "eliminar",
      header: "",
      cell: ({ row }) => {
        const index = row.index;
        const canDelete = watchedSeriesRef.current.length > 1;
        return (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={!canDelete}
            onClick={() => onRemoveSerieRef.current(index)}
          >
            <Trash2 className="size-3" />
          </Button>
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
