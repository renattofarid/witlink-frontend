import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormInput } from "@/components/FormInput";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { successToast, errorToast } from "@/lib/core.function";
import { Trash2, Pencil, PackagePlus } from "lucide-react";
import {
  despachoCreateSchema,
  type DespachoCreateFormValues,
  type DespachoProductoFormValues,
  type DespachoSerieFormValues,
} from "../lib/despacho.schema";
import { createDespacho } from "../lib/despacho.actions";
import { DespachoComplete } from "../lib/despacho.constants";
import { useTecnicoDespachoQuery } from "../lib/despacho.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import type {
  DespachoCreateBody,
  MasivoSerieValidadaItem,
} from "../lib/despacho.interface";
import { DespachoProductoDialog } from "./DespachoProductoDialog";
import { DespachoMasivoSeriesInput } from "./DespachoMasivoSeriesInput";
import { DespachoSotSeriesPanel } from "./DespachoSotSeriesPanel";
import { despachoProductoSchema } from "../lib/despacho.schema";

void despachoProductoSchema;

const EMPTY_PRODUCTO: DespachoProductoFormValues = {
  producto_id: "",
  nombre: null,
  sap: null,
  tipo: null,
  cantidad: 1,
  series: [],
};

interface DespachoFormProps {
  onSuccess?: () => void;
}

