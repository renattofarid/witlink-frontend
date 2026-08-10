import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormInput } from "@/components/FormInput";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { SearchableSelect } from "@/components/SearchableSelect";
import { successToast, errorToast } from "@/lib/core.function";

import {
  devolucionHeaderSchema,
  type DevolucionHeaderFormValues,
} from "../lib/devolucion.schema";
import {
  GuiaDevolucionComplete,
  MOTIVO_TRASLADO_DEFAULT,
} from "../lib/devolucion.constants";
import { createGuiaDevolucion, updateGuiaDevolucion } from "../lib/devolucion.actions";
import { useDestinosDevolucionQuery } from "../lib/devolucion.hook";
import DevolucionSeriesInput, {
  type DevolucionSerieCartItem,
} from "./DevolucionSeriesInput";
import type {
  GuiaDevolucionCreateBody,
  GuiaDevolucionProductoBody,
  GuiaDevolucionResource,
} from "../lib/devolucion.interface";
import type { Option } from "@/lib/core.interface";

interface Props {
  mode: "create" | "edit";
  guia?: GuiaDevolucionResource;
  onSuccess?: () => void;
  /** Flujo PEXT: preseleccionan el filtro de búsqueda de series por SOT/despacho. */
  initialSot?: string;
  initialDespachoId?: number;
}

const ALMACEN_PREFIX = "almacen:";
const EXTRA_PREFIX = "extra:";

