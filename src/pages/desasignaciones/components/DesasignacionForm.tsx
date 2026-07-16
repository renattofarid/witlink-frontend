import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wrench, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { successToast, errorToast } from "@/lib/core.function";
import { cn } from "@/lib/utils";
import { api } from "@/lib/config";
import type {
  InventarioTecnicoApiResponse,
  MaterialInventarioItem,
  SerieInventarioItem,
} from "@/pages/inventario-tecnico/lib/inventario-tecnico.interface";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import { createDesasignacion } from "../lib/desasignacion.actions";
import { DesasignacionComplete } from "../lib/desasignacion.constants";
import { useTecnicoDesasignacionQuery } from "../lib/desasignacion.hook";
import type { DesasignacionCreateBody } from "../lib/desasignacion.interface";

interface DesasignacionFormProps {
  onSuccess?: () => void;
}

interface MaterialSelection {
  material: MaterialInventarioItem;
  cantidad: number;
}

export default function DesasignacionForm({ onSuccess }: DesasignacionFormProps) {
  const queryClient = useQueryClient();

  const [tecnicoId, setTecnicoId] = useState("");
  const [selectedSerieIds, setSelectedSerieIds] = useState<Set<number>>(new Set());
  const [materialSelections, setMaterialSelections] = useState<
    Record<number, MaterialSelection>
  >({});
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState("");
  const [searchSerie, setSearchSerie] = useState("");

  const { data: inventario, isLoading } = useQuery({
    queryKey: ["inventario-tecnico-raw", tecnicoId],
    queryFn: async () => {
      const { data } = await api.get<InventarioTecnicoApiResponse>(
        `/tecnicos/${tecnicoId}/inventario`,
      );
      return data;
    },
    enabled: !!tecnicoId,
    refetchOnWindowFocus: true,
  });

  const materiales = useMemo(() => inventario?.materiales ?? [], [inventario]);
  const series = useMemo(() => inventario?.series ?? [], [inventario]);

  const handleTecnicoChange = (value: string) => {
    setTecnicoId(value);
    setSelectedSerieIds(new Set());
    setMaterialSelections({});
    setError("");
  };

  const toggleSerie = (serieId: number) => {
    setSelectedSerieIds((prev) => {
      const next = new Set(prev);
      if (next.has(serieId)) next.delete(serieId);
      else next.add(serieId);
      return next;
    });
    setError("");
  };

  const handleMaterialQty = (item: MaterialInventarioItem, delta: number) => {
    setMaterialSelections((prev) => {
      const current = prev[item.id]?.cantidad ?? 0;
      const max = Number(item.cantidad);
      const next = Math.min(Math.max(0, current + delta), max);
      if (next === 0) {
        const { [item.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: { material: item, cantidad: next } };
    });
    setError("");
  };

  const handleMaterialQtyInput = (item: MaterialInventarioItem, val: string) => {
    const max = Number(item.cantidad);
    const n = Math.min(Math.max(0, Number(val) || 0), max);
    setMaterialSelections((prev) => {
      if (n === 0) {
        const { [item.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: { material: item, cantidad: n } };
    });
    setError("");
  };

  const mutation = useMutation({
    mutationFn: (body: DesasignacionCreateBody) => createDesasignacion(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DesasignacionComplete.QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["inventario-tecnico-raw", tecnicoId] });
      successToast("Desasignación creada correctamente.");
      onSuccess?.();
    },
    onError: (err: any) => {
      errorToast(err.response?.data?.message ?? "Error al crear la desasignación.");
    },
  });

  const serieCount = selectedSerieIds.size;
  const materialCount = Object.keys(materialSelections).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tecnicoId) {
      setError("Seleccione un técnico");
      return;
    }
    if (serieCount === 0 && materialCount === 0) {
      setError("Debe seleccionar al menos una serie o un material");
      return;
    }
    setError("");

    const body: DesasignacionCreateBody = {
      tecnico_id: Number(tecnicoId),
    };

    if (serieCount > 0) {
      body.series = Array.from(selectedSerieIds);
    }
    if (materialCount > 0) {
      body.materiales = Object.values(materialSelections).map(({ material, cantidad }) => ({
        producto_id: material.material.producto.id,
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
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Datos de la desasignación
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Técnico</Label>
          <SearchableSelectAsync
            value={tecnicoId}
            onChange={handleTecnicoChange}
            placeholder="Seleccionar técnico..."
            useQueryHook={useTecnicoDesasignacionQuery}
            mapOptionFn={(item: PersonaResource) => ({
              value: String(item.id),
              label: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
              description: item.dni,
            })}
            perPage={20}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <Wrench className="size-3.5" />
            Series / Equipos
            {serieCount > 0 && (
              <Badge className="ml-1 text-xs h-4 px-1">{serieCount}</Badge>
            )}
          </h3>
          <Separator className="flex-1" />
        </div>

        {!tecnicoId ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Seleccione un técnico para ver su inventario.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Cargando...</p>
        ) : series.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            El técnico no tiene series asignadas.
          </p>
        ) : (
          <>
          <div>
            <h3>Buscar serie: </h3>
            <Input placeholder="Ingrese el código de la serie..." 
              value={searchSerie}
              onChange={(e) => setSearchSerie(e.target.value.toUpperCase())}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {series.filter((item) => item.serie?.serie?.includes(searchSerie)).map((item) => (
              <SerieCard
                key={item.id}
                item={item}
                selected={selectedSerieIds.has(item.serie.id)}
                onToggle={() => toggleSerie(item.serie.id)}
              />
            ))}
          </div></>
          
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap flex items-center gap-1">
            <Package className="size-3.5" />
            Materiales
            {materialCount > 0 && (
              <Badge className="ml-1 text-xs h-4 px-1">{materialCount}</Badge>
            )}
          </h3>
          <Separator className="flex-1" />
        </div>

        {!tecnicoId ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Seleccione un técnico para ver su inventario.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Cargando...</p>
        ) : materiales.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            El técnico no tiene materiales asignados.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {materiales.map((item) => (
              <MaterialCard
                key={item.id}
                item={item}
                qty={materialSelections[item.id]?.cantidad ?? 0}
                onQtyChange={(delta) => handleMaterialQty(item, delta)}
                onQtyInput={(val) => handleMaterialQtyInput(item, val)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Observaciones (opcional)</Label>
        <Textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Motivo de la devolución..."
          rows={2}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear desasignación"}
        </Button>
      </div>
    </form>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SerieCard({
  item,
  selected,
  onToggle,
}: {
  item: SerieInventarioItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "border rounded-lg p-3 flex items-start gap-2 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent",
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {item.serie.producto.nombre}
        </p>
        <p className="text-xs text-muted-foreground font-mono">Serie: {item.serie.serie}</p>
        <p className="text-xs text-muted-foreground">{item.serie.producto.sap}</p>
      </div>
      {selected && (
        <Check className="size-4 text-primary shrink-0" />
      )}
    </button>
  );
}

function MaterialCard({
  item,
  qty,
  onQtyChange,
  onQtyInput,
}: {
  item: MaterialInventarioItem;
  qty: number;
  onQtyChange: (delta: number) => void;
  onQtyInput: (val: string) => void;
}) {
  const max = Number(item.cantidad);
  return (
    <div
      className={cn(
        "border rounded-lg p-3 flex flex-col gap-2 transition-colors",
        qty > 0 ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">
            {item.material.producto.nombre}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {item.material.producto.sap}
          </p>
        </div>
        <Badge color={max > 0 ? "green" : "red"} className="text-xs shrink-0">
          Asignado: {max}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-6"
          disabled={qty === 0}
          onClick={() => onQtyChange(-1)}
        >
          −
        </Button>
        <Input
          type="number"
          className="h-6 w-14 text-center text-xs px-1"
          min={0}
          max={max}
          value={qty}
          onChange={(e) => onQtyInput(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-6"
          disabled={qty >= max}
          onClick={() => onQtyChange(1)}
        >
          +
        </Button>
        {qty > 0 && (
          <span className="text-xs text-primary font-semibold ml-auto">✓ {qty} sel.</span>
        )}
      </div>
    </div>
  );
}
