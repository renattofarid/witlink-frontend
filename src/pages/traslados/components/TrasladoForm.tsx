import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Loader2,
  Package,
  Boxes,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormSelect } from "@/components/FormSelect";
import { successToast, errorToast } from "@/lib/core.function";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getSeries } from "@/pages/serie/lib/serie.actions";
import { getMateriales } from "@/pages/materiales/lib/materiales.actions";
import {
  createTrasladoSeries,
  createTrasladoMateriales,
} from "../lib/traslado.actions";
import { TrasladoComplete } from "../lib/traslado.constants";
import {
  trasladoCreateSchema,
  type TrasladoCreateFormValues,
} from "../lib/traslado.schema";
import {
  useTrasladoDraftStore,
  type TrasladoSerieCartItem as SerieCartItem,
  type TrasladoMaterialCartItem as MaterialCartItem,
} from "../lib/traslado-draft.store";
import type { SerieResource } from "@/pages/serie/lib/serie.interface";
import type { MaterialResource } from "@/pages/materiales/lib/materiales.interface";

interface TrasladoFormProps {
  onSuccess?: () => void;
}

export default function TrasladoForm({ onSuccess }: TrasladoFormProps) {
  const queryClient = useQueryClient();
  const almacen_id = useAuthStore((s) => s.almacen_id);
  const { draft, setDraft, clearDraft } = useTrasladoDraftStore();
  const submittedRef = useRef(false);

  const [seriesCart, setSeriesCart] = useState<SerieCartItem[]>(
    draft?.seriesCart ?? [],
  );
  const [materialsCart, setMaterialsCart] = useState<MaterialCartItem[]>(
    draft?.materialsCart ?? [],
  );
  const [cartError, setCartError] = useState<string | null>(null);

  const [serieInput, setSerieInput] = useState("");
  const [serieSearching, setSerieSearching] = useState(false);
  const [serieMatches, setSerieMatches] = useState<SerieResource[]>([]);
  const [serieError, setSerieError] = useState<string | null>(null);
  const serieInputRef = useRef<HTMLInputElement>(null);

  const [materialInput, setMaterialInput] = useState("");
  const [materialSearching, setMaterialSearching] = useState(false);
  const [materialMatches, setMaterialMatches] = useState<MaterialResource[]>(
    [],
  );
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [pendingMaterial, setPendingMaterial] =
    useState<MaterialResource | null>(null);
  const [cantidadInput, setCantidadInput] = useState("");
  const [cantidadError, setCantidadError] = useState<string | null>(null);
  const materialInputRef = useRef<HTMLInputElement>(null);
  const cantidadInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TrasladoCreateFormValues>({
    resolver: zodResolver(trasladoCreateSchema),
    defaultValues: {
      tipo: draft?.tipo ?? "serie",
      serie_id: "",
      destino_almacen_id: draft?.destino_almacen_id ?? "",
      modo_retirados: false,
      material_id: "",
      cantidad: "",
    },
  });

  const seriesCartRef = useRef(seriesCart);
  seriesCartRef.current = seriesCart;
  const materialsCartRef = useRef(materialsCart);
  materialsCartRef.current = materialsCart;

  useEffect(() => {
    return () => {
      if (!submittedRef.current) {
        setDraft({
          tipo: form.getValues("tipo"),
          destino_almacen_id: form.getValues("destino_almacen_id"),
          seriesCart: seriesCartRef.current,
          materialsCart: materialsCartRef.current,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tipo = form.watch("tipo");

  const { data: almacenes = [], isLoading: loadingAlmacenes } = useQuery({
    queryKey: ["almacenes-traslado"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });

  const almacenOptions = almacenes
    .filter((a) => a.id !== almacen_id)
    .map((a) => ({ value: String(a.id), label: a.nombre }));

  const mutation = useMutation({
    mutationFn: (values: TrasladoCreateFormValues) => {
      if (values.tipo === "serie") {
        return createTrasladoSeries({
          destino_almacen_id: Number(values.destino_almacen_id),
          modo_retirados: false,
          series: seriesCart.map((i) => i.serie_id),
        });
      }
      return createTrasladoMateriales({
        destino_almacen_id: Number(values.destino_almacen_id),
        materiales: materialsCart.map((i) => ({
          material_id: i.material_id,
          cantidad: i.cantidad,
        })),
      });
    },
    onSuccess: () => {
      submittedRef.current = true;
      clearDraft();
      queryClient.invalidateQueries({ queryKey: [TrasladoComplete.QUERY_KEY] });
      successToast("Traslado creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al crear el traslado.",
      );
    },
  });

  const handleTabChange = (value: string) => {
    form.setValue("tipo", value as "serie" | "material");
    form.clearErrors();
    setCartError(null);
  };

  const addSerie = (serie: SerieResource) => {
    if (seriesCart.some((i) => i.serie_id === serie.id)) {
      setSerieError("Esta serie ya está en la lista");
      return;
    }
    setSeriesCart((prev) => [
      ...prev,
      {
        serie_id: serie.id,
        label: serie.serie ?? `Serie #${serie.id}`,
        producto: serie.producto?.nombre,
      },
    ]);
    setSerieInput("");
    setSerieMatches([]);
    setSerieError(null);
    setCartError(null);
    serieInputRef.current?.focus();
  };

  const handleSerieKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = serieInput.trim();
    if (!val) return;
    setSerieSearching(true);
    setSerieError(null);
    setSerieMatches([]);
    try {
      const result = await getSeries({ serie: val, por_pagina: "10" });
      const items = result.data ?? [];
      if (items.length === 0) {
        setSerieError(`No se encontró ninguna serie con "${val}"`);
      } else if (items.length === 1) {
        addSerie(items[0]);
      } else {
        setSerieMatches(items);
      }
    } catch {
      setSerieError("Error al buscar la serie");
    } finally {
      setSerieSearching(false);
    }
  };

  const addMaterial = (material: MaterialResource, cantidad: number) => {
    if (materialsCart.some((i) => i.material_id === material.id)) {
      setCantidadError("Este material ya está en la lista");
      return;
    }
    setMaterialsCart((prev) => [
      ...prev,
      {
        material_id: material.id,
        label: material.producto?.nombre ?? `Material #${material.id}`,
        cantidad,
      },
    ]);
    setMaterialInput("");
    setMaterialMatches([]);
    setMaterialError(null);
    setPendingMaterial(null);
    setCantidadInput("");
    setCantidadError(null);
    setCartError(null);
    materialInputRef.current?.focus();
  };

  const handleMaterialKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const val = materialInput.trim();
    if (!val) return;
    setMaterialSearching(true);
    setMaterialError(null);
    setMaterialMatches([]);
    try {
      const result = await getMateriales({ search: val, por_pagina: "10" });
      const items = result.data ?? [];
      if (items.length === 0) {
        setMaterialError(`No se encontró ningún material con "${val}"`);
      } else if (items.length === 1) {
        setPendingMaterial(items[0]);
        setTimeout(() => cantidadInputRef.current?.focus(), 50);
      } else {
        setMaterialMatches(items);
      }
    } catch {
      setMaterialError("Error al buscar el material");
    } finally {
      setMaterialSearching(false);
    }
  };

  const handleSelectMaterialMatch = (material: MaterialResource) => {
    setPendingMaterial(material);
    setMaterialMatches([]);
    setTimeout(() => cantidadInputRef.current?.focus(), 50);
  };

  const handleCantidadKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!pendingMaterial) return;
    const n = Number(cantidadInput);
    if (!cantidadInput || isNaN(n) || n < 0.01) {
      setCantidadError("Ingrese una cantidad válida (mínimo 0.01)");
      return;
    }
    addMaterial(pendingMaterial, n);
  };

  const handleSubmit = form.control.handleSubmit((values) => {
    const cart = values.tipo === "serie" ? seriesCart : materialsCart;
    if (cart.length === 0) {
      setCartError(
        values.tipo === "serie"
          ? "Agregue al menos una serie a la lista"
          : "Agregue al menos un material a la lista",
      );
      return;
    }
    setCartError(null);
    mutation.mutate(values);
  });

  const currentCartCount =
    tipo === "serie" ? seriesCart.length : materialsCart.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="bg-muted/40 rounded-lg p-4 border">
        <FormSelect
          name="destino_almacen_id"
          label="Almacén destino"
          control={form.control}
          placeholder={
            loadingAlmacenes
              ? "Cargando almacenes..."
              : "Seleccionar almacén destino..."
          }
          options={almacenOptions}
          disabled={loadingAlmacenes}
          required
        />
      </div>

      <Separator />

      <Tabs value={tipo} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="serie" className="flex-1 gap-2">
            <Package className="size-4" />
            Series
            {seriesCart.length > 0 && (
              <Badge
                color="secondary"
                className="h-5 min-w-5 px-1.5 text-xs"
              >
                {seriesCart.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="material" className="flex-1 gap-2">
            <Boxes className="size-4" />
            Materiales
            {materialsCart.length > 0 && (
              <Badge
                color="secondary"
                className="h-5 min-w-5 px-1.5 text-xs"
              >
                {materialsCart.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Series ─── */}
        <TabsContent value="serie" className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Buscar serie</Label>
            <div className="relative">
              <Input
                ref={serieInputRef}
                value={serieInput}
                onChange={(e) => {
                  setSerieInput(e.target.value);
                  setSerieError(null);
                  setSerieMatches([]);
                }}
                onKeyDown={handleSerieKeyDown}
                placeholder="Código de serie → Enter para agregar"
                disabled={serieSearching}
                className="pr-9"
              />
              {serieSearching && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {serieError && (
              <p className="text-xs text-destructive">{serieError}</p>
            )}
          </div>

          {serieMatches.length > 0 && (
            <div className="border rounded-md overflow-hidden shadow-sm">
              <div className="px-3 py-1.5 bg-muted/50 border-b">
                <p className="text-xs text-muted-foreground">
                  {serieMatches.length} resultado
                  {serieMatches.length !== 1 ? "s" : ""} — seleccione uno
                </p>
              </div>
              {serieMatches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-muted flex items-center gap-3 border-b last:border-0 transition-colors"
                  onClick={() => addSerie(item)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {item.serie ?? `Serie #${item.id}`}
                    </p>
                    {item.producto?.nombre && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.producto.nombre}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}

          {seriesCart.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <div className="px-3 py-1.5 bg-muted/50 border-b flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {seriesCart.length} serie{seriesCart.length !== 1 ? "s" : ""}{" "}
                  en la lista
                </p>
                <button
                  type="button"
                  onClick={() => setSeriesCart([])}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
              {seriesCart.map((item, idx) => (
                <div
                  key={item.serie_id}
                  className="flex items-center gap-3 px-3 py-2.5 border-b last:border-0 hover:bg-muted/30"
                >
                  <span className="text-xs text-muted-foreground w-5 text-center font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    {item.producto && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.producto}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setSeriesCart((prev) =>
                        prev.filter((i) => i.serie_id !== item.serie_id),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed rounded-md py-8 flex flex-col items-center gap-2 text-muted-foreground">
              <Package className="size-8 opacity-30" />
              <p className="text-sm">Ninguna serie agregada</p>
              <p className="text-xs">Busque por código y presione Enter</p>
            </div>
          )}
        </TabsContent>

        {/* ─── Materiales ─── */}
        <TabsContent value="material" className="mt-4 space-y-3">
          {!pendingMaterial ? (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Buscar material</Label>
              <div className="relative">
                <Input
                  ref={materialInputRef}
                  value={materialInput}
                  onChange={(e) => {
                    setMaterialInput(e.target.value);
                    setMaterialError(null);
                    setMaterialMatches([]);
                  }}
                  onKeyDown={handleMaterialKeyDown}
                  placeholder="Nombre del material → Enter para buscar"
                  disabled={materialSearching}
                  className="pr-9"
                />
                {materialSearching && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {materialError && (
                <p className="text-xs text-destructive">{materialError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-md">
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {pendingMaterial.producto?.nombre ??
                      `Material #${pendingMaterial.id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stock disponible: {pendingMaterial.cantidad}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => {
                    setPendingMaterial(null);
                    setCantidadInput("");
                    setCantidadError(null);
                    materialInputRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Cantidad a trasladar
                </Label>
                <Input
                  ref={cantidadInputRef}
                  type="number"
                  value={cantidadInput}
                  onChange={(e) => {
                    setCantidadInput(e.target.value);
                    setCantidadError(null);
                  }}
                  onKeyDown={handleCantidadKeyDown}
                  placeholder="Cantidad → Enter para agregar"
                  step="0.01"
                  min="0.01"
                />
                {cantidadError && (
                  <p className="text-xs text-destructive">{cantidadError}</p>
                )}
              </div>
            </div>
          )}

          {materialMatches.length > 0 && (
            <div className="border rounded-md overflow-hidden shadow-sm">
              <div className="px-3 py-1.5 bg-muted/50 border-b">
                <p className="text-xs text-muted-foreground">
                  {materialMatches.length} resultado
                  {materialMatches.length !== 1 ? "s" : ""} — seleccione uno
                </p>
              </div>
              {materialMatches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-muted flex items-center gap-3 border-b last:border-0 transition-colors"
                  onClick={() => handleSelectMaterialMatch(item)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {item.producto?.nombre ?? `Material #${item.id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {item.cantidad}
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}

          {materialsCart.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <div className="px-3 py-1.5 bg-muted/50 border-b flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {materialsCart.length} material
                  {materialsCart.length !== 1 ? "es" : ""} en la lista
                </p>
                <button
                  type="button"
                  onClick={() => setMaterialsCart([])}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
              {materialsCart.map((item, idx) => (
                <div
                  key={item.material_id}
                  className="flex items-center gap-3 px-3 py-2.5 border-b last:border-0 hover:bg-muted/30"
                >
                  <span className="text-xs text-muted-foreground w-5 text-center font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Cantidad: {item.cantidad}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setMaterialsCart((prev) =>
                        prev.filter(
                          (i) => i.material_id !== item.material_id,
                        ),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            !pendingMaterial && (
              <div className="border border-dashed rounded-md py-8 flex flex-col items-center gap-2 text-muted-foreground">
                <Boxes className="size-8 opacity-30" />
                <p className="text-sm">Ningún material agregado</p>
                <p className="text-xs">Busque por nombre y presione Enter</p>
              </div>
            )
          )}
        </TabsContent>
      </Tabs>

      {cartError && (
        <p className="text-sm text-destructive font-medium">{cartError}</p>
      )}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full"
        size="lg"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Creando traslado...
          </>
        ) : (
          <>
            Crear traslado
            {currentCartCount > 0 && (
              <Badge color="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {currentCartCount}
              </Badge>
            )}
          </>
        )}
      </Button>
    </form>
  );
}
