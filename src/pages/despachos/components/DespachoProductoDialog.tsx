import React, { useState, useEffect, useRef, useCallback } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormInput } from "@/components/FormInput";
import { Separator } from "@/components/ui/separator";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { X, Check, Trash2, Loader2, Plus } from "lucide-react";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import { validateSerieDisponible } from "../lib/despacho.actions";
import type {
  DespachoProductoFormValues,
  DespachoSerieFormValues,
} from "../lib/despacho.schema";

interface DespachoProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  productSubForm: UseFormReturn<DespachoProductoFormValues>;
  watchedSeries: DespachoSerieFormValues[];
  onClose: () => void;
  onSubmit: () => void;
  onAppendSerie: (serie: DespachoSerieFormValues) => void;
  onRemoveSerie: (index: number) => void;
}

export function DespachoProductoDialog({
  open,
  editingIndex,
  productSubForm,
  watchedSeries,
  onClose,
  onSubmit,
  onAppendSerie,
  onRemoveSerie,
}: DespachoProductoDialogProps) {
  const [serieInput, setSerieInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [inputError, setInputError] = useState("");
  const [seriesError, setSeriesError] = useState("");
  const isValidatingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const watchedProductoId = useWatch({
    control: productSubForm.control,
    name: "producto_id",
  });

  // Auto-sync cantidad with confirmed series count
  useEffect(() => {
    productSubForm.setValue("cantidad", watchedSeries.length || 0);
    if (watchedSeries.length > 0) setSeriesError("");
  }, [watchedSeries.length, productSubForm]);

  // Reset input state when dialog closes or opens for a new product
  useEffect(() => {
    if (!open) {
      setSerieInput("");
      setInputError("");
      setSeriesError("");
    }
  }, [open]);

  const handleValidateSerie = useCallback(async () => {
    if (isValidatingRef.current) return;
    const trimmed = serieInput.trim().toUpperCase();
    if (!trimmed) return;

    if (watchedSeries.some((s) => s.serie?.toUpperCase() === trimmed)) {
      setInputError("Esta serie ya fue agregada");
      return;
    }

    isValidatingRef.current = true;
    setIsValidating(true);
    setInputError("");
    try {
      const result = await validateSerieDisponible({
        serie: trimmed,
        producto_id: watchedProductoId,
      });
      onAppendSerie({ serie: result.serie ?? trimmed, serie_id: result.id });
      setSerieInput("");
      inputRef.current?.focus();
    } catch (error: any) {
      setInputError(
        error.response?.data?.message ?? error.message ?? "Serie no disponible",
      );
    } finally {
      isValidatingRef.current = false;
      setIsValidating(false);
    }
  }, [serieInput, watchedSeries, watchedProductoId, onAppendSerie]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleValidateSerie();
    }
  };

  const handleDialogSubmit = () => {
    if (watchedSeries.length === 0) {
      setSeriesError("Debe agregar al menos una serie");
      return;
    }
    onSubmit();
  };

  if (!open) return null;

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {editingIndex !== null
            ? `Editando producto #${editingIndex + 1}`
            : "Agregar producto"}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
        >
          <X className="size-3" />
        </Button>
      </div>

      {/* Producto + Cantidad (deshabilitada) */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <FormSelectAsync
          name="producto_id"
          label="Producto"
          control={productSubForm.control}
          placeholder="Buscar por nombre o SAP..."
          useQueryHook={useProductoQuery}
          mapOptionFn={(item: ProductoResource) => ({
            value: String(item.id),
            label: item.nombre,
            description: item.sap + " | " + item.tipo,
          })}
          onValueChange={(_, item: ProductoResource) => {
            if (item) {
              productSubForm.setValue("nombre", item.nombre ?? null);
              productSubForm.setValue("sap", item.sap ?? null);
            }
          }}
          required
        />

        <FormInput
          name="cantidad"
          label="Cantidad"
          control={productSubForm.control}
          type="number"
          disabled
        />
      </div>

      {/* Series */}
      <div className="space-y-2">
        <Separator />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Series ({watchedSeries.length})
        </p>

        {/* Lista de series confirmadas */}
        {watchedSeries.length > 0 && (
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {watchedSeries.map((s, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md border px-2 py-1.5 bg-background"
              >
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                  {index + 1}.
                </span>
                <Check className="size-3 text-green-500 shrink-0" />
                <span className="flex-1 text-sm font-mono">{s.serie}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-destructive hover:text-destructive shrink-0"
                  onClick={() => onRemoveSerie(index)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input para ingresar nueva serie — solo si hay producto seleccionado */}
        {watchedProductoId && (
          <div className="space-y-1">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={serieInput}
                onChange={(e) => {
                  setSerieInput(e.target.value.toUpperCase());
                  if (inputError) setInputError("");
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => handleValidateSerie()}
                placeholder="Ingresar número de serie y presionar Enter..."
                className={`font-mono${inputError ? " border-destructive" : ""}`}
                disabled={isValidating}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="shrink-0"
                onClick={handleValidateSerie}
                disabled={isValidating || !serieInput.trim()}
              >
                {isValidating ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Plus className="size-3" />
                )}
              </Button>
            </div>
            {inputError && (
              <p className="text-xs text-destructive">{inputError}</p>
            )}
          </div>
        )}

        {seriesError && (
          <p className="text-xs text-destructive">{seriesError}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X className="size-3 mr-1" />
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={handleDialogSubmit}>
          <Check className="size-3 mr-1" />
          {editingIndex !== null ? "Actualizar producto" : "Agregar producto"}
        </Button>
      </div>
    </div>
  );
}
