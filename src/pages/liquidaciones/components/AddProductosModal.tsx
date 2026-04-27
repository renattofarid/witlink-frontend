import { useState, useMemo } from "react";
import { Search, Minus, Plus, Check, Package, Wrench } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useInventarioTecnicoLiquidacionQuery } from "../lib/liquidaciones.hook";
import type {
  LiquidacionCartItem,
  LiquidacionResource,
} from "../lib/liquidaciones.interface";
import type {
  MaterialInventarioItem,
  SerieInventarioItem,
} from "@/pages/inventario-tecnico/lib/inventario-tecnico.interface";
import TecnicoSelector from "./TecnicoSelector";

interface AddProductosModalProps {
  open: boolean;
  onClose: () => void;
  liquidacion: LiquidacionResource;
  onConfirm: (items: LiquidacionCartItem[]) => void;
}

// ── Carrito temporal interno del modal ────────────────────────────────────────

interface MaterialSelection {
  material: MaterialInventarioItem;
  cantidad: number;
}

export default function AddProductosModal({
  open,
  onClose,
  liquidacion,
  onConfirm,
}: AddProductosModalProps) {
  const [tecnicoId, setTecnicoId] = useState(
    liquidacion.tecnico1 ? String(liquidacion.tecnico1) : "",
  );
  const [tecnicoNombre, setTecnicoNombre] = useState("");

  const [materialSearch, setMaterialSearch] = useState("");
  const [equipSearch, setEquipSearch] = useState("");

  const [materialSelections, setMaterialSelections] = useState<
    Record<number, MaterialSelection>
  >({});
  const [serieSelections, setSerieSelections] = useState<
    Record<number, SerieInventarioItem>
  >({});

  const { data: inventario, isLoading } =
    useInventarioTecnicoLiquidacionQuery(tecnicoId || null);

  const materiales: MaterialInventarioItem[] = inventario?.materiales ?? [];
  const series: SerieInventarioItem[] = inventario?.series ?? [];

  const filteredMateriales = useMemo(
    () =>
      materiales.filter((m) =>
        (m.material.producto.nombre + m.material.producto.sap)
          .toLowerCase()
          .includes(materialSearch.toLowerCase()),
      ),
    [materiales, materialSearch],
  );

  const filteredSeries = useMemo(
    () =>
      series.filter((s) =>
        (s.serie.producto.nombre + s.serie.serie)
          .toLowerCase()
          .includes(equipSearch.toLowerCase()),
      ),
    [series, equipSearch],
  );

  const handleTecnicoChange = (id: string, nombre: string) => {
    setTecnicoId(id);
    setTecnicoNombre(nombre);
    setMaterialSelections({});
    setSerieSelections({});
  };

  const handleMaterialQty = (item: MaterialInventarioItem, delta: number) => {
    setMaterialSelections((prev) => {
      const current = prev[item.id]?.cantidad ?? 0;
      const next = Math.min(
        Math.max(0, current + delta),
        item.cantidad,
      );
      if (next === 0) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: { material: item, cantidad: next } };
    });
  };

  const handleMaterialQtyInput = (
    item: MaterialInventarioItem,
    val: string,
  ) => {
    const n = Math.min(Math.max(0, Number(val) || 0), item.cantidad);
    setMaterialSelections((prev) => {
      if (n === 0) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: { material: item, cantidad: n } };
    });
  };

  const toggleSerie = (item: SerieInventarioItem) => {
    setSerieSelections((prev) => {
      if (prev[item.id]) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: item };
    });
  };

  const handleConfirm = () => {
    const cartItems: LiquidacionCartItem[] = [];

    Object.values(materialSelections).forEach(({ material, cantidad }) => {
      cartItems.push({
        tempId: `mat-${material.id}-${Date.now()}-${Math.random()}`,
        tipo: "material",
        producto_id: material.material.producto.id,
        producto_nombre: material.material.producto.nombre,
        producto_sap: material.material.producto.sap,
        tecnico_id: Number(tecnicoId),
        tecnico_nombre: tecnicoNombre,
        cantidad,
        series: [],
      });
    });

    // Agrupar series por producto
    const seriesByProducto: Record<
      number,
      { series: Array<{ id: number; serie: string }>; item: SerieInventarioItem }
    > = {};
    Object.values(serieSelections).forEach((s) => {
      const pid = s.serie.producto.id;
      if (!seriesByProducto[pid]) {
        seriesByProducto[pid] = { series: [], item: s };
      }
      seriesByProducto[pid].series.push({ id: s.id, serie: s.serie.serie });
    });

    Object.values(seriesByProducto).forEach(({ series: ss, item }) => {
      cartItems.push({
        tempId: `eq-${item.serie.producto.id}-${Date.now()}-${Math.random()}`,
        tipo: "serie",
        producto_id: item.serie.producto.id,
        producto_nombre: item.serie.producto.nombre,
        producto_sap: item.serie.producto.sap,
        tecnico_id: Number(tecnicoId),
        tecnico_nombre: tecnicoNombre,
        cantidad: ss.length,
        series: ss,
      });
    });

    onConfirm(cartItems);
    setMaterialSelections({});
    setSerieSelections({});
    onClose();
  };

  const totalSeleccionado =
    Object.keys(materialSelections).length +
    Object.keys(serieSelections).length;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Agregar productos"
      subtitle="Selecciona materiales o equipos del inventario del técnico"
      icon="PackagePlus"
      size="4xl"
      childrenFooter={
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={totalSeleccionado === 0}
          >
            Confirmar ({totalSeleccionado} seleccionados)
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Selector de técnico */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Inventario a mostrar
          </Label>
          <TecnicoSelector
            value={tecnicoId}
            onChange={handleTecnicoChange}
          />
          <p className="text-xs text-muted-foreground">
            Puede ver el inventario de otra persona para tomar materiales o equipos.
          </p>
        </div>

        <Tabs defaultValue="materiales">
          <TabsList className="w-full">
            <TabsTrigger value="materiales" className="flex-1 gap-1">
              <Package className="size-3.5" />
              Materiales
              {Object.keys(materialSelections).length > 0 && (
                <Badge className="ml-1 text-xs h-4 px-1">
                  {Object.keys(materialSelections).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="equipos" className="flex-1 gap-1">
              <Wrench className="size-3.5" />
              Equipos / Series
              {Object.keys(serieSelections).length > 0 && (
                <Badge className="ml-1 text-xs h-4 px-1">
                  {Object.keys(serieSelections).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab Materiales ─────────────────────────────────────────────── */}
          <TabsContent value="materiales" className="mt-3">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-xs"
                placeholder="Buscar material..."
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
              />
            </div>

            {!tecnicoId ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Selecciona un técnico para ver su inventario.
              </p>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : filteredMateriales.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin materiales disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
                {filteredMateriales.map((item) => {
                  const sel = materialSelections[item.id];
                  const qty = sel?.cantidad ?? 0;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "border rounded-lg p-3 flex flex-col gap-2 transition-colors",
                        qty > 0
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card",
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
                        <Badge
                          color={item.cantidad > 0 ? "green" : "red"}
                          className="text-xs shrink-0"
                        >
                          Stock: {item.cantidad}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-6"
                          disabled={qty === 0}
                          onClick={() => handleMaterialQty(item, -1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Input
                          type="number"
                          className="h-6 w-14 text-center text-xs px-1"
                          min={0}
                          max={item.cantidad}
                          value={qty}
                          onChange={(e) =>
                            handleMaterialQtyInput(item, e.target.value)
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-6"
                          disabled={qty >= item.cantidad}
                          onClick={() => handleMaterialQty(item, 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                        {qty > 0 && (
                          <span className="text-xs text-primary font-semibold ml-auto">
                            ✓ {qty} seleccionado{qty !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Tab Equipos ────────────────────────────────────────────────── */}
          <TabsContent value="equipos" className="mt-3">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-xs"
                placeholder="Buscar equipo o serie..."
                value={equipSearch}
                onChange={(e) => setEquipSearch(e.target.value)}
              />
            </div>

            {!tecnicoId ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Selecciona un técnico para ver sus equipos.
              </p>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : filteredSeries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin equipos disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
                {filteredSeries.map((item) => {
                  const selected = !!serieSelections[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSerie(item)}
                      className={cn(
                        "border rounded-lg p-3 text-left flex flex-col gap-1.5 transition-colors w-full",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">
                            {item.serie.producto.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Serie: {item.serie.serie}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "size-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground",
                          )}
                        >
                          {selected && <Check className="size-3" />}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.serie.mac && (
                          <span className="text-xs text-muted-foreground">
                            MAC:{" "}
                            <span className="font-mono text-foreground">
                              {item.serie.mac}
                            </span>
                          </span>
                        )}
                        {item.serie.situacion && (
                          <Badge variant="outline" className="text-xs">
                            {item.serie.situacion}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </GeneralModal>
  );
}
