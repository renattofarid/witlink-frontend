import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormInput } from "@/components/FormInput";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { errorToast } from "@/lib/core.function";
import { Trash2, Pencil, PackagePlus } from "lucide-react";
import { LiquidacionesComplete } from "@/pages/liquidaciones/lib/liquidaciones.constants";
import {
  despachoCreateSchema,
  type DespachoCreateFormValues,
  type DespachoProductoFormValues,
  type DespachoSerieFormValues,
} from "../lib/despacho.schema";
import { createDespacho, updateDespacho } from "../lib/despacho.actions";
import { DespachoComplete } from "../lib/despacho.constants";
import { useTecnicoDespachoQuery } from "../lib/despacho.hook";
import { useAuthStore } from "@/pages/auth/lib/auth.store";
import { getAlmacenes } from "@/pages/auth/lib/auth.actions";
import { isCorporateAlmacen } from "@/pages/auth/lib/auth.utils";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import type {
  DespachoCreateBody,
  DespachoResource,
  MasivoSerieValidadaItem,
} from "../lib/despacho.interface";
import { DespachoProductoDialog } from "./DespachoProductoDialog";
import { DespachoMasivoSeriesInput } from "./DespachoMasivoSeriesInput";
import { DespachoSotSeriesPanel } from "./DespachoSotSeriesPanel";
import { DespachoSotMaterialsPanel } from "./DespachoSotMaterialsPanel";
import { DespachoSotRemisionPreview } from "./DespachoSotRemisionPreview";
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
  mode?: "create" | "edit";
  despacho?: DespachoResource;
  onSuccess?: () => void;
}

export default function DespachoForm({
  mode = "create",
  despacho,
  onSuccess,
}: DespachoFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const almacen_id = useAuthStore((s) => s.almacen_id);
  const { data: almacenesAll = [] } = useQuery({
    queryKey: ["almacenes-select"],
    queryFn: getAlmacenes,
    refetchOnWindowFocus: false,
  });
  const activeAlmacen =
    almacenesAll.find((a) => a.id === almacen_id) ?? null;
  const isCorporativo =
    !!user?.is_corporativo ||
    !!user?.es_subalmacen_corporativo ||
    (activeAlmacen ? isCorporateAlmacen(activeAlmacen) : false);

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

  useEffect(() => {
    if (mode !== "edit" || !despacho) return;

    form.reset({
      tecnico_id: despacho.tecnico?.id ? String(despacho.tecnico.id) : "",
      sot: despacho.sot ?? despacho.numero_sot ?? "",
      productos: (despacho.productos ?? []).map((detalle) => ({
        producto_id: String(detalle.producto?.id ?? ""),
        nombre: detalle.producto?.nombre ?? null,
        sap: detalle.producto?.sap ?? null,
        tipo: detalle.producto?.tipo as "MATERIAL" | "EQUIPO" | null,
        cantidad: Number(detalle.cantidad),
        series: (detalle.series ?? [])
          .map((s) => s.serie)
          .filter(Boolean)
          .map((serie) => ({
            serie_id: serie!.id,
            serie: serie!.serie,
          })),
      })),
    });
    setMasivoSeries([]);
  }, [despacho, form, mode]);

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

  // Set de productos en el formulario
  const watchedProductos = form.watch("productos") ?? [];
  const existingProductsSet = useMemo(
    () => new Set(watchedProductos.map((p) => String(p.producto_id))),
    [watchedProductos],
  );

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
    mutationFn: (body: DespachoCreateBody) =>
      mode === "edit" && despacho
        ? updateDespacho(despacho.id, body)
        : createDespacho(body),
    onSuccess: (_data, variables) => {
      form.reset({ tecnico_id: "", productos: [], sot: "" });
      setMasivoSeries([]);
      queryClient.invalidateQueries({ queryKey: [DespachoComplete.QUERY_KEY] });
      if (mode === "edit") {
        queryClient.invalidateQueries({
          queryKey: [DespachoComplete.QUERY_KEY, "detail", String(despacho?.id)],
        });
        toast.success("Despacho actualizado correctamente.", {
          action: { label: "Listo", onClick: () => toast.dismiss() },
        });
        onSuccess?.();
        return;
      }
      const sot = variables.sot?.trim().toUpperCase();
      if (sot) {
        toast.success("Despacho creado correctamente.", {
          description: `SOT ${sot} registrada para liquidación.`,
          action: {
            label: "Ver liquidación",
            onClick: () =>
              navigate(
                `${LiquidacionesComplete.ROUTE_ADD}?sot=${encodeURIComponent(sot)}`,
              ),
          },
        });
      } else {
        toast.success("Despacho creado correctamente.", {
          action: { label: "Listo", onClick: () => toast.dismiss() },
        });
      }
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          (mode === "edit"
            ? "Error al actualizar el despacho."
            : "Error al crear el despacho."),
      );
    },
  });
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
          almacenId={almacen_id}
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
          {mutation.isPending
            ? "Guardando..."
            : mode === "edit"
              ? "Actualizar despacho"
              : "Crear despacho"}
        </Button>
      </div>
    </form>
  );
}
