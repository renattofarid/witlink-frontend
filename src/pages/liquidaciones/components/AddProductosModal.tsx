import { useState, useMemo } from "react";
import { Search, Minus, Plus, Check, Package, Wrench, List } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

  const [showOtrosMateriales, setShowOtrosMateriales] = useState(false);
  const [otrosMaterialSearch, setOtrosMaterialSearch] = useState("");
  const [showOtrosEquipos, setShowOtrosEquipos] = useState(false);
  const [otrosEquipSearch, setOtrosEquipSearch] = useState("");

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

  const filteredOtrosMateriales = useMemo(
    () =>
      materiales.filter((m) =>
        (m.material.producto.nombre + m.material.producto.sap)
          .toLowerCase()
          .includes(otrosMaterialSearch.toLowerCase()),
      ),
    [materiales, otrosMaterialSearch],
  );

  const filteredOtrosEquipos = useMemo(
    () =>
      series.filter((s) =>
        (s.serie.producto.nombre + s.serie.serie)
          .toLowerCase()
          .includes(otrosEquipSearch.toLowerCase()),
      ),
    [series, otrosEquipSearch],
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
      const next = Math.min(Math.max(0, current + delta), item.cantidad);
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

  const matCount = Object.keys(materialSelections).length;
  const eqCount = Object.keys(serieSelections).length;
  const totalSeleccionado = matCount + eqCount;

  return (
    <>
      <GeneralModal
        open={open}
        onClose={onClose}
        title="Agregar productos"
        subtitle="Selecciona materiales o equipos del inventario del técnico"
        icon="PackagePlus"
        size="4xl"
        childrenFooter={
          <div className="flex items-center justify-between w-full pt-2">
            <p className="text-xs text-muted-foreground">
              {totalSeleccionado === 0 ? (
                "Sin selección"
              ) : (
                <>
                  {matCount > 0 && (
                    <span>{matCount} material{matCount !== 1 ? "es" : ""}</span>
                  )}
                  {matCount > 0 && eqCount > 0 && (
                    <span className="mx-1.5 opacity-40">|</span>
                  )}
                  {eqCount > 0 && (
                    <span>{eqCount} equipo{eqCount !== 1 ? "s" : ""} seleccionado{eqCount !== 1 ? "s" : ""}</span>
                  )}
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={totalSeleccionado === 0}>
                Confirmar
              </Button>
            </div>
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
              onNameResolved={(nombre) => {
                if (!tecnicoNombre) setTecnicoNombre(nombre);
              }}
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
                {matCount > 0 && (
                  <Badge className="ml-1 text-xs h-4 px-1">{matCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="equipos" className="flex-1 gap-1">
                <Wrench className="size-3.5" />
                Equipos / Series
                {eqCount > 0 && (
                  <Badge className="ml-1 text-xs h-4 px-1">{eqCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Tab Materiales ────────────────────────────────────────────── */}
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
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-70 overflow-y-auto pr-1">
                    {filteredMateriales.map((item) => (
                      <MaterialCard
                        key={item.id}
                        item={item}
                        qty={materialSelections[item.id]?.cantidad ?? 0}
                        onQtyChange={(delta) => handleMaterialQty(item, delta)}
                        onQtyInput={(val) => handleMaterialQtyInput(item, val)}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs w-full text-muted-foreground hover:text-foreground"
                    onClick={() => setShowOtrosMateriales(true)}
                  >
                    <List className="size-3 mr-1.5" />
                    Otros materiales ({materiales.length} disponibles)
                  </Button>
                </>
              )}
            </TabsContent>

            {/* ── Tab Equipos ───────────────────────────────────────────────── */}
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
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-70 overflow-y-auto pr-1">
                    {filteredSeries.map((item) => (
                      <SerieCard
                        key={item.id}
                        item={item}
                        selected={!!serieSelections[item.id]}
                        onToggle={() => toggleSerie(item)}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs w-full text-muted-foreground hover:text-foreground"
                    onClick={() => setShowOtrosEquipos(true)}
                  >
                    <List className="size-3 mr-1.5" />
                    Otros equipos ({series.length} disponibles)
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </GeneralModal>

      {/* ── Sheet: Otros materiales ─────────────────────────────────────────── */}
      <Sheet open={showOtrosMateriales} onOpenChange={setShowOtrosMateriales}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col gap-0 p-0"
        >
          <SheetHeader className="px-4 pt-4 pb-3 border-b">
            <SheetTitle className="text-sm flex items-center gap-2">
              <Package className="size-4" />
              Todos los materiales
            </SheetTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-xs"
                placeholder="Buscar material..."
                value={otrosMaterialSearch}
                onChange={(e) => setOtrosMaterialSearch(e.target.value)}
              />
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {filteredOtrosMateriales.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin resultados.
              </p>
            ) : (
              filteredOtrosMateriales.map((item) => (
                <MaterialCard
                  key={item.id}
                  item={item}
                  qty={materialSelections[item.id]?.cantidad ?? 0}
                  onQtyChange={(delta) => handleMaterialQty(item, delta)}
                  onQtyInput={(val) => handleMaterialQtyInput(item, val)}
                />
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {matCount > 0
                ? `${matCount} material${matCount !== 1 ? "es" : ""} seleccionado${matCount !== 1 ? "s" : ""}`
                : "Sin selección"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOtrosMateriales(false)}
            >
              Cerrar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Sheet: Otros equipos ────────────────────────────────────────────── */}
      <Sheet open={showOtrosEquipos} onOpenChange={setShowOtrosEquipos}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg flex flex-col gap-0 p-0"
        >
          <SheetHeader className="px-4 pt-4 pb-3 border-b">
            <SheetTitle className="text-sm flex items-center gap-2">
              <Wrench className="size-4" />
              Todos los equipos
            </SheetTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-xs"
                placeholder="Buscar equipo o serie..."
                value={otrosEquipSearch}
                onChange={(e) => setOtrosEquipSearch(e.target.value)}
              />
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {filteredOtrosEquipos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin resultados.
              </p>
            ) : (
              filteredOtrosEquipos.map((item) => (
                <SerieCard
                  key={item.id}
                  item={item}
                  selected={!!serieSelections[item.id]}
                  onToggle={() => toggleSerie(item)}
                />
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {eqCount > 0
                ? `${eqCount} equipo${eqCount !== 1 ? "s" : ""} seleccionado${eqCount !== 1 ? "s" : ""}`
                : "Sin selección"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOtrosEquipos(false)}
            >
              Cerrar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
          disabled={qty === 0 || item.cantidad === 0}
          onClick={() => onQtyChange(-1)}
        >
          <Minus className="size-3" />
        </Button>
        <Input
          type="number"
          className="h-6 w-14 text-center text-xs px-1"
          min={0}
          max={item.cantidad}
          value={qty}
          onChange={(e) => onQtyInput(e.target.value)}
          disabled={item.cantidad === 0}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-6"
          disabled={qty >= item.cantidad}
          onClick={() => onQtyChange(1)}
        >
          <Plus className="size-3" />
        </Button>
        {qty > 0 && (
          <span className="text-xs text-primary font-semibold ml-auto">
            ✓ {qty} sel.
          </span>
        )}
      </div>
    </div>
  );
}

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
            <span className="font-mono text-foreground">{item.serie.mac}</span>
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
}
