import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
// import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { DataTable } from "@/components/DataTable";
import { successToast, errorToast } from "@/lib/core.function";
import {
  guiaCreateSchema,
  productoSchema,
  serieSchema,
  type GuiaCreateFormValues,
  type ProductoFormValues,
  type SerieFormValues,
} from "../lib/guia.schema";
import {
  createGuia,
  updateGuia,
  deleteProductoGuia,
} from "../lib/guia.actions";
// import { useProveedoresQuery } from "../lib/guia.hook";
import { GuiaComplete } from "../lib/guia.constants";
import type {
  GuiaCreateBody,
  GuiaEditBody,
  GuiaResource,
} from "../lib/guia.interface";
import { Trash2, Pencil, PackagePlus, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { GuiaProductoDialog } from "./GuiaProductoDialog";
import { GuiaSeriesDetailModal } from "./GuiaSeriesDetailModal";
// Evitar que TS se queje de imports no usados directamente
void productoSchema;
void serieSchema;

// const EMPTY_SERIE: SerieFormValues = {
//   serie_id: null,
//   serie: "",
//   mac: "",
//   emta_mac: "",
//   ua: "",
//   observaciones: null,
// };

const EMPTY_PRODUCTO: ProductoFormValues = {
  producto_id: null,
  categoria_id: null,
  sap: null,
  nombre: null,
  tipo: null,
  origen: null,
  necesita_serie: null,
  necesita_mac: null,
  necesita_emta_mac: null,
  necesita_ua: null,
  cantidad: 1,
  observaciones: null,
  series: [],
};

interface GuiaFormProps {
  mode: "create" | "edit";
  guia?: GuiaResource;
  onSuccess?: () => void;
}

export default function GuiaForm({ mode, guia, onSuccess }: GuiaFormProps) {
  const queryClient = useQueryClient();
  const [editingProductoIndex, setEditingProductoIndex] = useState<
    number | null
  >(null);
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);
  const [productoDialogTab, setProductoDialogTab] = useState<
    "catalogo" | "manual"
  >("catalogo");
  const [archivo] = useState<File | null>(null);
  const [deleteConfirmInfo, setDeleteConfirmInfo] = useState<{
    index: number;
    id: number;
    series: Array<{ serie?: string; mac?: string; ua?: string }>;
  } | null>(null);
  const [seriesDetail, setSeriesDetail] = useState<{
    series: SerieFormValues[];
    nombre: string | null;
    necesitaSerie: boolean | null;
    necesitaMac: boolean | null;
    necesitaEmtaMac: boolean | null;
    necesitaUa: boolean | null;
  } | null>(null);

  // ── Main form ──────────────────────────────────────────────────────────────
  const form = useForm<GuiaCreateFormValues>({
    resolver: zodResolver(guiaCreateSchema) as any,
    defaultValues: { numero: "", fecha: "", productos: [] },
    mode: "onChange",
  });

  const {
    append: appendProducto,
    remove: removeProducto,
    update: updateProductoField,
  } = useFieldArray({ control: form.control, name: "productos" });

  useEffect(() => {
    if (mode === "edit" && guia) {
      form.reset({
        numero: guia.numero,
        fecha: guia.fecha?.split("T")[0] ?? "",
        // proveedor_id: String(guia.proveedor.id),
        productos: (guia.productos ?? []).map((p) => ({
          productos_guia_id: p.id,
          producto_id: String(p.producto.id),
          categoria_id: String(p.producto.categoria_id),
          sap: p.producto.sap ?? null,
          nombre: p.producto.nombre ?? null,
          tipo: (p.producto.tipo as "material" | "equipo") ?? null,
          origen: null,
          necesita_serie: null,
          necesita_mac: null,
          necesita_emta_mac: null,
          necesita_ua: null,
          cantidad: Number(p.cantidad),
          observaciones: p.observaciones ?? null,
          series:
            p.series?.map((s) => ({
              serie_id: s.serie?.id ?? null,
              serie: s.serie?.serie ?? null,
              mac: s.serie?.mac ?? null,
              emta_mac: null,
              ua: s.serie?.ua ?? null,
              observaciones: s.observaciones ?? null,
            })) ?? [],
        })),
      });
    }
  }, [guia, mode, form]);

  // ── Product sub-form ───────────────────────────────────────────────────────
  const productSubForm = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema) as any,
    defaultValues: EMPTY_PRODUCTO,
    mode: "onChange",
  });

  const { append: appendSerie, remove: removeSerie } = useFieldArray({
    control: productSubForm.control,
    name: "series",
  });

  const watchedSeries = productSubForm.watch("series") ?? [];

  // ── Handlers: producto ─────────────────────────────────────────────────────
  const handleAddOrUpdateProducto = productSubForm.handleSubmit((values) => {
    if (editingProductoIndex === null) {
      appendProducto(values);
    } else {
      updateProductoField(editingProductoIndex, values);
      setEditingProductoIndex(null);
    }
    productSubForm.reset(EMPTY_PRODUCTO);
    setProductoDialogOpen(false);
  });

  const handleOpenProductoDialog = () => {
    productSubForm.reset(EMPTY_PRODUCTO);
    setEditingProductoIndex(null);
    setProductoDialogTab("catalogo");
    setProductoDialogOpen(true);
  };

  const handleEditProducto = (index: number) => {
    const producto = form.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
    setProductoDialogTab(producto.producto_id ? "catalogo" : "manual");
    setProductoDialogOpen(true);
  };

  const handleCloseProductoDialog = () => {
    setProductoDialogOpen(false);
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
  };

  // ── Mutation ───────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (values: GuiaCreateFormValues) => {
      if (mode === "edit" && guia) {
        const añadir = values.productos
          .filter((p) => !p.productos_guia_id)
          .map((p) => {
            const isEquipo = p.tipo === "equipo";
            const series =
              p.series?.map((s) => ({
                serie_id: s.serie_id ? Number(s.serie_id) : undefined,
                serie: s.serie ?? null,
                mac: s.mac ?? null,
                emta_mac: s.emta_mac ?? null,
                ua: s.ua ?? null,
                observaciones: s.observaciones ?? null,
              })) ?? null;
            if (p.producto_id) {
              return {
                producto_id: Number(p.producto_id),
                cantidad: p.cantidad,
                observaciones: p.observaciones ?? null,
                series,
              };
            }
            return {
              categoria_id: p.categoria_id ? Number(p.categoria_id) : null,
              sap: p.sap ?? null,
              nombre: p.nombre ?? null,
              tipo: p.tipo ?? null,
              origen: p.origen ?? null,
              necesita_serie: isEquipo ? (p.necesita_serie ?? null) : null,
              necesita_mac: isEquipo ? (p.necesita_mac ?? null) : null,
              necesita_emta_mac: isEquipo
                ? (p.necesita_emta_mac ?? null)
                : null,
              necesita_ua: isEquipo ? (p.necesita_ua ?? null) : null,
              cantidad: p.cantidad,
              observaciones: p.observaciones ?? null,
              series,
            };
          });

        const actualizar = values.productos
          .filter((p) => !!p.productos_guia_id)
          .map((p) => ({
            id: p.productos_guia_id!,
            cantidad: p.cantidad,
            observaciones: p.observaciones ?? null,
            series: {
              actualizar:
                p.series
                  ?.filter((s) => !!s.serie_id)
                  .map((s) => ({
                    serie_id: Number(s.serie_id),
                    observaciones: s.observaciones ?? null,
                  })) ?? null,
              añadir:
                p.series
                  ?.filter((s) => !s.serie_id)
                  .map((s) => ({
                    serie_id: null,
                    serie: s.serie ?? null,
                    mac: s.mac ?? null,
                    emta_mac: s.emta_mac ?? null,
                    ua: s.ua ?? null,
                    observaciones: s.observaciones ?? null,
                  })) ?? null,
            },
          }));

        const body: GuiaEditBody = {
          numero: values.numero,
          fecha: values.fecha,
          // proveedor_id: Number(values.proveedor_id),
          archivo: archivo ?? null,
          productos: {
            añadir: añadir.length ? añadir : null,
            actualizar: actualizar.length ? actualizar : null,
          },
        };
        return updateGuia(guia.id, body);
      }

      const body: GuiaCreateBody = {
        numero: values.numero,
        fecha: values.fecha,
        // proveedor_id: Number(values.proveedor_id),
        archivo: archivo ?? undefined,
        productos: values.productos.map((p) => {
          const isEquipo = p.tipo === "equipo";
          const series =
            p.series?.map((s) => ({
              serie_id: s.serie_id ? Number(s.serie_id) : undefined,
              serie: s.serie ?? null,
              mac: s.mac ?? null,
              emta_mac: s.emta_mac ?? null,
              ua: s.ua ?? null,
              observaciones: s.observaciones ?? null,
            })) ?? null;
          if (p.producto_id) {
            return {
              producto_id: Number(p.producto_id),
              cantidad: p.cantidad,
              observaciones: p.observaciones ?? null,
              series,
            };
          }
          return {
            categoria_id: p.categoria_id ? Number(p.categoria_id) : null,
            sap: p.sap ?? null,
            nombre: p.nombre ?? null,
            tipo: p.tipo ?? null,
            origen: p.origen ?? null,
            necesita_serie: isEquipo ? (p.necesita_serie ?? null) : null,
            necesita_mac: isEquipo ? (p.necesita_mac ?? null) : null,
            necesita_emta_mac: isEquipo ? (p.necesita_emta_mac ?? null) : null,
            necesita_ua: isEquipo ? (p.necesita_ua ?? null) : null,
            cantidad: p.cantidad,
            observaciones: p.observaciones ?? null,
            series,
          };
        }),
      };
      return createGuia(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast(
        mode === "edit"
          ? "Guía actualizada correctamente."
          : "Guía creada correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al guardar la guía.");
    },
  });

  // ── Delete producto ────────────────────────────────────────────────────────
  const handleDeleteProducto = async (index: number) => {
    const producto = form.getValues(`productos.${index}`);
    if (!producto.productos_guia_id) {
      removeProducto(index);
      return;
    }
    try {
      await deleteProductoGuia(producto.productos_guia_id);
      removeProducto(index);
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const series: Array<{ serie?: string; mac?: string; ua?: string }> =
        responseData?.series ?? responseData?.data?.series ?? [];
      if (series.length > 0) {
        setDeleteConfirmInfo({ index, id: producto.productos_guia_id, series });
      } else {
        errorToast(responseData?.message ?? "Error al eliminar el producto.");
      }
    }
  };

  const handleForceDeleteProducto = async () => {
    if (!deleteConfirmInfo) return;
    try {
      await deleteProductoGuia(deleteConfirmInfo.id, true);
      removeProducto(deleteConfirmInfo.index);
      setDeleteConfirmInfo(null);
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar el producto.",
      );
    }
  };

  // ── Columns: tabla resumen de productos ────────────────────────────────────
  const watchedProductos = form.watch("productos");

  const productoColumns: ColumnDef<ProductoFormValues>[] = [
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
        <span className="font-medium">
          {row.original.nombre || row.original.sap || "Sin nombre"}
        </span>
      ),
    },
    {
      id: "sap",
      header: "SAP",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.sap || "Sin codigo SAP"}
        </span>
      ),
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: ({ row }) =>
        row.original.tipo ? (
          <Badge variant="secondary"  className="text-xs capitalize">
            {row.original.tipo}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
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
        const series = row.original.series ?? [];
        if (!series.length)
          return <span className="text-muted-foreground text-xs">Sin series</span>;
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {series.length} serie{series.length !== 1 ? "s" : ""}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              title="Ver detalle de series"
              onClick={() =>
                setSeriesDetail({
                  series: series as SerieFormValues[],
                  nombre: row.original.nombre ?? row.original.sap ?? null,
                  necesitaSerie: row.original.necesita_serie ?? null,
                  necesitaMac: row.original.necesita_mac ?? null,
                  necesitaEmtaMac: row.original.necesita_emta_mac ?? null,
                  necesitaUa: row.original.necesita_ua ?? null,
                })
              }
            >
              <List className="size-3" />
            </Button>
          </div>
        );
      },
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => handleEditProducto(row.index)}
          >
            <Pencil className="size-2" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => {
              if (editingProductoIndex === row.index)
                handleCloseProductoDialog();
              handleDeleteProducto(row.index);
            }}
          >
            <Trash2 className="size-2" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-4"
    >
      {/* ── Sección 1: Datos de la guía ────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Datos de la guía
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormInput
            name="numero"
            label="Número de guía"
            control={form.control}
            placeholder="Ej. GR-001"
            required
            uppercase
          />
          <DatePickerFormField
            name="fecha"
            label="Fecha"
            control={form.control}
          />
          <FormInput
            label="Archivo adjunto (opcional)"
            name="file"
            type="file"
            control={form.control}
            accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
          />
        </div>
      </div>

      {/* ── Sección 2: Productos ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Productos
            </h3>
            <Separator className="flex-1" />
          </div>
          {!productoDialogOpen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-2 h-6 text-xs px-2"
              onClick={handleOpenProductoDialog}
            >
              <PackagePlus className="size-3 mr-1" />
              Agregar
            </Button>
          )}
        </div>

        {/* Formulario inline: agregar / editar producto */}
        <GuiaProductoDialog
          open={productoDialogOpen}
          editingIndex={editingProductoIndex}
          tab={productoDialogTab}
          productSubForm={productSubForm}
          watchedSeries={watchedSeries}
          onClose={handleCloseProductoDialog}
          onSubmit={handleAddOrUpdateProducto}
          onTabChange={setProductoDialogTab}
          onAppendSerie={appendSerie}
          onRemoveSerie={removeSerie}
        />

        {/* Tabla de productos agregados */}
        {watchedProductos.length > 0 && (
          <DataTable
            columns={productoColumns}
            data={watchedProductos}
            variant="outline"
            isVisibleColumnFilter={false}
          />
        )}

        {form.formState.errors.productos &&
          !Array.isArray(form.formState.errors.productos) && (
            <p className="text-xs text-destructive">
              {form.formState.errors.productos.message}
            </p>
          )}
      </div>

      {/* ── Modal: detalle de series ────────────────────────────────────────── */}
      <GuiaSeriesDetailModal
        open={!!seriesDetail}
        onClose={() => setSeriesDetail(null)}
        series={seriesDetail?.series ?? []}
        productoNombre={seriesDetail?.nombre}
        necesitaSerie={seriesDetail?.necesitaSerie}
        necesitaMac={seriesDetail?.necesitaMac}
        necesitaEmtaMac={seriesDetail?.necesitaEmtaMac}
        necesitaUa={seriesDetail?.necesitaUa}
      />

      {/* ── Confirmación forzar eliminación de producto ─────────────────────── */}
      <ConfirmationDialog
        open={!!deleteConfirmInfo}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmInfo(null);
        }}
        title="¿Eliminar producto con series asociadas?"
        description="Este producto tiene las siguientes series asociadas que también serán eliminadas:"
        confirmText="Forzar eliminación"
        onConfirm={handleForceDeleteProducto}
      >
        <ul className="text-sm space-y-1 max-h-48 overflow-y-auto border rounded p-2">
          {deleteConfirmInfo?.series.map((s, i) => (
            <li key={i} className="font-mono text-xs">
              {[s.serie, s.mac, s.ua].filter(Boolean).join(" · ")}
            </li>
          ))}
        </ul>
      </ConfirmationDialog>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <pre className="text-xs text-muted-foreground">
        {JSON.stringify(form.formState.errors, null, 2)}
      </pre>
      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Guardando..."
            : mode === "edit"
              ? "Actualizar guía"
              : "Crear guía"}
        </Button>
      </div>
    </form>
  );
}
