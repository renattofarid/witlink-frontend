import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Minus,
  Plus,
  Package,
  Wrench,
  List,
  Loader2,
  X,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { getSeries } from "@/pages/serie/lib/serie.actions";
import TecnicoSelector from "./TecnicoSelector";

interface AddProductosModalProps {
  open: boolean;
  onClose: () => void;
  liquidacion: LiquidacionResource;
  onConfirm: (items: LiquidacionCartItem[]) => void;
  initialTecnicoId?: string;
}

interface MaterialSelection {
  material: MaterialInventarioItem;
  cantidad: number;
}

interface SelectedExternSerie {
  serie_id: number;
  serie_str: string;
  producto_id: number;
  producto_nombre: string;
  producto_sap: string;
  situacion_label: string;
  mac: string | null;
  tecnico_nombre?: string | null;
}

export default function AddProductosModal({
  open,
  onClose,
  liquidacion,
  onConfirm,
  initialTecnicoId,
}: AddProductosModalProps) {
  const [tecnicoId, setTecnicoId] = useState(
    initialTecnicoId ??
      (liquidacion.tecnico1 ? String(liquidacion.tecnico1.id) : ""),
  );
  const [tecnicoNombre, setTecnicoNombre] = useState("");
  const [selfTecnicoNombre, setSelfTecnicoNombre] = useState("");

  const [materialSearch, setMaterialSearch] = useState("");
  const [materialSelections, setMaterialSelections] = useState<
    Record<number, MaterialSelection>
  >({});
  const [selectedExternSeries, setSelectedExternSeries] = useState<
    SelectedExternSerie[]
  >([]);

  const [showOtrosMateriales, setShowOtrosMateriales] = useState(false);
  const [otrosMaterialSearch, setOtrosMaterialSearch] = useState("");

  const [serieSearch, setSerieSearch] = useState("");
  const [showBuscarGlobal, setShowBuscarGlobal] = useState(false);

  const { data: inventario, isLoading } = useInventarioTecnicoLiquidacionQuery(
    tecnicoId || null,
  );

  const materiales: MaterialInventarioItem[] = inventario?.materiales ?? [];
  const seriesInventario = inventario?.series ?? [];

  const filteredMateriales = useMemo(
    () =>
      materiales.filter((m) =>
        (m.material.producto.nombre + m.material.producto.sap)
          .toLowerCase()
          .includes(materialSearch.toLowerCase()),
      ),
    [materiales, materialSearch],
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

  const filteredSeriesInventario = useMemo(
    () =>
      seriesInventario.filter((s: any) =>
        (s.serie.producto.nombre + s.serie.producto.sap + s.serie.serie)
          .toLowerCase()
          .includes(serieSearch.toLowerCase()),
      ),
    [seriesInventario, serieSearch],
  );

  const handleTecnicoChange = (id: string, nombre: string) => {
    setTecnicoId(id);
    setTecnicoNombre(nombre);
    setMaterialSelections({});
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

  const addExternSerie = (serie: SelectedExternSerie) => {
    setSelectedExternSeries((prev) => {
      if (prev.some((s) => s.serie_id === serie.serie_id)) return prev;
      return [...prev, serie];
    });
  };

  const removeExternSerie = (serieId: number) => {
    setSelectedExternSeries((prev) =>
      prev.filter((s) => s.serie_id !== serieId),
    );
  };

  const toggleOwnSerie = (item: SerieInventarioItem) => {
    if (selectedExternSeries.some((s) => s.serie_id === item.serie.id)) {
      removeExternSerie(item.serie.id);
      return;
    }
    addExternSerie({
      serie_id: item.serie.id,
      serie_str: item.serie.serie,
      producto_id: item.serie.producto.id,
      producto_nombre: item.serie.producto.nombre,
      producto_sap: item.serie.producto.sap,
      situacion_label: item.serie.situacion,
      mac: item.serie.mac,
      tecnico_nombre: null,
    });
  };

  const handleConfirm = () => {
    const cartItems: LiquidacionCartItem[] = [];
    const selfId = Number(initialTecnicoId ?? tecnicoId);

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
      {
        series: Array<{ id: number; serie: string }>;
        nombre: string;
        sap: string;
      }
    > = {};
    selectedExternSeries.forEach((s) => {
      if (!seriesByProducto[s.producto_id]) {
        seriesByProducto[s.producto_id] = {
          series: [],
          nombre: s.producto_nombre,
          sap: s.producto_sap,
        };
      }
      seriesByProducto[s.producto_id].series.push({
        id: s.serie_id,
        serie: s.serie_str,
      });
    });

    Object.entries(seriesByProducto).forEach(
      ([pid, { series: ss, nombre, sap }]) => {
        cartItems.push({
          tempId: `eq-${pid}-${Date.now()}-${Math.random()}`,
          tipo: "serie",
          producto_id: Number(pid),
          producto_nombre: nombre,
          producto_sap: sap,
          tecnico_id: selfId,
          tecnico_nombre: selfTecnicoNombre,
          cantidad: ss.length,
          series: ss,
        });
      },
    );

    onConfirm(cartItems);
    setMaterialSelections({});
    setSelectedExternSeries([]);
    onClose();
  };

  const matCount = Object.keys(materialSelections).length;
  const eqCount = selectedExternSeries.length;
  const totalSeleccionado = matCount + eqCount;

  const selectedSerieIds = useMemo(
    () => new Set(selectedExternSeries.map((s) => s.serie_id)),
    [selectedExternSeries],
  );

  return (
    <>
      <GeneralModal
        open={open}
        onClose={onClose}
        title="Agregar productos"
        subtitle="Busca equipos por serie o selecciona materiales del inventario"
        icon="PackagePlus"
        size="4xl"
        childrenFooter={
          <div className="flex items-center justify-between w-full pt-2">
            <p className="text-xs text-muted-foreground">
              {totalSeleccionado === 0 ? (
                "Sin selección"
              ) : (
                <>
                  {eqCount > 0 && (
                    <span>
                      {eqCount} equipo{eqCount !== 1 ? "s" : ""} seleccionado
                      {eqCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {matCount > 0 && eqCount > 0 && (
                    <span className="mx-1.5 opacity-40">|</span>
                  )}
                  {matCount > 0 && (
                    <span>
                      {matCount} material{matCount !== 1 ? "es" : ""}
                    </span>
                  )}
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={totalSeleccionado === 0}
              >
                Confirmar
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Selector de técnico — inventario a mostrar por defecto */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Inventario a mostrar (materiales y equipos)
            </Label>
            <TecnicoSelector
              value={tecnicoId}
              onChange={handleTecnicoChange}
              onNameResolved={(nombre) => {
                if (!tecnicoNombre) {
                  setTecnicoNombre(nombre);
                  setSelfTecnicoNombre(nombre);
                }
              }}
            />
            {!tecnicoId ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="size-3 shrink-0" />
                No hay técnico seleccionado
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Cambia el técnico para ver otro inventario.
              </p>
            )}
          </div>

          {initialTecnicoId &&
            tecnicoId &&
            tecnicoId !== initialTecnicoId &&
            tecnicoNombre && (
              <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                <span>
                  Estás viendo el inventario de{" "}
                  <span className="font-semibold">{tecnicoNombre}</span>, no
                  del técnico principal asignado.
                </span>
              </div>
            )}

          <Tabs defaultValue="equipos">
            <TabsList className="w-full">
              <TabsTrigger value="equipos" className="flex-1 gap-1">
                <Wrench className="size-3.5" />
                Equipos / Series
                {eqCount > 0 && (
                  <Badge className="ml-1 text-xs h-4 px-1">{eqCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="materiales" className="flex-1 gap-1">
                <Package className="size-3.5" />
                Materiales
                {matCount > 0 && (
                  <Badge className="ml-1 text-xs h-4 px-1">{matCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Tab Equipos ───────────────────────────────────────────────── */}
            <TabsContent value="equipos" className="mt-3 space-y-3">
              {!tecnicoId ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Selecciona un técnico para ver su inventario.
                </p>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      className="pl-8 h-8 text-xs"
                      placeholder="Buscar equipo del inventario del técnico..."
                      value={serieSearch}
                      onChange={(e) => setSerieSearch(e.target.value)}
                    />
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-lg" />
                      ))}
                    </div>
                  ) : filteredSeriesInventario.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Sin equipos disponibles en el inventario del técnico.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {filteredSeriesInventario.map((item: any) => (
                        <SerieInventarioCard
                          key={item.id}
                          item={item}
                          selected={selectedSerieIds.has(item.serie.id)}
                          onToggle={() => toggleOwnSerie(item)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs w-full text-muted-foreground hover:text-foreground"
                onClick={() => setShowBuscarGlobal((prev) => !prev)}
              >
                <Search className="size-3 mr-1.5" />
                {showBuscarGlobal
                  ? "Ocultar búsqueda en todo el sistema"
                  : "Buscar equipo en todo el sistema (otros técnicos)"}
              </Button>

              {showBuscarGlobal && (
                <div className="space-y-3 border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    Busca cualquier serie en el sistema. Si pertenece a otro
                    técnico se te avisará antes de agregar.
                  </p>
                  <SerieAsyncSearch
                    onSelect={addExternSerie}
                    selectedIds={selectedSerieIds}
                    initialTecnicoId={initialTecnicoId}
                  />
                </div>
              )}

              {selectedExternSeries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Sin equipos seleccionados.
                </p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedExternSeries.map((s) => (
                    <ExternSerieCard
                      key={s.serie_id}
                      item={s}
                      onRemove={() => removeExternSerie(s.serie_id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

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
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SerieAsyncSearch({
  onSelect,
  selectedIds,
  initialTecnicoId,
}: {
  onSelect: (serie: SelectedExternSerie) => void;
  selectedIds: Set<number>;
  initialTecnicoId?: string;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [pendingSerie, setPendingSerie] = useState<SelectedExternSerie | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["series-search-liquidacion", debouncedSearch],
    queryFn: () =>
      getSeries({ search: debouncedSearch, por_pagina: "10", pagina: "1" }),
    enabled: debouncedSearch.length >= 2,
  });

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timerRef.current);
  }, [search]);

  const results = data?.data ?? [];
  const showDropdown = debouncedSearch.length >= 2;

  const handleSerieClick = (serie: (typeof results)[number]) => {
    const item: SelectedExternSerie = {
      serie_id: serie.id,
      serie_str: serie.serie ?? "",
      producto_id: serie.producto.id,
      producto_nombre: serie.producto.nombre,
      producto_sap: serie.producto.sap,
      situacion_label: serie.situacion_label,
      mac: serie.mac ?? null,
      tecnico_nombre: serie.tecnico ? `${serie.tecnico.nombre}` : null,
    };

    const isOtraTecnico =
      serie.tecnico &&
      initialTecnicoId &&
      String(serie.tecnico.id) !== initialTecnicoId;

    const isOtraPersonaSinId =
      !serie.tecnico && serie.situacion_label === "DESPACHADO";

    if (isOtraTecnico || isOtraPersonaSinId) {
      setPendingSerie(item);
    } else {
      onSelect(item);
    }
  };

  return (
    <>
      <div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8 pr-8 h-8 text-xs"
            placeholder="Buscar por número de serie, producto, MAC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        {showDropdown && (
          <div className="mt-1 border rounded-lg overflow-hidden max-h-52 overflow-y-auto">
            {results.length === 0 && !isLoading ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                Sin resultados para &ldquo;{debouncedSearch}&rdquo;
              </p>
            ) : (
              results.map((serie) => {
                const isSelected = selectedIds.has(serie.id);
                const ownerName = serie.tecnico
                  ? `${serie.tecnico.nombre}`
                  : null;
                const isDifferentOwner =
                  (serie.tecnico &&
                    initialTecnicoId &&
                    String(serie.tecnico.id) !== initialTecnicoId) ||
                  (!serie.tecnico && serie.situacion_label === "DESPACHADO");

                return (
                  <button
                    key={serie.id}
                    type="button"
                    disabled={isSelected}
                    onClick={() => handleSerieClick(serie)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs border-b last:border-b-0 transition-colors",
                      isSelected
                        ? "opacity-50 cursor-not-allowed bg-muted"
                        : "hover:bg-accent",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {serie.producto?.nombre}
                        </p>
                        <p className="text-muted-foreground font-mono">
                          Serie: {serie.serie}
                        </p>
                        {serie.mac && (
                          <p className="text-muted-foreground">
                            MAC: {serie.mac}
                          </p>
                        )}
                        {isDifferentOwner && (
                          <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="size-3 shrink-0" />
                            {ownerName
                              ? `Pertenece a: ${ownerName}`
                              : "Asignado a otro técnico"}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {serie.situacion_label}
                        </Badge>
                        {isSelected && (
                          <span className="text-xs text-primary font-medium">
                            Agregado
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!pendingSerie}
        onOpenChange={(open) => {
          if (!open) setPendingSerie(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Equipo de otro técnico
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSerie?.tecnico_nombre ? (
                <>
                  Este equipo pertenece a{" "}
                  <span className="font-semibold text-foreground">
                    {pendingSerie.tecnico_nombre}
                  </span>
                  . Al agregarlo se registrará en la liquidación proveniente de
                  esa persona.
                </>
              ) : (
                <>
                  Este equipo está actualmente{" "}
                  <span className="font-semibold text-foreground">
                    DESPACHADO
                  </span>{" "}
                  a otro técnico. Al agregarlo se registrará en la liquidación
                  proveniente de esa persona.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingSerie) onSelect(pendingSerie);
                setPendingSerie(null);
              }}
            >
              Agregar de todas formas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SerieInventarioCard({
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
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-accent",
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {item.serie.producto.nombre}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          Serie: {item.serie.serie}
        </p>
        {item.serie.mac && (
          <p className="text-xs text-muted-foreground">MAC: {item.serie.mac}</p>
        )}
      </div>
      {selected && (
        <span className="text-xs text-primary font-semibold shrink-0">
          ✓ sel.
        </span>
      )}
    </button>
  );
}

function ExternSerieCard({
  item,
  onRemove,
}: {
  item: SelectedExternSerie;
  onRemove: () => void;
}) {
  return (
    <div className="border border-primary bg-primary/5 rounded-lg p-3 flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {item.producto_nombre}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          Serie: {item.serie_str}
        </p>
        {item.mac && (
          <p className="text-xs text-muted-foreground">MAC: {item.mac}</p>
        )}
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <MapPin className="size-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {item.situacion_label}
          </Badge>
          {item.tecnico_nombre && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <AlertTriangle className="size-3" />
              {item.tecnico_nombre}
            </span>
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <X className="size-3.5" />
      </Button>
    </div>
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
