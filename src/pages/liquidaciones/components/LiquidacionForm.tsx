import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { GroupFormSection } from "@/components/GroupFormSection";
import { successToast, errorToast } from "@/lib/core.function";
import { Users, MessageSquare } from "lucide-react";
import {
  liquidacionFormSchema,
  type LiquidacionFormValues,
} from "../lib/liquidaciones.schema";
import { saveProductosLiquidacion } from "../lib/liquidaciones.actions";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { useLiquidacionStore } from "../lib/liquidaciones.store";
import { useTecnicosLiquidacionQuery } from "../lib/liquidaciones.hook";
import LiquidacionHeaderInfo from "./LiquidacionHeaderInfo";
import LiquidacionDetailTable from "./LiquidacionDetailTable";
import AddProductosModal from "./AddProductosModal";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import type { LiquidacionCartItem } from "../lib/liquidaciones.interface";

interface LiquidacionFormProps {
  onSuccess?: () => void;
}

export default function LiquidacionForm({ onSuccess }: LiquidacionFormProps) {
  const queryClient = useQueryClient();
  const {
    currentSot,
    sotSearched,
    items,
    isProductModalOpen,
    savedFormValues,
    setSavedFormValues,
    addItems,
    removeItem,
    openProductModal,
    closeProductModal,
  } = useLiquidacionStore();

  // Captura el SOT al momento de montar para identificar los valores guardados
  const sotAtMountRef = useRef(sotSearched);

  const liquidacion = currentSot?.liquidacion;

  const form = useForm<LiquidacionFormValues>({
    resolver: zodResolver(liquidacionFormSchema) as any,
    defaultValues: {
      observaciones: "",
      tecnico1: "",
      tecnico2: "",
    },
    mode: "onChange",
  });

  // Carga los productos ya guardados en la liquidación como items del carrito
  useEffect(() => {
    if (!liquidacion?.productos?.length) return;
    if (useLiquidacionStore.getState().items.length > 0) return;

    const techMap: Record<number, string> = {};
    if (liquidacion.tecnico_uno) {
      techMap[liquidacion.tecnico_uno.id] = liquidacion.tecnico_uno.nombre_completo;
    }
    if (liquidacion.tecnico_dos) {
      techMap[liquidacion.tecnico_dos.id] = liquidacion.tecnico_dos.nombre_completo;
    }

    const cartItems: LiquidacionCartItem[] = liquidacion.productos.map((item) => ({
      tempId: `api-${item.id}`,
      tipo: item.producto.necesita_serie ? "serie" : "material",
      producto_id: item.producto_id,
      producto_nombre: item.producto.nombre,
      producto_sap: item.producto.sap,
      tecnico_id: item.tecnico_id,
      tecnico_nombre: techMap[item.tecnico_id] ?? `Técnico ${item.tecnico_id}`,
      cantidad: Number(item.cantidad),
      series: item.series.map((s) => ({ id: s.serie.id, serie: s.serie.serie })),
    }));

    addItems(cartItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liquidacion]);

  // Guarda los valores del formulario al desmontar, identificados por el SOT capturado al montar
  useEffect(() => {
    const sot = sotAtMountRef.current;
    return () => {
      if (sot) {
        setSavedFormValues({ sot, values: form.getValues() as Record<string, string> });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restaura desde el store si corresponde al mismo SOT, si no usa los valores de la API
  useEffect(() => {
    if (!liquidacion) return;
    if (savedFormValues && savedFormValues.sot === sotAtMountRef.current) {
      form.setValue("observaciones", savedFormValues.values.observaciones ?? "");
      form.setValue("tecnico1", savedFormValues.values.tecnico1 ?? "");
      form.setValue("tecnico2", savedFormValues.values.tecnico2 ?? "");
    } else {
      form.setValue("observaciones", liquidacion.observaciones ?? "");
      if (liquidacion.tecnico1) form.setValue("tecnico1", String(liquidacion.tecnico1));
      if (liquidacion.tecnico2) form.setValue("tecnico2", String(liquidacion.tecnico2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liquidacion]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!liquidacion) throw new Error("No hay SOT cargada");
      if (items.length === 0)
        throw new Error("Debe agregar al menos un producto");

      const grouped: Record<
        string,
        {
          producto_id: number;
          tecnico_id: number;
          cantidad: number;
          series: string[];
        }
      > = {};
      items.forEach((item) => {
        const key = `${item.producto_id}-${item.tecnico_id}`;
        if (!grouped[key]) {
          grouped[key] = {
            producto_id: item.producto_id,
            tecnico_id: item.tecnico_id,
            cantidad: 0,
            series: [],
          };
        }
        grouped[key].cantidad += item.cantidad;
        grouped[key].series.push(...item.series.map((s) => s.serie));
      });

      const totalCantidad = Object.values(grouped).reduce(
        (sum, g) => sum + g.cantidad,
        0,
      );

      return saveProductosLiquidacion({
        liquidacion_id: liquidacion.id,
        cantidad: totalCantidad,
        productos: Object.values(grouped),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LiquidacionesComplete.QUERY_KEY],
      });
      successToast("Liquidación guardada correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al guardar la liquidación.";
      errorToast(errorMessage);
    },
  });

  const tecnico1Value = form.watch("tecnico1");

  const handleSave = form.control.handleSubmit(() => {
    saveMutation.mutate();
  });

  const handleAddItems = (newItems: LiquidacionCartItem[]) => {
    addItems(newItems);
  };

  if (!liquidacion) return null;

  return (
    <div className="space-y-4">
      <LiquidacionHeaderInfo liquidacion={liquidacion} />

      <GroupFormSection
        title="Personal asignado"
        icon={Users}
        cols={{ sm: 1, md: 2 }}
      >
        <FormSelectAsync
          name="tecnico1"
          label="Personal 1"
          control={form.control}
          placeholder="Seleccionar técnico..."
          useQueryHook={useTecnicosLiquidacionQuery}
          mapOptionFn={(item: PersonaResource) => ({
            value: String(item.id),
            label: `${item.nombre} ${item.apellido_paterno}`,
            description: `DNI: ${item.dni}`,
          })}
          perPage={20}
          required
        />
        <FormSelectAsync
          name="tecnico2"
          label="Personal 2"
          control={form.control}
          placeholder="Seleccionar técnico (opcional)..."
          useQueryHook={useTecnicosLiquidacionQuery}
          mapOptionFn={(item: PersonaResource) => ({
            value: String(item.id),
            label: `${item.nombre} ${item.apellido_paterno}`,
            description: `DNI: ${item.dni}`,
          })}
          perPage={20}
        />
      </GroupFormSection>

      <GroupFormSection
        title="Observaciones"
        icon={MessageSquare}
        cols={{ sm: 1, md: 1 }}
      >
        <Controller
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">
                Observación
              </Label>
              <Textarea
                {...field}
                placeholder="Ingrese observaciones opcionales..."
                rows={3}
              />
            </div>
          )}
        />
      </GroupFormSection>

      <LiquidacionDetailTable
        items={items}
        onRemove={removeItem}
        onAddProducts={openProductModal}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />

      {isProductModalOpen && (
        <AddProductosModal
          open={isProductModalOpen}
          onClose={closeProductModal}
          liquidacion={liquidacion}
          onConfirm={handleAddItems}
          initialTecnicoId={tecnico1Value || undefined}
        />
      )}
    </div>
  );
}
