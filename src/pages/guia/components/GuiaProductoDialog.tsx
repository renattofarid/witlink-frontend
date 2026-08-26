import { useCallback, useEffect } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import type { ProductoFormValues, SerieFormValues } from "../lib/guia.schema";
import { GuiaProductoDialogHeader } from "./GuiaProductoDialogHeader";
import { GuiaProductoSelector } from "./GuiaProductoSelector";
import { GuiaProductoFlags } from "./GuiaProductoFlags";
import { GuiaSeriesTable } from "./GuiaSeriesTable";

const EMPTY_SERIE: SerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  emta_mac: "",
  ua: "",
  observaciones: null,
};

function isRequiredFlag(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

interface GuiaProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  productSubForm: UseFormReturn<ProductoFormValues>;
  watchedSeries: SerieFormValues[];
  onClose: () => void;
  onSubmit: () => void;
  onAppendSerie: (serie: SerieFormValues) => void;
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
  fieldValidationStatus?: Record<string, "idle" | "loading" | "valid" | "invalid">;
  // Duplicados contra otro producto ya agregado a la guía, mantenidos en
  // estado propio del padre (no en formState.errors) porque la revalidación
  // onChange del schema de Zod pisa cualquier error manual apenas se edita
  // otro campo del mismo producto. Ver comentario en GuiaForm.tsx.
  crossProductDuplicates?: Record<string, boolean>;
  onGenerarSeries?: (series: SerieFormValues[]) => void;
  isSubmitting?: boolean;
}

export function GuiaProductoDialog({
  open,
  editingIndex,
  productSubForm,
  watchedSeries,
  onClose,
  onSubmit,
  onAppendSerie,
  onRemoveSerie,
  onCheckDuplicate,
  onValidateField,
  fieldValidationStatus,
  crossProductDuplicates,
  onGenerarSeries,
  isSubmitting,
}: GuiaProductoDialogProps) {
  const watchedTipo = useWatch({
    control: productSubForm.control,
    name: "tipo",
  });
  const necesitaSerie = useWatch({
    control: productSubForm.control,
    name: "necesita_serie",
  });
  const necesitaMac = useWatch({
    control: productSubForm.control,
    name: "necesita_mac",
  });
  const necesitaEmtaMac = useWatch({
    control: productSubForm.control,
    name: "necesita_emta_mac",
  });
  const necesitaUa = useWatch({
    control: productSubForm.control,
    name: "necesita_ua",
  });
  const watchedCantidad = useWatch({
    control: productSubForm.control,
    name: "cantidad",
  });

  const hasBlockingFieldValidation = Object.values(fieldValidationStatus ?? {}).some(
    (status) => status === "invalid" || status === "loading",
  );

  // Errores del formulario a nivel de series: duplicados dentro del mismo
  // producto (marcados por el schema, ver serieSchema en guia.schema.ts) o
  // duplicados contra otro producto de la guía (ver checkCrossProductDuplicate).
  // Antes no se consultaban aquí, por lo que el botón "Agregar/Actualizar"
  // quedaba habilitado aunque el formulario mostrara series marcadas como
  // "Duplicado" o "Ya existe en otro producto".
  const seriesErrors = productSubForm.formState.errors.series;
  const hasSeriesFieldErrors = Array.isArray(seriesErrors)
    ? seriesErrors.some(
        (rowError) => rowError && Object.keys(rowError).length > 0,
      )
    : !!seriesErrors;
  const hasCrossProductDuplicates = Object.values(
    crossProductDuplicates ?? {},
  ).some(Boolean);

  const isEquipo = watchedTipo === "EQUIPO";
  const requiresSerie = isRequiredFlag(necesitaSerie);
  const requiresMac = isRequiredFlag(necesitaMac);
  const requiresEmtaMac = isRequiredFlag(necesitaEmtaMac);
  const requiresUa = isRequiredFlag(necesitaUa);
  const disabledSerie = !requiresSerie;
  const disabledMac = !requiresMac;
  const disabledEmtaMac = !requiresEmtaMac;
  const disabledUa = !requiresUa;
  const needsSeries =
    requiresSerie || requiresMac || requiresEmtaMac || requiresUa;

  // Inicializa con 1 fila vacía cuando el producto es equipo con series
  useEffect(() => {
    if (!isEquipo || !needsSeries) return;
    const series = productSubForm.getValues("series") ?? [];
    if (series.length === 0) {
      onAppendSerie({ ...EMPTY_SERIE });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEquipo, needsSeries]);

  // Sincroniza cantidad = series.length automáticamente
  useEffect(() => {
    if (!isEquipo || !needsSeries) return;
    productSubForm.setValue("cantidad", watchedSeries.length, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSeries.length, isEquipo, needsSeries]);

  // Avanza el foco al siguiente campo habilitado; al final de fila crea una nueva
  const handleAdvance = useCallback(
    (rowIndex: number, currentField: string) => {
      const activeFields = [
        !disabledSerie && "serie",
        !disabledMac && "mac",
        !disabledEmtaMac && "emta_mac",
        !disabledUa && "ua",
      ].filter(Boolean) as string[];

      const nextField = activeFields[activeFields.indexOf(currentField) + 1];

      if (nextField) {
        document.getElementById(`series-${rowIndex}-${nextField}`)?.focus();
      } else {
        const nextRow = rowIndex + 1;
        const series = productSubForm.getValues("series") ?? [];
        if (nextRow < series.length) {
          document.getElementById(`series-${nextRow}-${activeFields[0]}`)?.focus();
        } else {
          onAppendSerie({ ...EMPTY_SERIE });
          setTimeout(() => {
            document.getElementById(`series-${nextRow}-${activeFields[0]}`)?.focus();
          }, 0);
        }
      }
    },
    [disabledSerie, disabledMac, disabledEmtaMac, disabledUa, productSubForm, onAppendSerie],
  );

  if (!open) return null;

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-muted/20">
      <GuiaProductoDialogHeader
        editingIndex={editingIndex}
        productSubForm={productSubForm}
        onClose={onClose}
      />

      <GuiaProductoSelector
        productSubForm={productSubForm}
        readonlyCantidad={isEquipo && needsSeries}
      />

      <GuiaProductoFlags
        necesitaSerie={necesitaSerie}
        necesitaMac={necesitaMac}
        necesitaEmtaMac={necesitaEmtaMac}
        necesitaUa={necesitaUa}
      />

      {isEquipo && needsSeries && (
        <GuiaSeriesTable
          productSubForm={productSubForm}
          watchedSeries={watchedSeries}
          watchedCantidad={watchedCantidad}
          disabledSerie={disabledSerie}
          disabledMac={disabledMac}
          disabledEmtaMac={disabledEmtaMac}
          disabledUa={disabledUa}
          onAdvance={handleAdvance}
          onRemoveSerie={onRemoveSerie}
          onCheckDuplicate={onCheckDuplicate}
          onValidateField={onValidateField}
          fieldValidationStatus={fieldValidationStatus}
          crossProductDuplicates={crossProductDuplicates}
          onGenerarSeries={onGenerarSeries}
        />
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X className="size-3 mr-1" />
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSubmit}
          disabled={
            hasBlockingFieldValidation ||
            hasSeriesFieldErrors ||
            hasCrossProductDuplicates ||
            isSubmitting
          }
        >
          <Check className="size-3 mr-1" />
          {isSubmitting ? "Guardando..." : editingIndex !== null ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </div>
  );
}