export default function DevolucionForm({
  mode,
  guia,
  onSuccess,
  initialSot,
  initialDespachoId,
}: Props) {
  const isPext = Boolean(initialSot || initialDespachoId);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [seriesCart, setSeriesCart] = useState<DevolucionSerieCartItem[]>(
    guia?.productos.flatMap((p) =>
      p.series.map((s) => ({
        id: s.id,
        serie: s.serie,
        producto_id: p.producto_id,
        producto: p.producto ?? "",
        sap: p.sap ?? "",
        marca: p.marca ?? "",
      })),
    ) ?? [],
  );
  const [seriesError, setSeriesError] = useState<string | null>(null);

  const [destinoValue, setDestinoValue] = useState("");
  const { data: destinos, isLoading: loadingDestinos } = useDestinosDevolucionQuery();

  const [includeTransportista, setIncludeTransportista] = useState(
    Boolean(
      guia?.transportista?.nombre ||
        guia?.transportista?.conductor ||
        guia?.transportista?.placa_vehiculo,
    ),
  );

  const [customizeProductos, setCustomizeProductos] = useState(false);
  const [productoOverrides, setProductoOverrides] = useState<
    Record<number, GuiaDevolucionProductoBody>
  >({});

  const form = useForm<DevolucionHeaderFormValues>({
    resolver: zodResolver(devolucionHeaderSchema),
    defaultValues: {
      fecha_emision: guia?.fecha_emision?.slice(0, 10) ?? today,
      fecha_traslado: guia?.fecha_traslado?.slice(0, 10) ?? today,
      destinatario: guia?.destinatario ?? "",
      punto_llegada: guia?.punto_llegada ?? "",
      ruc_dni: guia?.ruc_dni ?? "",
      telefono: guia?.telefono ?? "",
      observacion: guia?.observacion ?? "",
      motivo_traslado: guia?.motivo_traslado ?? MOTIVO_TRASLADO_DEFAULT,
      numero_guia_referencia: guia?.numero_guia_referencia ?? "",
      transportista_nombre: guia?.transportista?.nombre ?? "",
      transportista_documento: guia?.transportista?.documento ?? "",
      transportista_direccion: guia?.transportista?.direccion ?? "",
      conductor: guia?.transportista?.conductor ?? "",
      licencia_conducir: guia?.transportista?.licencia_conducir ?? "",
      placa_vehiculo: guia?.transportista?.placa_vehiculo ?? "",
      marca_vehiculo: guia?.transportista?.marca_vehiculo ?? "",
      peso: guia?.otros_datos?.peso ?? "",
      numero_bultos: guia?.otros_datos?.numero_bultos ?? "",
    },
    mode: "onChange",
  });

  const destinoOptions: Option[] = [
    ...(destinos?.almacenes ?? []).map((a) => ({
      value: `${ALMACEN_PREFIX}${a.id}`,
      label: `${a.nombre} (${a.codigo})`,
      description: a.direccion,
    })),
    ...(destinos?.destinos_extra ?? []).map((d) => ({
      value: `${EXTRA_PREFIX}${d.codigo}`,
      label: d.destinatario,
      description: d.punto_llegada,
    })),
  ];

  const handleDestinoChange = (value: string) => {
    setDestinoValue(value);
    if (value.startsWith(ALMACEN_PREFIX)) {
      const id = Number(value.slice(ALMACEN_PREFIX.length));
      const almacen = destinos?.almacenes.find((a) => a.id === id);
      if (almacen) {
        form.setValue("destinatario", almacen.nombre, { shouldValidate: true });
        form.setValue("punto_llegada", almacen.direccion, { shouldValidate: true });
      }
    } else if (value.startsWith(EXTRA_PREFIX)) {
      const codigo = value.slice(EXTRA_PREFIX.length);
      const extra = destinos?.destinos_extra.find((d) => d.codigo === codigo);
      if (extra) {
        form.setValue("destinatario", extra.destinatario, { shouldValidate: true });
        form.setValue("ruc_dni", extra.ruc_dni, { shouldValidate: true });
        form.setValue("telefono", extra.telefono ?? "", { shouldValidate: true });
        form.setValue("punto_llegada", extra.punto_llegada, { shouldValidate: true });
      }
    }
  };

  // Productos únicos en el carrito de series, para permitir personalizar
  // unidad/descripción/marca/modelo que se muestran en la tabla del PDF.
  const uniqueProductos = Array.from(
    new Map(seriesCart.map((s) => [s.producto_id, s])).values(),
  );

  const getOverride = (
    producto_id: number,
    sap: string,
    nombre: string,
    marca: string = "",
  ): GuiaDevolucionProductoBody =>
    productoOverrides[producto_id] ?? {
      producto_id,
      unidad: "UND",
      descripcion: nombre,
      marca,
      modelo: sap,
    };

  const setOverrideField = (
    producto_id: number,
    sap: string,
    nombre: string,
    marca: string,
    field: keyof GuiaDevolucionProductoBody,
    value: string,
  ) => {
    setProductoOverrides((prev) => ({
      ...prev,
      [producto_id]: { ...getOverride(producto_id, sap, nombre, marca), [field]: value },
    }));
  };

  const mutation = useMutation({
    mutationFn: (body: GuiaDevolucionCreateBody) =>
      mode === "create"
        ? createGuiaDevolucion(body)
        : updateGuiaDevolucion(guia!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaDevolucionComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Guía de devolución creada correctamente."
          : "Guía de devolución actualizada correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          `Error al ${mode === "create" ? "crear" : "actualizar"} la guía de devolución.`,
      );
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (seriesCart.length === 0) {
      setSeriesError("Agregue al menos una serie retirada.");
      return;
    }
    if (isPext) {
      const despachoIds = new Set(
        seriesCart.map((s) => s.despacho?.id).filter(Boolean),
      );
      if (despachoIds.size > 1) {
        setSeriesError(
          "Todas las series deben pertenecer al mismo despacho/almacén origen.",
        );
        return;
      }
    }
    setSeriesError(null);

    const body: GuiaDevolucionCreateBody = {
      fecha_emision: values.fecha_emision,
      fecha_traslado: values.fecha_traslado,
      destinatario: values.destinatario,
      punto_llegada: values.punto_llegada,
      ruc_dni: values.ruc_dni,
      telefono: values.telefono || null,
      observacion: values.observacion || null,
      motivo_traslado: values.motivo_traslado,
      numero_guia_referencia: values.numero_guia_referencia || null,
      series: seriesCart.map((s) => s.id),
    };

    if (includeTransportista) {
      body.transportista_nombre = values.transportista_nombre || null;
      body.transportista_documento = values.transportista_documento || null;
      body.transportista_direccion = values.transportista_direccion || null;
      body.conductor = values.conductor || null;
      body.licencia_conducir = values.licencia_conducir || null;
      body.placa_vehiculo = values.placa_vehiculo || null;
      body.marca_vehiculo = values.marca_vehiculo || null;
      body.peso = values.peso || null;
      body.numero_bultos = values.numero_bultos || null;
    }

    if (customizeProductos && uniqueProductos.length > 0) {
      body.productos = uniqueProductos.map((p) =>
        getOverride(p.producto_id, p.sap, p.producto),
      );
    }

    mutation.mutate(body);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Datos de la guía */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Datos de la guía
          </h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <DatePickerFormField
            name="fecha_emision"
            label="Fecha de emisión"
            control={form.control}
            required
          />
          <DatePickerFormField
            name="fecha_traslado"
            label="Fecha de traslado"
            control={form.control}
            required
          />
          <FormInput
            name="numero_guia_referencia"
            label="N.° guía de referencia"
            control={form.control}
            placeholder="T001-007001"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormInput
            name="motivo_traslado"
            label="Motivo de traslado"
            control={form.control}
            required
          />
          <FormInput
            name="observacion"
            label="Observación"
            control={form.control}
          />
        </div>
      </div>

      {/* Destinatario */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Destinatario
          </h3>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs md:text-sm font-medium text-muted-foreground">
            Destino
          </Label>
          <SearchableSelect
            placeholder={loadingDestinos ? "Cargando destinos..." : "Seleccionar destino..."}
            options={destinoOptions}
            value={destinoValue}
            onChange={handleDestinoChange}
            disabled={loadingDestinos}
          />
          <p className="text-xs text-muted-foreground">
            Seleccione un almacén o destino para autocompletar los datos, o edítelos manualmente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormInput
            name="destinatario"
            label="Destinatario"
            control={form.control}
            required
          />
          <FormInput
            name="ruc_dni"
            label="RUC / DNI"
            control={form.control}
            required
            maxLength={11}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormInput
            name="punto_llegada"
            label="Punto de llegada"
            control={form.control}
            required
          />
          <FormInput
            name="telefono"
            label="Teléfono"
            control={form.control}
            maxLength={9}
          />
        </div>
      </div>

      {/* Series */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
            Series retiradas
          </h3>
          <Separator className="flex-1" />
        </div>
        {isPext && (
          <p className="text-xs text-muted-foreground bg-muted/40 border rounded-md px-3 py-1.5">
            Modo PEXT: la búsqueda de series se filtra por{" "}
            {initialDespachoId ? `despacho #${initialDespachoId}` : `SOT ${initialSot}`}.
          </p>
        )}
        <DevolucionSeriesInput
          items={seriesCart}
          onAdd={(item) => {
            setSeriesCart((prev) => [...prev, item]);
            setSeriesError(null);
          }}
          onRemove={(id) =>
            setSeriesCart((prev) => prev.filter((i) => i.id !== id))
          }
          extraParams={
            isPext
              ? { sot: initialSot, despacho_id: initialDespachoId }
              : undefined
          }
        />
        {seriesError && <p className="text-xs text-destructive">{seriesError}</p>}
      </div>

      {/* Personalizar tabla de productos */}
      {uniqueProductos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="customize-productos"
              checked={customizeProductos}
              onCheckedChange={(v) => setCustomizeProductos(Boolean(v))}
            />
            <Label htmlFor="customize-productos" className="text-xs md:text-sm font-medium cursor-pointer">
              Personalizar unidad, descripción, marca y modelo en el PDF
            </Label>
          </div>

          {customizeProductos && (
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-2 py-1.5 font-medium">Producto</th>
                    <th className="text-left px-2 py-1.5 font-medium">Unidad</th>
                    <th className="text-left px-2 py-1.5 font-medium">Descripción</th>
                    <th className="text-left px-2 py-1.5 font-medium">Marca</th>
                    <th className="text-left px-2 py-1.5 font-medium">Modelo</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueProductos.map((p) => {
                    const marcaDefault = p.marca ?? "";
                    const ov = getOverride(p.producto_id, p.sap, p.producto, marcaDefault);
                    return (
                      <tr key={p.producto_id} className="border-t">
                        <td className="px-2 py-1.5 whitespace-nowrap">{p.producto}</td>
                        <td className="px-2 py-1.5">
                          <Input
                            className="h-7 text-xs"
                            value={ov.unidad}
                            onChange={(e) =>
                              setOverrideField(p.producto_id, p.sap, p.producto, marcaDefault, "unidad", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input
                            className="h-7 text-xs"
                            value={ov.descripcion}
                            onChange={(e) =>
                              setOverrideField(p.producto_id, p.sap, p.producto, marcaDefault, "descripcion", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input
                            className="h-7 text-xs"
                            value={ov.marca}
                            onChange={(e) =>
                              setOverrideField(p.producto_id, p.sap, p.producto, marcaDefault, "marca", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <Input
                            className="h-7 text-xs"
                            value={ov.modelo}
                            onChange={(e) =>
                              setOverrideField(p.producto_id, p.sap, p.producto, marcaDefault, "modelo", e.target.value)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Transportista */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="include-transportista"
            checked={includeTransportista}
            onCheckedChange={(v) => setIncludeTransportista(Boolean(v))}
          />
          <Label htmlFor="include-transportista" className="text-xs md:text-sm font-medium cursor-pointer flex items-center gap-1.5">
            <Truck className="size-3.5" />
            Incluir datos de transportista
          </Label>
        </div>

        {includeTransportista && (
          <div className="space-y-3 border rounded-md p-3 bg-muted/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput name="transportista_nombre" label="Transportista" control={form.control} />
              <FormInput name="transportista_documento" label="RUC transportista" control={form.control} maxLength={11} />
              <FormInput name="transportista_direccion" label="Dirección transportista" control={form.control} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput name="conductor" label="Conductor" control={form.control} />
              <FormInput name="licencia_conducir" label="Licencia de conducir" control={form.control} />
              <FormInput name="placa_vehiculo" label="Placa de vehículo" control={form.control} maxLength={6} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput name="marca_vehiculo" label="Marca de vehículo" control={form.control} />
              <FormInput name="peso" label="Peso" control={form.control} placeholder="10 KG" />
              <FormInput name="numero_bultos" label="N.° de bultos" control={form.control} />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Guardando..."
            : mode === "create"
              ? "Crear guía de devolución"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
