import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/DataTable";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { PackagePlus } from "lucide-react";
import {
  guiaCreateSchema,
  guiaEditSchema,
  productoSchema,
  serieSchema,
  type GuiaCreateFormValues,
  type ProductoFormValues,
  type SerieFormValues,
} from "../lib/guia.schema";
import type { GuiaResource } from "../lib/guia.interface";
import { validateSerie } from "../lib/guia.actions";
import {
  useGuiaMutation,
  useGuiaDeleteProducto,
  useSeriesConcurrentes,
  useGuiaAddProductoInEdit,
} from "../lib/guia.form.hook";
import { getGuiaProductoColumns } from "./GuiaProductoColumns";
import type { SeriesDetailData } from "./GuiaProductoColumns";
import { GuiaDatosSection } from "./GuiaDatosSection";
import { GuiaProductoDialog } from "./GuiaProductoDialog";
import { GuiaSeriesDetailModal } from "./GuiaSeriesDetailModal";
import { GuiaProductoRow } from "./GuiaProductoRow";
import { GuiaQuickAddSeriePanel } from "./GuiaQuickAddSeriePanel";
import { useGuiaDraftStore } from "../lib/guia-draft.store";
import { format } from "date-fns";

// Evitar que TS se queje de imports no usados directamente
void productoSchema;
void serieSchema;

// Una fila de serie solo cuenta si tiene TODOS los campos que el equipo requiere
function isSerieComplete(
  serie: SerieFormValues,
  flags: Pick<
    ProductoFormValues,
    "necesita_serie" | "necesita_mac" | "necesita_emta_mac" | "necesita_ua"
  >,
): boolean {
  if (flags.necesita_serie && !serie.serie?.trim()) return false;
  if (flags.necesita_mac && !serie.mac?.trim()) return false;
  if (flags.necesita_emta_mac && !serie.emta_mac?.trim()) return false;
  if (flags.necesita_ua && !serie.ua?.trim()) return false;
  return true;
}

