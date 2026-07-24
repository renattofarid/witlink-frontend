import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/DataTable";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Badge } from "@/components/ui/badge";
import { PackagePlus, Trash2, Pencil, ListPlus, User } from "lucide-react";
import { successToast, errorToast } from "@/lib/core.function";
import { format } from "date-fns";

import {
  productoSchema,
  type ProductoFormValues,
  type SerieFormValues,
} from "../lib/guia.schema";
import { verificarDisponibilidadIngresoRetirado } from "../lib/guia.actions";
import { GuiaProductoDialog } from "./GuiaProductoDialog";

import {
  EquiposRetiradosComplete,
  TIPO_EQUIPO_RETIRADO_OPTIONS,
} from "@/pages/equipos-retirados/lib/equipos-retirados.constants";
import { useLiquidacionesForSelectQuery, useSotSearchQuery } from "@/pages/liquidaciones/lib/liquidaciones.hook";
import type { LiquidacionResource } from "@/pages/liquidaciones/lib/liquidaciones.interface";
import type { Option } from "@/lib/core.interface";
import { useGuiaDraftStore } from "../lib/guia-draft.store";

const mapLiquidacionOption = (item: LiquidacionResource): Option => ({
  value: item.sot,
  label: item.sot,
  description: item.nombre,
});
import {
  createEquipoRetirado,
  updateEquipoRetirado,
  addProductosEquipoRetirado,
  deleteProductoEquipoRetirado,
  addSeriesEquipoRetirado,
  deleteSerieEquipoRetirado,
} from "@/pages/equipos-retirados/lib/equipos-retirados.actions";
import type {
  EquipoRetiradoResource,
  EquipoRetiradoProductoResource,
} from "@/pages/equipos-retirados/lib/equipos-retirados.interface";

// ── Schemas ───────────────────────────────────────────────────────────────────

const headerCreateSchema = z.object({
  sot: z.string().min(1, "Requerido"),
  tipo: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
  productos: z.array(productoSchema).min(1, "Debe agregar al menos un producto"),
});

const headerEditSchema = z.object({
  sot: z.string().min(1, "Requerido"),
  tipo: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
});