export default function DespachoForm({ onSuccess }: DespachoFormProps) {
  const queryClient = useQueryClient();
  const isCorporativo = !!useAuthStore((s) => s.user?.is_corporativo);
  const almacen_id = useAuthStore((s) => s.almacen_id);

  const [masivoSeries, setMasivoSeries] = useState<MasivoSerieValidadaItem[]>([]);
  const [masivoError, setMasivoError] = useState("");
  const [combinedError, setCombinedError] = useState("");

  const [editingProductoIndex, setEditingProductoIndex] = useState<number | null>(null);
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);

  // ── Main form ──────────────────────────────────────────────────────────────
  const form = useForm<DespachoCreateFormValues & { sot?: string }>({
    resolver: zodResolver(despachoCreateSchema) as any,
    defaultValues: { tecnico_id: "", productos: [], sot: "" },
    mode: "onChange",
  });

  const {
    append: appendProducto,
    remove: removeProducto,
    update: updateProductoField,
  } = useFieldArray({ control: form.control, name: "productos" });

  // Debounce de la SOT para no disparar la búsqueda de reservas en cada tecla.
  const sotValue = form.watch("sot") ?? "";
  const [debouncedSot, setDebouncedSot] = useState("");
  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSot(sotValue.trim().toUpperCase()),
      400,
    );
    return () => clearTimeout(timeout);
  }, [sotValue]);

  // ── Product sub-form ───────────────────────────────────────────────────────
  const productSubForm = useForm<DespachoProductoFormValues>({
    resolver: zodResolver(despachoProductoSchema) as any,
    defaultValues: EMPTY_PRODUCTO,
    mode: "onChange",
  });

  const {
    append: appendSerie,
    remove: removeSerie,
    update: updateSerie,
  } = useFieldArray({ control: productSubForm.control, name: "series" });

  const watchedSeries = productSubForm.watch("series") ?? [];

  // ── Handlers: producto ─────────────────────────────────────────────────────
  const handleAddOrUpdateProducto = productSubForm.control.handleSubmit((values) => {
    const filteredSeries = (values.series ?? []).filter(
      (s) => s.serie_id || (s.serie && s.serie.trim() !== ""),
    );
    const cleanValues = {
      ...values,
      series: filteredSeries,
      cantidad: filteredSeries.length > 0 ? filteredSeries.length : values.cantidad,
    };
    if (editingProductoIndex === null) {
      appendProducto(cleanValues);
    } else {
      updateProductoField(editingProductoIndex, cleanValues);
      setEditingProductoIndex(null);
    }
    productSubForm.reset(EMPTY_PRODUCTO);
    setProductoDialogOpen(false);
    setCombinedError("");
  });

  const handleOpenProductoDialog = () => {
    productSubForm.reset(EMPTY_PRODUCTO);
    setEditingProductoIndex(null);
    setProductoDialogOpen(true);
  };

  const handleEditProducto = (index: number) => {
    const producto = form.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
    setProductoDialogOpen(true);
  };

  const handleCloseProductoDialog = () => {
    setProductoDialogOpen(false);
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
  };

  // ── Mutation ───────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (body: DespachoCreateBody) => createDespacho(body),
    onSuccess: () => {
      form.reset({ tecnico_id: "", productos: [], sot: "" });
      setMasivoSeries([]);
      queryClient.invalidateQueries({ queryKey: [DespachoComplete.QUERY_KEY] });
      successToast("Despacho creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al crear el despacho.",
      );
    },
  });

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleFormSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();

    const isTecnicoValid = await form.trigger("tecnico_id");
    if (!isTecnicoValid) return;

    const productos = form.getValues("productos");
    const hasProductos = productos.length > 0;
    const hasSeries = masivoSeries.length > 0;

    if (!hasProductos && !hasSeries) {
      setCombinedError("Debe agregar al menos un producto o una serie");
      return;
    }

    const sotValue = (form.getValues("sot") ?? "").trim();
    if (isCorporativo && !sotValue) {
      setCombinedError("La SOT es obligatoria para despachos corporativos");
      return;
    }
    setCombinedError("");

    const body: DespachoCreateBody = {
      tecnico_id: Number(form.getValues("tecnico_id")),
      ...(isCorporativo ? { sot: sotValue } : {}),
    };

    if (hasProductos) {
      body.productos = productos.map((p) => ({
        id: Number(p.producto_id),
        cantidad: p.cantidad,
        series: (p.series ?? [])
          .filter((s) => s.serie && s.serie.trim() !== "")
          .map((s) => ({ serie: s.serie!.trim().toUpperCase() })),
      }));
    }

    if (hasSeries) {
      body.series = masivoSeries.map((s) => s.serie);
    }

    mutation.mutate(body);
  };

  // ── Columns: tabla resumen de productos ────────────────────────────────────
  const watchedProductos = form.watch("productos");

  // Series ya presentes en el despacho (masivo o dentro de un producto), para
  // no volver a sugerirlas en el panel de reservas SOT.
  const existingSeriesSet = useMemo(() => {
    const set = new Set<string>();
    masivoSeries.forEach((s) => set.add(s.serie.toUpperCase()));
    watchedProductos.forEach((p) =>
      (p.series ?? []).forEach((s) => {
        if (s.serie) set.add(s.serie.trim().toUpperCase());
      }),
    );
    return set;
  }, [masivoSeries, watchedProductos]);

  const productoColumns: ColumnDef<DespachoProductoFormValues>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.index + 1}</span>
      ),
    },
    {
      id: "producto",
      header: "Producto",
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {row.original.nombre || row.original.sap || "—"}
        </span>
      ),
    },
    {
      id: "sap",
      header: "SAP",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.sap || "—"}
        </span>
      ),
    },
    {
      id: "cantidad",
      header: "Cant.",
      cell: ({ row }) => row.original.cantidad,
    },
    {
      id: "series",
      header: "Series",
      cell: ({ row }) => {
        const series = (row.original.series ?? []).filter(
          (s) => s.serie && s.serie.trim() !== "",
        );
        if (!series.length)
          return (
            <span className="text-muted-foreground text-xs">Sin series</span>
          );
        return (
          <Badge variant="default" className="text-xs">
            {series.length} serie{series.length !== 1 ? "s" : ""}
          </Badge>
        );
      },
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => handleEditProducto(row.index)}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => {
              if (editingProductoIndex === row.index) handleCloseProductoDialog();
              removeProducto(row.index);
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* ── Sección 1: Técnico ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Datos del despacho
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormSelectAsync
            name="tecnico_id"
            label="Técnico"
            control={form.control}
            placeholder="Seleccionar técnico..."
            useQueryHook={useTecnicoDespachoQuery}
            mapOptionFn={(item: PersonaResource) => ({
              value: String(item.id),
              label: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
              description: item.dni,
            })}
            perPage={20}
            required
          />
          {isCorporativo && (
            <FormInput
              name="sot"
              label="SOT"
              control={form.control}
              placeholder="Ingrese la SOT"
              required
            />
          )}
        </div>
      </div>

      {/* ── Sección 2: Productos ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Productos
          </h3>
          <Separator className="flex-1" />
          {!productoDialogOpen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2 shrink-0"
              onClick={handleOpenProductoDialog}
            >
              <PackagePlus className="size-3 mr-1" />
              Agregar
            </Button>
          )}
        </div>

        <DespachoProductoDialog
          open={productoDialogOpen}
          editingIndex={editingProductoIndex}
          productSubForm={productSubForm}
          watchedSeries={watchedSeries as DespachoSerieFormValues[]}
          onClose={handleCloseProductoDialog}
          onSubmit={handleAddOrUpdateProducto}
          onAppendSerie={appendSerie}
          onRemoveSerie={removeSerie}
          onUpdateSerie={updateSerie}
        />

        {watchedProductos.length > 0 && (
          <DataTable
            columns={productoColumns}
            data={watchedProductos}
            variant="outline"
            isVisibleColumnFilter={false}
          />
        )}
      </div>

      {/* ── Sección 3: Series ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Series
          </h3>
          <Separator className="flex-1" />
        </div>

        {isCorporativo && debouncedSot && (
          <DespachoSotSeriesPanel
            almacenId={almacen_id}
            sot={debouncedSot}
            existingSeries={existingSeriesSet}
            onAdd={(item) => {
              setMasivoSeries((prev) => [...prev, item]);
              setMasivoError("");
              setCombinedError("");
            }}
          />
        )}

        <DespachoMasivoSeriesInput
          items={masivoSeries}
          onAdd={(item) => {
            setMasivoSeries((prev) => [...prev, item]);
            setMasivoError("");
            setCombinedError("");
          }}
          onRemove={(id) =>
            setMasivoSeries((prev) => prev.filter((s) => s.id !== id))
          }
        />
        {masivoError && (
          <p className="text-xs text-destructive">{masivoError}</p>
        )}
      </div>

      {/* ── Error combinado + Submit ───────────────────────────────────────── */}
      {combinedError && (
        <p className="text-xs text-destructive">{combinedError}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Crear despacho"}
        </Button>
      </div>
    </form>
  );
}
