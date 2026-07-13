import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Wrench, Package, Check, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { successToast, errorToast } from "@/lib/core.function";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import { createSalidaAntiguamiento } from "../lib/salida-antiguamiento.actions";
import { SalidaAntiguamientoComplete } from "../lib/salida-antiguamiento.constants";
import type { SalidaAntiguamientoCreateBody } from "../lib/salida-antiguamiento.interface";

interface SalidaAntiguamientoFormProps {
  onSuccess?: () => void;
}

interface MaterialSelection {
  producto_id: number;
  nombre: string;
  sap?: string;
  cantidad: number;
}

export default function SalidaAntiguamientoForm({
  onSuccess,
}: SalidaAntiguamientoFormProps) {
  const queryClient = useQueryClient();

  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [serieInput, setSerieInput] = useState("");

  const [productoId, setProductoId] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoResource | null>(null);
  const [cantidadInput, setCantidadInput] = useState("");
  const [materialesList, setMaterialesList] = useState<MaterialSelection[]>([]);

  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState("");

  const handleAddSerie = () => {
    const trimmed = serieInput.trim().toUpperCase();
    if (!trimmed) return;
    if (seriesList.includes(trimmed)) {
      setError("Esta serie ya fue agregada");
      return;
    }
    setSeriesList((prev) => [...prev, trimmed]);
    setSerieInput("");
    setError("");
  };

  const handleSerieKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSerie();
    }
  };

  const handleRemoveSerie = (serie: string) => {
    setSeriesList((prev) => prev.filter((s) => s !== serie));
  };

  const handleAddMaterial = () => {
    const cantidad = Number(cantidadInput);
    if (!productoId || !productoSeleccionado) {
      setError("Seleccione un producto");
      return;
    }
    if (!cantidad || cantidad <= 0) {
      setError("Ingrese una cantidad válida");
      return;
    }
    if (materialesList.some((m) => m.producto_id === Number(productoId))) {
      setError("Este producto ya fue agregado");
      return;
    }
    setMaterialesList((prev) => [
      ...prev,
      {
        producto_id: Number(productoId),
        nombre: productoSeleccionado.nombre,
        sap: productoSeleccionado.sap,
        cantidad,
      },
    ]);
    setProductoId("");
    setProductoSeleccionado(null);
    setCantidadInput("");
    setError("");
  };

  const handleRemoveMaterial = (producto_id: number) => {
    setMaterialesList((prev) => prev.filter((m) => m.producto_id !== producto_id));
  };

  const mutation = useMutation({
    mutationFn: (body: SalidaAntiguamientoCreateBody) => createSalidaAntiguamiento(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SalidaAntiguamientoComplete.QUERY_KEY] });
      successToast("Salida por antigüamiento creada correctamente.");
      onSuccess?.();
    },
    onError: (err: any) => {
      errorToast(err.response?.data?.message ?? "Error al crear la salida por antigüamiento.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (seriesList.length === 0 && materialesList.length === 0) {
      setError("Debe agregar al menos una serie o un material");
      return;
    }
    setError("");

    const body: SalidaAntiguamientoCreateBody = {};

    if (seriesList.length > 0) {
      body.series = seriesList;
    }
    if (materialesList.length > 0) {
      body.materiales = materialesList.map(({ producto_id, cantidad }) => ({
        producto_id,
        cantidad,
      }));
    }
    if (observaciones.trim()) {
      body.observaciones = observaciones.trim();
    }

    mutation.mutate(body);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <Wrench className="size-3.5" />
            Series / Equipos
            {seriesList.length > 0 && (
              <Badge className="ml-1 text-xs h-4 px-1">{seriesList.length}</Badge>
            )}
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="flex gap-2">
          <Input
            value={serieInput}
            onChange={(e) => {
              setSerieInput(e.target.value.toUpperCase());
              if (error) setError("");
            }}
            onKeyDown={handleSerieKeyDown}
            placeholder="Ingresar número de serie y presionar Enter..."
            className="font-mono"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0"
            onClick={handleAddSerie}
            disabled={!serieInput.trim()}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        {seriesList.length > 0 && (
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {seriesList.map((serie, index) => (
              <div
                key={serie}
                className="flex items-center gap-2 rounded-md border px-2 py-2 bg-background"
              >
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                  {index + 1}.
                </span>
                <Check className="size-3 text-green-500 shrink-0" />
                <span className="flex-1 text-sm font-mono">{serie}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleRemoveSerie(serie)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <Package className="size-3.5" />
            Materiales
            {materialesList.length > 0 && (
              <Badge className="ml-1 text-xs h-4 px-1">{materialesList.length}</Badge>
            )}
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0">
            <SearchableSelectAsync
              value={productoId}
              onChange={setProductoId}
              placeholder="Buscar por nombre o SAP..."
              useQueryHook={useProductoQuery}
              mapOptionFn={(item: ProductoResource) => ({
                value: String(item.id),
                label: item.nombre,
                description: item.sap,
              })}
              onValueChange={(_, item: ProductoResource) => {
                setProductoSeleccionado(item ?? null);
                if (error) setError("");
              }}
              perPage={20}
            />
          </div>
          <Input
            type="number"
            min={1}
            value={cantidadInput}
            onChange={(e) => {
              setCantidadInput(e.target.value);
              if (error) setError("");
            }}
            placeholder="Cantidad"
            className="sm:w-28"
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={handleAddMaterial}
          >
            <Plus className="size-4 mr-1" />
            Agregar
          </Button>
        </div>

        {materialesList.length > 0 && (
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {materialesList.map((m, index) => (
              <div
                key={m.producto_id}
                className="flex items-center gap-2 rounded-md border px-2 py-2 bg-background"
              >
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                  {index + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.nombre}</p>
                  <p className="text-xs text-muted-foreground font-mono">{m.sap}</p>
                </div>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary shrink-0">
                  ×{m.cantidad}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleRemoveMaterial(m.producto_id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Observaciones (opcional)</Label>
        <Textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Motivo de la baja por antigüamiento..."
          rows={2}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear salida"}
        </Button>
      </div>
    </form>
  );
}
