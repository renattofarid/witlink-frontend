import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/DataTable";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { PackagePlus } from "lucide-react";
import {
  guiaCreateSchema,
  productoSchema,
  serieSchema,
  type GuiaCreateFormValues,
  type ProductoFormValues,
} from "../lib/guia.schema";
import type { GuiaResource } from "../lib/guia.interface";
import { useGuiaMutation, useGuiaDeleteProducto } from "../lib/guia.form.hook";
import { getGuiaProductoColumns } from "./GuiaProductoColumns";
import type { SeriesDetailData } from "./GuiaProductoColumns";
import { GuiaDatosSection } from "./GuiaDatosSection";
import { GuiaProductoDialog } from "./GuiaProductoDialog";
import { GuiaSeriesDetailModal } from "./GuiaSeriesDetailModal";
import { format } from "date-fns";

// Evitar que TS se queje de imports no usados directamente
void productoSchema;
void serieSchema;

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
  const [editingProductoIndex, setEditingProductoIndex] = useState<
    number | null
  >(null);
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);
  const [productoDialogTab, setProductoDialogTab] = useState<
    "catalogo" | "manual"
  >("catalogo");
  const [seriesDetail, setSeriesDetail] = useState<SeriesDetailData | null>(
    null,
  );

  // ── Main form ──────────────────────────────────────────────────────────────
  const form = useForm<GuiaCreateFormValues>({
    resolver: zodResolver(guiaCreateSchema) as any,
    defaultValues: {
      numero: "",
      fecha: format(new Date(), "yyyy-MM-dd"),
      productos: [],
    },
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
        fecha: guia.fecha?.split("T")[0] ?? format(new Date(), "yyyy-MM-dd"),
        productos: (guia.productos ?? []).map((p) => ({
          productos_guia_id: p.id,
          producto_id: String(p.producto.id),
          categoria_id: String(p.producto.categoria_id),
          sap: p.producto.sap ?? null,
          nombre: p.producto.nombre ?? null,
          tipo: (p.producto.tipo as "MATERIAL" | "EQUIPO") ?? null,
          origen: (p.producto.origen as "CLARO" | "WITLINK") ?? null,
          necesita_serie: p.producto.necesita_serie ?? null,
          necesita_mac: p.producto.necesita_mac ?? null,
          necesita_emta_mac: p.producto.necesita_emta_mac ?? null,
          necesita_ua: p.producto.necesita_ua ?? null,
          cantidad: Number(p.cantidad),
          observaciones: p.observaciones ?? null,
          series:
            p.series?.map((s) => ({
              serie_id: s.serie?.id ?? null,
              serie: s.serie?.serie ?? null,
              mac: s.serie?.mac ?? null,
              emta_mac: s.serie?.emta_mac ?? null,
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

  // ── Handlers: producto dialog ──────────────────────────────────────────────
  const handleAddOrUpdateProducto = productSubForm.control.handleSubmit((values) => {
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

  // ── Mutation + delete ──────────────────────────────────────────────────────
  const mutation = useGuiaMutation(mode, guia, onSuccess);
  const {
    pendingDeleteInfo,
    setPendingDeleteInfo,
    handleConfirmDeleteProducto,
    deleteConfirmInfo,
    setDeleteConfirmInfo,
    handleDeleteProducto,
    handleForceDeleteProducto,
  } = useGuiaDeleteProducto(removeProducto);

  // ── Columns ────────────────────────────────────────────────────────────────
  const watchedProductos = form.watch("productos");

  const productoColumns = getGuiaProductoColumns({
    editingIndex: editingProductoIndex,
    onEdit: handleEditProducto,
    onDelete: (index) =>
      handleDeleteProducto(
        index,
        form.getValues(`productos.${index}`).productos_guia_id,
      ),
    onViewSeries: setSeriesDetail,
    onCloseEditDialog: handleCloseProductoDialog,
  });

  return (
    <form
      onSubmit={form.control.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-4"
    >
      {/* ── Sección 1: Datos de la guía ────────────────────────────────────── */}
      <GuiaDatosSection control={form.control} />

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

      {/* ── Confirmación eliminar producto ──────────────────────────────────── */}
      <ConfirmationDialog
        open={!!pendingDeleteInfo}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteInfo(null);
        }}
        title="¿Eliminar producto?"
        description="¿Estás seguro de que deseas eliminar este producto de la guía? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={handleConfirmDeleteProducto}
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