function guiaToFormValues(guia: GuiaResource): GuiaCreateFormValues {
  return {
    numero: guia.numero,
    fecha: guia.fecha?.split("T")[0] ?? format(new Date(), "yyyy-MM-dd"),
    archivo: null,
    productos: (guia.productos ?? []).map((p) => ({
      productos_guia_id: p.id,
      producto_id: String(p.producto.id),
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
  };
}

const EMPTY_PRODUCTO: ProductoFormValues = {
  producto_id: null,
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
  const [seriesDetail, setSeriesDetail] = useState<SeriesDetailData | null>(
    null,
  );

  const { almacenDraft, setAlmacenDraft } = useGuiaDraftStore();
  const submittedRef = useRef(false);

  // Wrap onSuccess to mark submission before navigating away
  const wrappedOnSuccess = () => {
    submittedRef.current = true;
    onSuccess?.();
  };

  // ── Main form ──────────────────────────────────────────────────────────────
  const form = useForm<GuiaCreateFormValues>({
    resolver: zodResolver(mode === "create" ? guiaCreateSchema : guiaEditSchema) as any,
    defaultValues: {
      numero: "",
      fecha: format(new Date(), "yyyy-MM-dd"),
      archivo: null,
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
      form.reset(guiaToFormValues(guia));
    }
  }, [guia, mode, form]);

  // Restore draft on mount (create mode only)
  useEffect(() => {
    if (mode === "create" && almacenDraft) {
      form.reset({ ...almacenDraft, archivo: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft on unmount (create mode only, skip if submitted successfully)
  useEffect(() => {
    if (mode !== "create") return;
    return () => {
      if (!submittedRef.current) {
        const { numero, fecha, productos } = form.getValues();
        setAlmacenDraft({ numero, fecha, productos });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleGenerarSeries = useCallback(
    (newSeries: SerieFormValues[]) => {
      const existing = productSubForm.getValues("series") ?? [];
      productSubForm.reset({ ...productSubForm.getValues(), series: [...existing, ...newSeries] });
    },
    [productSubForm],
  );

  // Valida en tiempo real que un valor de serie/MAC/etc. no exista en otros
  // productos ya agregados al formulario (solo aplica en modo creación).
  const checkCrossProductDuplicate = useCallback(
    (
      rowIndex: number,
      field: "serie" | "mac" | "emta_mac" | "ua",
      value: string | null | undefined,
    ) => {
      if (mode !== "create") return;
      if (!value?.trim()) return;
      const allProducts = form.getValues("productos");
      const otherProducts =
        editingProductoIndex !== null
          ? allProducts.filter((_, i) => i !== editingProductoIndex)
          : allProducts;
      const exists = otherProducts.some((p) =>
        (p.series ?? []).some(
          (s) => s[field] && s[field]!.toUpperCase() === value.toUpperCase(),
        ),
      );
      if (exists) {
        productSubForm.setError(`series.${rowIndex}.${field}` as any, {
          type: "manual",
          message: "Ya existe en otro producto",
        });
      }
    },
    [mode, form, editingProductoIndex, productSubForm],
  );

  // Estado de validación por campo: "idle"|"loading"|"valid"|"invalid"
  const [fieldValidationStatus, setFieldValidationStatus] = useState<
    Record<string, "idle" | "loading" | "valid" | "invalid">
  >({});

  // Valida un campo de serie contra la API en tiempo real.
  // Aplica en create mode y en edit mode cuando se agrega un producto nuevo.
  const validateSerieField = useCallback(
    async (
      rowIndex: number,
      field: "serie" | "mac" | "emta_mac" | "ua",
      value: string | null | undefined,
    ) => {
      // Saltar si estamos editando un producto existente en modo edición
      if (mode === "edit" && editingProductoIndex !== null) return;
      if (!value?.trim()) return;
      const key = `${rowIndex}.${field}`;
      setFieldValidationStatus((prev) => ({ ...prev, [key]: "loading" }));
      try {
        await validateSerie(value.trim());
        // 200 → serie ya existe en el sistema → no disponible
        setFieldValidationStatus((prev) => ({ ...prev, [key]: "invalid" }));
        productSubForm.setError(`series.${rowIndex}.${field}` as any, {
          type: "manual",
          message: "Ya existe o no está disponible",
        });
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 404) {
          // 404 → serie no existe → disponible, sin error
          setFieldValidationStatus((prev) => ({ ...prev, [key]: "valid" }));
          productSubForm.clearErrors(`series.${rowIndex}.${field}` as any);
        } else {
          setFieldValidationStatus((prev) => ({ ...prev, [key]: "idle" }));
        }
      }
    },
    [mode, editingProductoIndex, productSubForm],
  );

  // ── Concurrent series (edit mode only) ────────────────────────────────────
  const seriesConcurrentes = useSeriesConcurrentes(
    mode === "edit" ? guia?.id : undefined,
  );
  const { addProducto: addProductoInEdit, updateProducto: updateProductoInEdit, isSaving: isProductoSaving } =
    useGuiaAddProductoInEdit(mode === "edit" ? guia?.id : undefined);

  // ── Handlers: producto dialog ──────────────────────────────────────────────
  const handleAddOrUpdateProducto = productSubForm.control.handleSubmit(
    async (rawValues) => {
      let values = rawValues;

      // Descarta filas de serie incompletas (p.ej. la fila vacía que se
      // inserta automáticamente al avanzar con Enter) antes de guardar
      const needsSeriesRows =
        values.tipo === "EQUIPO" &&
        (!!values.necesita_serie ||
          !!values.necesita_mac ||
          !!values.necesita_emta_mac ||
          !!values.necesita_ua);

      if (needsSeriesRows) {
        const completeSeries = (values.series ?? []).filter((s) =>
          isSerieComplete(s, values),
        );
        if (completeSeries.length === 0) {
          productSubForm.setError("series", {
            type: "manual",
            message:
              "Complete todos los campos requeridos de al menos una serie.",
          });
          return;
        }
        values = { ...values, series: completeSeries, cantidad: completeSeries.length };
      }

      if (mode === "edit" && guia) {
        if (editingProductoIndex === null) {
          // NEW product in edit mode: save to server, reset form from fresh data
          const freshGuia = await addProductoInEdit(values);
          if (freshGuia === null) return;

          form.reset(guiaToFormValues(freshGuia));
          await seriesConcurrentes.refreshFromServer();
        } else {
          // EDIT existing product: save changes immediately
          const existingId = form.getValues(
            `productos.${editingProductoIndex}`,
          ).productos_guia_id;
          if (existingId) {
            try {
              await updateProductoInEdit(existingId, values);
            } catch {
              return;
            }
          }
          updateProductoField(editingProductoIndex, values);
          setEditingProductoIndex(null);
        }
      } else {
        // CREATE mode: validate series against other products already in the form
        const allProducts = form.getValues("productos");
        const otherProducts =
          editingProductoIndex !== null
            ? allProducts.filter((_, i) => i !== editingProductoIndex)
            : allProducts;

        const existing = {
          serie: new Set<string>(),
          mac: new Set<string>(),
          emta_mac: new Set<string>(),
          ua: new Set<string>(),
        };
        for (const p of otherProducts) {
          for (const s of p.series ?? []) {
            if (s.serie) existing.serie.add(s.serie.toUpperCase());
            if (s.mac) existing.mac.add(s.mac.toUpperCase());
            if (s.emta_mac) existing.emta_mac.add(s.emta_mac.toUpperCase());
            if (s.ua) existing.ua.add(s.ua.toUpperCase());
          }
        }

        let hasCrossConflict = false;
        (values.series ?? []).forEach((s, i) => {
          const fields = [
            { key: "serie", val: s.serie },
            { key: "mac", val: s.mac },
            { key: "emta_mac", val: s.emta_mac },
            { key: "ua", val: s.ua },
          ] as const;
          for (const { key, val } of fields) {
            if (val && existing[key].has(val.toUpperCase())) {
              productSubForm.setError(`series.${i}.${key}` as any, {
                type: "manual",
                message: "Ya existe en otro producto",
              });
              hasCrossConflict = true;
            }
          }
        });
        if (hasCrossConflict) return;

        if (editingProductoIndex === null) {
          appendProducto(values);
        } else {
          updateProductoField(editingProductoIndex, values);
          setEditingProductoIndex(null);
        }
      }
      productSubForm.reset(EMPTY_PRODUCTO);
      setProductoDialogOpen(false);
    },
  );

  const handleOpenProductoDialog = () => {
    productSubForm.reset(EMPTY_PRODUCTO);
    setEditingProductoIndex(null);
    setProductoDialogOpen(true);
    setFieldValidationStatus({});
  };

  const handleEditProducto = (index: number) => {
    const producto = form.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
    setProductoDialogOpen(true);
    setFieldValidationStatus({});
  };

  const handleCloseProductoDialog = () => {
    setProductoDialogOpen(false);
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
    setFieldValidationStatus({});
  };

  // ── Mutation + delete ──────────────────────────────────────────────────────
  const mutation = useGuiaMutation(mode, guia, wrappedOnSuccess);
  const {
    pendingDeleteInfo,
    setPendingDeleteInfo,
    handleConfirmDeleteProducto,
    deleteConfirmInfo,
    setDeleteConfirmInfo,
    handleDeleteProducto,
    handleForceDeleteProducto,
  } = useGuiaDeleteProducto(removeProducto);

  // ── Columns (create mode) ──────────────────────────────────────────────────
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
      <GuiaDatosSection
        control={form.control}
        mode={mode}
        existingFileName={guia?.ruta_pdf_guia ?? null}
      />

      {/* ── Sección 2: Productos ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Productos
            </h3>
            <Separator className="flex-1" />
          </div>
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
        </div>

        <GuiaProductoDialog
          open={productoDialogOpen}
          editingIndex={editingProductoIndex}
          productSubForm={productSubForm}
          watchedSeries={watchedSeries}
          onClose={handleCloseProductoDialog}
          onSubmit={handleAddOrUpdateProducto}
          onAppendSerie={appendSerie}
          onRemoveSerie={removeSerie}
          onCheckDuplicate={checkCrossProductDuplicate}
          onValidateField={validateSerieField}
          fieldValidationStatus={fieldValidationStatus}
          onGenerarSeries={handleGenerarSeries}
        />

        {/* ── Product list: create mode uses DataTable, edit mode uses live list */}
        {watchedProductos.length > 0 && mode === "create" && (
          <DataTable
            columns={productoColumns}
            data={watchedProductos}
            variant="outline"
            isVisibleColumnFilter={false}
          />
        )}

        {watchedProductos.length > 0 && mode === "edit" && (
          <div className="space-y-2">
            {watchedProductos.map((producto, index) => {
              const pgId = producto.productos_guia_id;
              const isEquipoWithPanel =
                producto.tipo === "EQUIPO" &&
                !!pgId &&
                (producto.necesita_serie ||
                  producto.necesita_mac ||
                  producto.necesita_emta_mac ||
                  producto.necesita_ua);

              const seriesForProducto = pgId
                ? Object.values(seriesConcurrentes.seriesLocales).filter(
                    (s) => s.productoGuiaId === pgId,
                  )
                : [];

              const confirmedCount = seriesForProducto.filter(
                (s) => s.status === "confirmed",
              ).length;

              return (
                <div
                  key={pgId ?? `new-${index}`}
                  className="border rounded-lg overflow-hidden"
                >
                  <GuiaProductoRow
                    producto={producto}
                    index={index}
                    editingIndex={editingProductoIndex}
                    confirmedSeriesCount={
                      isEquipoWithPanel ? confirmedCount : undefined
                    }
                    isSaving={isProductoSaving && !pgId}
                    onEdit={handleEditProducto}
                    onDelete={(i) =>
                      handleDeleteProducto(i, producto.productos_guia_id)
                    }
                    onViewSeries={setSeriesDetail}
                    onCloseEditDialog={handleCloseProductoDialog}
                  />

                  {isEquipoWithPanel && (
                    <GuiaQuickAddSeriePanel
                      productoGuiaId={pgId!}
                      productoNombre={producto.nombre}
                      cantidad={producto.cantidad}
                      necesitaSerie={!!producto.necesita_serie}
                      necesitaMac={!!producto.necesita_mac}
                      necesitaEmtaMac={!!producto.necesita_emta_mac}
                      necesitaUa={!!producto.necesita_ua}
                      seriesLocales={seriesForProducto}
                      onAgregar={(fields) =>
                        seriesConcurrentes.agregarSerie(pgId!, fields)
                      }
                      onEliminar={seriesConcurrentes.eliminarSerie}
                      onRetry={seriesConcurrentes.retryAgregar}
                      isPendingEliminar={seriesConcurrentes.isPendingEliminar}
                    />
                  )}
                </div>
              );
            })}
          </div>
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

      {/* ── Submit: solo en modo crear ──────────────────────────────────────── */}
      {mode === "create" && (
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Crear guía"}
          </Button>
        </div>
      )}
    </form>
  );
}