type HeaderCreateFormValues = z.infer<typeof headerCreateSchema>;
type HeaderEditFormValues = z.infer<typeof headerEditSchema>;

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_PRODUCTO: ProductoFormValues = {
  producto_id: "",
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

// ── Helper: valida que una fila de serie tenga todos los campos requeridos ────

function needsSeriesRows(values: ProductoFormValues): boolean {
  return (
    values.tipo === "EQUIPO" &&
    (!!values.necesita_serie ||
      !!values.necesita_mac ||
      !!values.necesita_emta_mac ||
      !!values.necesita_ua)
  );
}

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

// ── Helper: map ProductoFormValues → equipo retirado body ─────────────────────

function mapProducto(p: ProductoFormValues) {
  const isEquipo = p.tipo === "EQUIPO";
  const series = (p.series ?? []).map((s) => ({
    serie: s.serie ?? null,
    mac: s.mac ?? null,
    emta_mac: s.emta_mac ?? null,
    ua: s.ua ?? null,
    observaciones: s.observaciones ?? null,
  }));

  return {
    producto_id: Number(p.producto_id),
    origen: p.origen ?? "",
    necesita_serie: isEquipo ? (p.necesita_serie ?? false) : false,
    necesita_mac: isEquipo ? (p.necesita_mac ?? false) : false,
    necesita_emta_mac: isEquipo ? (p.necesita_emta_mac ?? false) : false,
    necesita_ua: isEquipo ? (p.necesita_ua ?? false) : false,
    cantidad: p.cantidad,
    series,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  mode: "create" | "edit";
  equipo?: EquipoRetiradoResource;
  onSuccess?: () => void;
}

export default function GuiaEquipoRetiradoForm({ mode, equipo, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const { equipoRetiradoDraft, setEquipoRetiradoDraft, clearDrafts } = useGuiaDraftStore();
  const submittedRef = useRef(false);

  // Cliente display
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const { data: initialSotData } = useSotSearchQuery(
    mode === "edit" && equipo?.sot ? equipo.sot : null,
  );
  useEffect(() => {
    if (mode === "edit" && initialSotData?.liquidacion) {
      setSelectedCliente(initialSotData.liquidacion.nombre);
    }
  }, [initialSotData, mode]);

  // Product dialog state
  const [editingProductoIndex, setEditingProductoIndex] = useState<number | null>(null);
  const [productoDialogOpen, setProductoDialogOpen] = useState(false);

  // Edit mode: which product detail id is getting a new serie
  const [addSerieForDetailId, setAddSerieForDetailId] = useState<number | null>(null);

  // Guardas de reenvío (evita doble clic mientras se valida/envía al backend)
  const addProductoSubmitLockRef = useRef(false);
  const addSerieSubmitLockRef = useRef(false);
  const createSubmitLockRef = useRef(false);
  const editSubmitLockRef = useRef(false);
  const [isAddingSerie, setIsAddingSerie] = useState(false);

  // Delete producto confirmation (edit mode)
  const [deleteProductoConfirm, setDeleteProductoConfirm] = useState<{
    id: number;
    series: Array<{ serie?: string; mac?: string }>;
  } | null>(null);

  // ── Main form (create mode) ────────────────────────────────────────────────
  const createForm = useForm<HeaderCreateFormValues>({
    resolver: zodResolver(headerCreateSchema) as any,
    defaultValues: {
      sot: "",
      tipo: "",
      fecha: format(new Date(), "yyyy-MM-dd"),
      productos: [],
    },
    mode: "onChange",
  });

  const {
    append: appendProducto,
    remove: removeProducto,
    update: updateProductoField,
  } = useFieldArray({ control: createForm.control, name: "productos" });

  // Restore draft on mount (create mode only)
  useEffect(() => {
    if (mode === "create" && equipoRetiradoDraft) createForm.reset(equipoRetiradoDraft);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft on unmount (create mode only, skip if submitted successfully)
  useEffect(() => {
    if (mode !== "create") return;
    return () => {
      if (!submittedRef.current) setEquipoRetiradoDraft(createForm.getValues());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Edit header form ───────────────────────────────────────────────────────
  const editForm = useForm<HeaderEditFormValues>({
    resolver: zodResolver(headerEditSchema),
    defaultValues: { sot: "", tipo: "", fecha: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (mode === "edit" && equipo) {
      editForm.reset({
        sot: equipo.sot,
        tipo: equipo.tipo,
        fecha: equipo.fecha?.split("T")[0] ?? "",
      });
    }
  }, [equipo, mode, editForm]);

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

  // ── Serie inline form (edit mode only) ────────────────────────────────────
  const serieForm = useForm<{
    serie: string;
    mac: string;
    emta_mac: string;
    ua: string;
    observaciones: string;
  }>({
    defaultValues: { serie: "", mac: "", emta_mac: "", ua: "", observaciones: "" },
  });

  // ── Validación cruzada de series (tabla de series del producto) ───────────
  // Estado de validación por campo: "idle"|"loading"|"valid"|"invalid"
  const [fieldValidationStatus, setFieldValidationStatus] = useState<
    Record<string, "idle" | "loading" | "valid" | "invalid">
  >({});

  // Evita que la misma serie/mac/emta_mac/ua se repita en otro producto del
  // mismo documento (ya sea otro producto del formulario en creación, o un
  // producto ya guardado en el documento en edición).
  const checkCrossProductDuplicate = useCallback(
    (
      rowIndex: number,
      field: "serie" | "mac" | "emta_mac" | "ua",
      value: string | null | undefined,
    ) => {
      if (!value?.trim()) return;
      const upper = value.trim().toUpperCase();
      let exists = false;
      if (mode === "create") {
        const allProducts = createForm.getValues("productos");
        const otherProducts =
          editingProductoIndex !== null
            ? allProducts.filter((_, i) => i !== editingProductoIndex)
            : allProducts;
        exists = otherProducts.some((p) =>
          (p.series ?? []).some(
            (s) => s[field] && s[field]!.toUpperCase() === upper,
          ),
        );
      } else {
        const productos = equipo?.productos ?? [];
        exists = productos.some((p) =>
          (p.series ?? []).some((s) => {
            const fieldValue =
              field === "serie"
                ? s.serie.serie
                : field === "mac"
                  ? s.serie.mac
                  : field === "ua"
                    ? s.serie.ua
                    : s.serie.emta_mac;
            return !!fieldValue && fieldValue.toUpperCase() === upper;
          }),
        );
      }
      if (exists) {
        productSubForm.setError(`series.${rowIndex}.${field}` as any, {
          type: "manual",
          message: "Ya existe en otro producto",
        });
      }
    },
    [mode, createForm, editingProductoIndex, productSubForm, equipo],
  );

  // Valida contra la API que la serie/UA/EMTA MAC no estén ya registradas —
  // agregar una serie a un equipo retirado también es un ingreso, así que
  // aplica la misma regla de disponibilidad que en Guía normal. La MAC queda
  // excluida: puede repetirse porque pertenece a una serie previamente
  // despachada/instalada en el cliente (no se aplica unique para MAC).
  const validateSerieField = useCallback(
    async (
      rowIndex: number,
      field: "serie" | "mac" | "emta_mac" | "ua",
      value: string | null | undefined,
    ) => {
      if (field === "mac") return;
      if (!value?.trim()) return;
      const key = `${rowIndex}.${field}`;
      setFieldValidationStatus((prev) => ({ ...prev, [key]: "loading" }));
      try {
        await verificarDisponibilidadIngresoRetirado(value.trim(), field);
        // 200 → código libre → disponible para ingresar
        setFieldValidationStatus((prev) => ({ ...prev, [key]: "valid" }));
        productSubForm.clearErrors(`series.${rowIndex}.${field}` as any);
      } catch (error: any) {
        if (error?.response?.status === 409) {
          // 409 → ya registrado y no retirado → no disponible
          setFieldValidationStatus((prev) => ({ ...prev, [key]: "invalid" }));
          productSubForm.setError(`series.${rowIndex}.${field}` as any, {
            type: "manual",
            message:
              error?.response?.data?.message ?? "Ya existe o no está disponible",
          });
        } else {
          setFieldValidationStatus((prev) => ({ ...prev, [key]: "idle" }));
        }
      }
    },
    [productSubForm],
  );

  // Producto sobre el que se está agregando la serie inline (edit mode)
  const addSerieProducto = (equipo?.productos ?? []).find(
    (p) => p.id === addSerieForDetailId,
  );
  const addSerieRequiresMac = addSerieProducto?.producto.necesita_mac === 1;
  const addSerieRequiresEmtaMac =
    String(addSerieProducto?.producto.necesita_emta_mac) === "1";
  const addSerieRequiresUa = addSerieProducto?.producto.necesita_ua === 1;

  // ── Requeridos + duplicados + existencia (edit mode inline add) ───────────
  const handleSubmitSerie = serieForm.handleSubmit(async (values) => {
    // Evita doble envío: mientras se validan campos contra la API (async),
    // un segundo clic podría disparar otro submit antes de que el botón se
    // deshabilite por addSerieMutation.isPending.
    if (addSerieSubmitLockRef.current || addSerieMutation.isPending) return;
    addSerieSubmitLockRef.current = true;
    setIsAddingSerie(true);
    try {
      await submitSerieInternal(values);
    } finally {
      addSerieSubmitLockRef.current = false;
      setIsAddingSerie(false);
    }
  });

  const submitSerieInternal = async (values: {
    serie: string;
    mac: string;
    emta_mac: string;
    ua: string;
    observaciones: string;
  }) => {
    const serieUpper = values.serie ? values.serie.trim().toUpperCase() : "";
    const macUpper = values.mac ? values.mac.trim().toUpperCase() : "";
    const emtaMacUpper = values.emta_mac ? values.emta_mac.trim().toUpperCase() : "";
    const uaUpper = values.ua ? values.ua.trim().toUpperCase() : "";
    let hasError = false;

    // El producto exige estos campos: los 4 deben completarse para agregar o actualizar
    if (addSerieRequiresMac && !macUpper) {
      serieForm.setError("mac", { type: "manual", message: "Requerido" });
      hasError = true;
    }
    if (addSerieRequiresEmtaMac && !emtaMacUpper) {
      serieForm.setError("emta_mac", { type: "manual", message: "Requerido" });
      hasError = true;
    }
    if (addSerieRequiresUa && !uaUpper) {
      serieForm.setError("ua", { type: "manual", message: "Requerido" });
      hasError = true;
    }
    if (hasError) return;

    const productos = equipo?.productos ?? [];
    for (const p of productos) {
      for (const s of p.series ?? []) {
        if (serieUpper && s.serie.serie?.toUpperCase() === serieUpper) {
          serieForm.setError("serie", { type: "manual", message: "Serie duplicada" });
          hasError = true;
        }
        if (macUpper && s.serie.mac?.toUpperCase() === macUpper) {
          serieForm.setError("mac", { type: "manual", message: "MAC duplicada" });
          hasError = true;
        }
        if (emtaMacUpper && s.serie.emta_mac?.toUpperCase() === emtaMacUpper) {
          serieForm.setError("emta_mac", { type: "manual", message: "EMTA MAC duplicada" });
          hasError = true;
        }
        if (uaUpper && s.serie.ua?.toUpperCase() === uaUpper) {
          serieForm.setError("ua", { type: "manual", message: "UA duplicada" });
          hasError = true;
        }
      }
    }
    if (hasError) return;

    // Agregar una serie también es un ingreso: serie/UA/EMTA MAC no deben
    // estar ya registradas. La MAC queda excluida (puede repetirse: pertenece
    // a una serie previamente despachada/instalada en el cliente).
    const checks: Array<["serie" | "ua" | "emta_mac", string]> = [];
    if (serieUpper) checks.push(["serie", serieUpper]);
    if (uaUpper) checks.push(["ua", uaUpper]);
    if (emtaMacUpper) checks.push(["emta_mac", emtaMacUpper]);

    for (const [field, value] of checks) {
      try {
        await verificarDisponibilidadIngresoRetirado(value, field);
        // 200 → código libre → disponible para ingresar
      } catch (error: any) {
        if (error?.response?.status === 409) {
          // 409 → ya registrado y no retirado → no disponible
          serieForm.setError(field, {
            type: "manual",
            message: error?.response?.data?.message ?? "Ya existe o no está disponible",
          });
          hasError = true;
        }
      }
    }
    if (hasError) return;
    addSerieMutation.mutate(values);
  };

  // ── Handlers: producto dialog ──────────────────────────────────────────────
  // Descarta filas de serie incompletas (p.ej. la fila vacía que se inserta
  // automáticamente al avanzar con Enter) y exige que al menos una fila
  // tenga completos todos los campos que el equipo requiere.
  const prepareProductoValues = (
    rawValues: ProductoFormValues,
  ): ProductoFormValues | null => {
    if (!needsSeriesRows(rawValues)) return rawValues;
    const completeSeries = (rawValues.series ?? []).filter((s) =>
      isSerieComplete(s, rawValues),
    );
    if (completeSeries.length === 0) {
      productSubForm.setError("series", {
        type: "manual",
        message: "Complete todos los campos requeridos de al menos una serie.",
      });
      return null;
    }
    return { ...rawValues, series: completeSeries, cantidad: completeSeries.length };
  };

  const handleAddOrUpdateProducto = productSubForm.handleSubmit((rawValues) => {
    if (addProductoSubmitLockRef.current) return;
    addProductoSubmitLockRef.current = true;
    try {
      const values = prepareProductoValues(rawValues);
      if (!values) return;
      if (editingProductoIndex === null) {
        appendProducto(values);
      } else {
        updateProductoField(editingProductoIndex, values);
        setEditingProductoIndex(null);
      }
      productSubForm.reset(EMPTY_PRODUCTO);
      setProductoDialogOpen(false);
    } finally {
      addProductoSubmitLockRef.current = false;
    }
  });

  const handleOpenProductoDialog = () => {
    productSubForm.reset(EMPTY_PRODUCTO);
    setEditingProductoIndex(null);
    setProductoDialogOpen(true);
  };

  const handleEditProducto = (index: number) => {
    const producto = createForm.getValues(`productos.${index}`);
    setEditingProductoIndex(index);
    productSubForm.reset(producto);
    setProductoDialogOpen(true);
  };

  const handleCloseProductoDialog = () => {
    setProductoDialogOpen(false);
    setEditingProductoIndex(null);
    productSubForm.reset(EMPTY_PRODUCTO);
  };

  // ── Mutations: CREATE ──────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (values: HeaderCreateFormValues) =>
      createEquipoRetirado({
        fecha: values.fecha,
        sot: values.sot,
        tipo: values.tipo,
        productos: values.productos.map(mapProducto),
      }),
    onSuccess: () => {
      submittedRef.current = true;
      clearDrafts();
      queryClient.invalidateQueries({ queryKey: [EquiposRetiradosComplete.QUERY_KEY] });
      successToast("Equipo retirado creado correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al crear el equipo retirado.");
    },
  });

  // ── Mutations: EDIT ────────────────────────────────────────────────────────
  const editMutation = useMutation({
    mutationFn: (values: HeaderEditFormValues) =>
      updateEquipoRetirado(equipo!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EquiposRetiradosComplete.QUERY_KEY] });
      successToast("Equipo retirado actualizado correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al actualizar.");
    },
  });

  const addProductoEditMutation = useMutation({
    mutationFn: (values: ProductoFormValues) =>
      addProductosEquipoRetirado({
        documento_equipo_retirado_id: equipo!.id,
        productos: [mapProducto(values)],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Producto agregado correctamente.");
      productSubForm.reset(EMPTY_PRODUCTO);
      setProductoDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al agregar el producto.");
    },
  });

  const deleteProductoMutation = useMutation({
    mutationFn: ({ id, forzar }: { id: number; forzar?: boolean }) =>
      deleteProductoEquipoRetirado(id, forzar),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo?.id],
      });
      setDeleteProductoConfirm(null);
      successToast("Producto eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al eliminar el producto.");
    },
  });

  const addSerieMutation = useMutation({
    mutationFn: (values: { serie: string; mac: string; emta_mac: string; ua: string; observaciones: string }) =>
      addSeriesEquipoRetirado({
        detalle_producto_documento_equipo_retirado_id: addSerieForDetailId!,
        series: [
          {
            serie: values.serie || null,
            mac: values.mac || null,
            emta_mac: values.emta_mac || null,
            ua: values.ua || null,
            observaciones: values.observaciones || null,
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Serie agregada correctamente.");
      serieForm.reset();
      setAddSerieForDetailId(null);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al agregar la serie.");
    },
  });

  const deleteSerieMutation = useMutation({
    mutationFn: ({ serieId, detailProductId }: { serieId: number; detailProductId: number }) =>
      deleteSerieEquipoRetirado(serieId, detailProductId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Serie eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al eliminar la serie.");
    },
  });

  // ── Delete producto with cascade (edit mode) ───────────────────────────────
  const handleDeleteProductoEdit = async (producto: EquipoRetiradoProductoResource) => {
    try {
      await deleteProductoEquipoRetirado(producto.id);
      queryClient.invalidateQueries({
        queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", equipo!.id],
      });
      successToast("Producto eliminado correctamente.");
    } catch (error: any) {
      const responseData = error.response?.data;
      const series: Array<{ serie?: string; mac?: string }> =
        responseData?.series ?? responseData?.data?.series ?? [];
      if (series.length > 0) {
        setDeleteProductoConfirm({ id: producto.id, series });
      } else {
        errorToast(responseData?.message ?? "Error al eliminar el producto.");
      }
    }
  };

  // ── Columns for create mode product table ──────────────────────────────────
  const watchedProductos = createForm.watch("productos");

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
        <span className="font-medium text-sm">
          {row.original.nombre || `ID: ${row.original.producto_id}` || "—"}
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
        const count = row.original.series?.length ?? 0;
        if (!count) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <Badge variant="default" className="text-xs">
            {count} serie{count !== 1 ? "s" : ""}
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

  // ── EDIT MODE ──────────────────────────────────────────────────────────────
  if (mode === "edit") {
    const productos = equipo?.productos ?? [];

    return (
      <div className="space-y-4">
        {/* Header form */}
        <form
          onSubmit={editForm.handleSubmit((v) => {
            if (editSubmitLockRef.current || editMutation.isPending) return;
            editSubmitLockRef.current = true;
            editMutation.mutate(v, { onSettled: () => { editSubmitLockRef.current = false; } });
          })}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
              Datos del equipo retirado
            </h3>
            <Separator className="flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormSelectAsync
              name="sot"
              label="SOT"
              control={editForm.control}
              placeholder="Buscar SOT..."
              required
              useQueryHook={useLiquidacionesForSelectQuery}
              mapOptionFn={mapLiquidacionOption}
              defaultOption={equipo ? { value: equipo.sot, label: equipo.sot } : undefined}
              onValueChange={(value, item: LiquidacionResource) => setSelectedCliente(value ? (item?.nombre ?? null) : null)}
            />
            <DatePickerFormField name="fecha" label="Fecha" control={editForm.control} />
            <FormSelect
              name="tipo"
              label="Tipo"
              control={editForm.control}
              placeholder="Seleccione un tipo"
              options={TIPO_EQUIPO_RETIRADO_OPTIONS}
            />
          </div>
          {selectedCliente && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="size-3" />
              <span>Cliente:</span>
              <span className="font-medium text-foreground">{selectedCliente}</span>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={editMutation.isPending}>
              {editMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>

        {/* Productos */}
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
                className="h-6 text-xs px-2"
                onClick={handleOpenProductoDialog}
              >
                <PackagePlus className="size-3 mr-1" />
                Agregar
              </Button>
            )}
          </div>

          {/* Add product dialog — calls API directly in edit mode */}
          <GuiaProductoDialog
            open={productoDialogOpen}
            editingIndex={null}
            productSubForm={productSubForm}
            watchedSeries={watchedSeries}
            onClose={handleCloseProductoDialog}
            onSubmit={productSubForm.handleSubmit((rawValues) => {
              if (addProductoSubmitLockRef.current || addProductoEditMutation.isPending) return;
              const values = prepareProductoValues(rawValues);
              if (!values) return;
              addProductoSubmitLockRef.current = true;
              addProductoEditMutation.mutate(values, {
                onSettled: () => {
                  addProductoSubmitLockRef.current = false;
                },
              });
            })}
            onAppendSerie={appendSerie}
            onRemoveSerie={removeSerie}
            onCheckDuplicate={checkCrossProductDuplicate}
            onValidateField={validateSerieField}
            fieldValidationStatus={fieldValidationStatus}
            isSubmitting={addProductoEditMutation.isPending}
          />

          {productos.length > 0 ? (
            <div className="space-y-2">
              {productos.map((p) => {
                const necesitaSerie = p.producto.necesita_serie === 1;
                const isAddingSerieHere = addSerieForDetailId === p.id;
                return (
                  <div key={p.id} className="border rounded-lg p-3 space-y-2 bg-muted/10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.producto.sap} ·{" "}
                          <span className="capitalize">{p.producto.tipo}</span> · Cant:{" "}
                          {p.cantidad}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {necesitaSerie && !isAddingSerieHere && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              serieForm.reset({ serie: "", mac: "", emta_mac: "", ua: "", observaciones: "" });
                              setAddSerieForDetailId(p.id);
                            }}
                          >
                            <ListPlus className="size-3 mr-1" />
                            Serie
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProductoEdit(p)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Existing series */}
                    {(p.series?.length ?? 0) > 0 && (
                      <div className="pl-2 border-l-2 border-muted space-y-1">
                        {p.series.map((s, si) => (
                          <div
                            key={si}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="font-mono text-muted-foreground">
                              {s.serie.serie}
                              {s.serie.mac ? ` · ${s.serie.mac}` : ""}
                              {s.serie.emta_mac ? ` · ${s.serie.emta_mac}` : ""}
                              {s.observacion ? (
                                <span className="ml-1 not-italic text-muted-foreground/70">
                                  ({s.observacion})
                                </span>
                              ) : null}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-5 text-destructive hover:text-destructive"
                              onClick={() =>
                                deleteSerieMutation.mutate({
                                  serieId: s.serie.id,
                                  detailProductId: p.id,
                                })
                              }
                            >
                              <Trash2 className="size-2.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline serie add form */}
                    {isAddingSerieHere && (
                      <div className="border rounded p-2 space-y-2 bg-muted/5">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <FormInput
                            name="serie"
                            label="Serie"
                            control={serieForm.control}
                            placeholder="Número de serie"
                            required
                            uppercase
                          />
                          <FormInput
                            name="mac"
                            label="MAC"
                            control={serieForm.control}
                            placeholder="001A2B3C4D5E"
                            required={p.producto.necesita_mac === 1}
                            disabled={p.producto.necesita_mac !== 1}
                          />
                          <FormInput
                            name="emta_mac"
                            label="EMTA MAC"
                            control={serieForm.control}
                            placeholder="001A2B3C4D5E"
                            required={String(p.producto.necesita_emta_mac) === "1"}
                            disabled={String(p.producto.necesita_emta_mac) !== "1"}
                          />
                          <FormInput
                            name="ua"
                            label="UA"
                            control={serieForm.control}
                            placeholder="Ingrese UA"
                            uppercase
                            required={p.producto.necesita_ua === 1}
                            disabled={p.producto.necesita_ua !== 1}
                          />
                          <FormInput
                            name="observaciones"
                            label="Observaciones"
                            control={serieForm.control}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAddSerieForDetailId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={addSerieMutation.isPending || isAddingSerie}
                            onClick={handleSubmitSerie}
                          >
                            {addSerieMutation.isPending || isAddingSerie ? "Guardando..." : "Agregar serie"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Este documento no tiene productos registrados.
            </p>
          )}
        </div>

        <ConfirmationDialog
          open={!!deleteProductoConfirm}
          onOpenChange={(open) => {
            if (!open) setDeleteProductoConfirm(null);
          }}
          title="¿Eliminar producto con series asociadas?"
          description="Este producto tiene series asociadas que también serán eliminadas:"
          confirmText="Forzar eliminación"
          onConfirm={() => {
            if (deleteProductoConfirm?.id) {
              deleteProductoMutation.mutate({ id: deleteProductoConfirm.id, forzar: true });
            }
          }}
        >
          <ul className="text-sm space-y-1 max-h-48 overflow-y-auto border rounded p-2">
            {deleteProductoConfirm?.series.map((s, i) => (
              <li key={i} className="font-mono text-xs">
                {[s.serie, s.mac].filter(Boolean).join(" · ")}
              </li>
            ))}
          </ul>
        </ConfirmationDialog>
      </div>
    );
  }

  // ── CREATE MODE ────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={createForm.handleSubmit((v) => {
        if (createSubmitLockRef.current || createMutation.isPending) return;
        createSubmitLockRef.current = true;
        createMutation.mutate(v, { onSettled: () => { createSubmitLockRef.current = false; } });
      })}
      className="space-y-4"
    >
      {/* Datos del equipo retirado */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Datos del equipo retirado
          </h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormSelectAsync
            name="sot"
            label="SOT"
            control={createForm.control}
            placeholder="Buscar SOT..."
            required
            useQueryHook={useLiquidacionesForSelectQuery}
            mapOptionFn={mapLiquidacionOption}
            onValueChange={(value, item: LiquidacionResource) => setSelectedCliente(value ? (item?.nombre ?? null) : null)}
          />
          <DatePickerFormField name="fecha" label="Fecha" control={createForm.control} />
          <FormSelect
            name="tipo"
            label="Tipo"
            control={createForm.control}
            placeholder="Seleccione un tipo"
            options={TIPO_EQUIPO_RETIRADO_OPTIONS}
          />
        </div>
        {selectedCliente && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="size-3" />
            <span>Cliente:</span>
            <span className="font-medium text-foreground">{selectedCliente}</span>
          </div>
        )}
      </div>

      {/* Productos */}
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
          productSubForm={productSubForm}
          watchedSeries={watchedSeries}
          onClose={handleCloseProductoDialog}
          onSubmit={handleAddOrUpdateProducto}
          onAppendSerie={(s) => appendSerie(s)}
          onRemoveSerie={removeSerie}
          onCheckDuplicate={checkCrossProductDuplicate}
          onValidateField={validateSerieField}
          fieldValidationStatus={fieldValidationStatus}
        />

        {watchedProductos.length > 0 && (
          <DataTable
            columns={productoColumns}
            data={watchedProductos}
            variant="outline"
            isVisibleColumnFilter={false}
          />
        )}

        {createForm.formState.errors.productos &&
          !Array.isArray(createForm.formState.errors.productos) && (
            <p className="text-xs text-destructive">
              {createForm.formState.errors.productos.message}
            </p>
          )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Guardando..." : "Crear equipo retirado"}
        </Button>
      </div>
    </form>
  );
}

