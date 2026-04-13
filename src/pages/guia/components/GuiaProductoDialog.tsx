import { useEffect } from "react";
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

interface GuiaProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  tab: "catalogo" | "manual";
  productSubForm: UseFormReturn<ProductoFormValues>;
  watchedSeries: SerieFormValues[];
  onClose: () => void;
  onSubmit: () => void;
  onTabChange: (tab: "catalogo" | "manual") => void;
  onAppendSerie: (serie: SerieFormValues) => void;
  onRemoveSerie: (index: number) => void;
}

export function GuiaProductoDialog({
  open,
  editingIndex,
  tab,
  productSubForm,
  watchedSeries,
  onClose,
  onSubmit,
  onTabChange,
  onAppendSerie,
  onRemoveSerie,
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

  const isEquipo = watchedTipo === "equipo";
  const disabledSerie = necesitaSerie !== true;
  const disabledMac = necesitaMac !== true;
  const disabledEmtaMac = necesitaEmtaMac !== true;
  const disabledUa = necesitaUa !== true;
  const needsSeries =
    !!necesitaSerie || !!necesitaMac || !!necesitaEmtaMac || !!necesitaUa;

  useEffect(() => {
    if (!isEquipo || !needsSeries) return;
    const target = Number(watchedCantidad) || 0;
    const current = productSubForm.getValues("series")?.length ?? 0;
    if (current < target) {
      for (let i = current; i < target; i++) onAppendSerie({ ...EMPTY_SERIE });
    } else if (current > target) {
      for (let i = current - 1; i >= target; i--) onRemoveSerie(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCantidad, isEquipo, needsSeries]);

  if (!open) return null;

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-muted/20">
      <GuiaProductoDialogHeader
        editingIndex={editingIndex}
        tab={tab}
        productSubForm={productSubForm}
        onTabChange={onTabChange}
        onClose={onClose}
      />

      <GuiaProductoSelector tab={tab} productSubForm={productSubForm} />

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
        />
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X className="size-3 mr-1" />
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={onSubmit}>
          <Check className="size-3 mr-1" />
          {editingIndex !== null ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </div>
  );
}
