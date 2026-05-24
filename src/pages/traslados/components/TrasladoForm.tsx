import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [seriesCart, setSeriesCart] = useState<SerieCartItem[]>(draft?.seriesCart ?? []);
  const [materialsCart, setMaterialsCart] = useState<MaterialCartItem[]>(draft?.materialsCart ?? []);
  const [cartError, setCartError] = useState<string | null>(null);

  const [serieInput, setSerieInput] = useState("");
  const [serieSearching, setSerieSearching] = useState(false);
  const [serieMatches, setSerieMatches] = useState<SerieResource[]>([]);
  const [serieError, setSerieError] = useState<string | null>(null);
  const serieInputRef = useRef<HTMLInputElement>(null);

  const [materialInput, setMaterialInput] = useState("");
  const [materialSearching, setMaterialSearching] = useState(false);
  const [materialMatches, setMaterialMatches] = useState<MaterialResource[]>([]);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [pendingMaterial, setPendingMaterial] = useState<MaterialResource | null>(null);
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

  // Mirror cart state to refs for cleanup
  const seriesCartRef = useRef(seriesCart);
  seriesCartRef.current = seriesCart;
  const materialsCartRef = useRef(materialsCart);
  materialsCartRef.current = materialsCart;

  // Save draft on unmount (skip if submitted successfully)
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

  const handleSerieKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleMaterialKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={tipo} onValueChange={handleTabChange}>
        <TabsList className="w-fit min-w-72">
          <TabsTrigger value="serie" className="flex-1">
            Serie
          </TabsTrigger>
          <TabsTrigger value="material" className="flex-1">
            Material
          </TabsTrigger>
        </TabsList>

        <TabsContent value="serie" className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Serie</Label>
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
                placeholder="Escribir código de serie y presionar Enter..."
                disabled={serieSearching}
              />
              {serieSearching && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {serieError && (
              <p className="text-xs text-destructive">{serieError}</p>
            )}
            {serieMatches.length > 0 && (
              <div className="border rounded-md divide-y text-sm shadow-sm">
                {serieMatches.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted flex flex-col"
                    onClick={() => addSerie(item)}
                  >
                    <span className="font-medium">
                      {item.serie ?? `Serie #${item.id}`}
                    </span>
                    {item.producto?.nombre && (
                      <span className="text-xs text-muted-foreground">
                        {item.producto.nombre}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {seriesCart.length > 0 && (
            <div className="border rounded-md divide-y text-sm">
              {seriesCart.map((item) => (
                <div
                  key={item.serie_id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{item.label}</span>
                    {item.producto && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.producto}
                      </span>
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
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

        </TabsContent>

        <TabsContent value="material" className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Material</Label>
            <div className="relative">
              <Input
                ref={materialInputRef}
                value={materialInput}
                onChange={(e) => {
                  setMaterialInput(e.target.value);
                  setMaterialError(null);
                  setMaterialMatches([]);
                  if (pendingMaterial) setPendingMaterial(null);
                }}
                onKeyDown={handleMaterialKeyDown}
                placeholder="Buscar material y presionar Enter..."
                disabled={materialSearching}
              />
              {materialSearching && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {materialError && (
              <p className="text-xs text-destructive">{materialError}</p>
            )}
            {materialMatches.length > 0 && (
              <div className="border rounded-md divide-y text-sm shadow-sm">
                {materialMatches.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted flex flex-col"
                    onClick={() => handleSelectMaterialMatch(item)}
                  >
                    <span className="font-medium">
                      {item.producto?.nombre ?? `Material #${item.id}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Stock disponible: {item.cantidad}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {pendingMaterial && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm">
                <span className="flex-1 font-medium">
                  {pendingMaterial.producto?.nombre ?? `Material #${pendingMaterial.id}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  Stock: {pendingMaterial.cantidad}
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setPendingMaterial(null);
                    setCantidadInput("");
                    setCantidadError(null);
                    materialInputRef.current?.focus();
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <Label>Cantidad</Label>
              <Input
                ref={cantidadInputRef}
                type="number"
                value={cantidadInput}
                onChange={(e) => {
                  setCantidadInput(e.target.value);
                  setCantidadError(null);
                }}
                onKeyDown={handleCantidadKeyDown}
                placeholder="Ingresar cantidad y presionar Enter..."
                step="0.01"
                min="0.01"
              />
              {cantidadError && (
                <p className="text-xs text-destructive">{cantidadError}</p>
              )}
            </div>
          )}

          {materialsCart.length > 0 && (
            <div className="border rounded-md divide-y text-sm">
              {materialsCart.map((item) => (
                <div
                  key={item.material_id}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      Cantidad: {item.cantidad}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setMaterialsCart((prev) =>
                        prev.filter((i) => i.material_id !== item.material_id),
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {cartError && <p className="text-sm text-destructive">{cartError}</p>}

      <FormSelect
        name="destino_almacen_id"
        label="Almacén destino"
        control={form.control}
        placeholder={
          loadingAlmacenes ? "Cargando..." : "Seleccionar almacén..."
        }
        options={almacenOptions}
        disabled={loadingAlmacenes}
        required
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear traslado"}
        </Button>
      </div>
    </form>
  );
}
