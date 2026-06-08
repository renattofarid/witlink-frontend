import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { serieSchema, type SerieFormValues } from "../lib/serie.schema";
import { createSerie } from "../lib/serie.actions";
import { SerieComplete } from "../lib/serie.constants";
import { useProductosAllQuery } from "../lib/serie.hook";

interface SerieFormProps {
  onSuccess?: () => void;
}

export default function SerieForm({ onSuccess }: SerieFormProps) {
  const queryClient = useQueryClient();
  const { data: productos = [] } = useProductosAllQuery();

  const productoOptions = productos.map((p) => ({
    value: String(p.id),
    label: p.nombre,
  }));

  const form = useForm<SerieFormValues>({
    resolver: zodResolver(serieSchema),
    defaultValues: {
      producto_id: "",
      serie: "",
      mac: "",
      emta_mac: "",
      ua: "",
      necesita_serie: false,
      necesita_mac: false,
      necesita_emta_mac: false,
      necesita_ua: false,
    },
    mode: "onChange",
  });

  const productoId = useWatch({ control: form.control, name: "producto_id" });
  const necesitaSerie = useWatch({ control: form.control, name: "necesita_serie" });
  const necesitaMac = useWatch({ control: form.control, name: "necesita_mac" });
  const necesitaEmtaMac = useWatch({ control: form.control, name: "necesita_emta_mac" });
  const necesitaUa = useWatch({ control: form.control, name: "necesita_ua" });

  // Al cambiar el producto, ajustar qué campos requiere (serie/mac/emta_mac/ua)
  useEffect(() => {
    const producto = productos.find((p) => String(p.id) === productoId);
    form.setValue("necesita_serie", producto?.necesita_serie ?? false);
    form.setValue("necesita_mac", producto?.necesita_mac ?? false);
    form.setValue("necesita_emta_mac", producto?.necesita_emta_mac ?? false);
    form.setValue("necesita_ua", producto?.necesita_ua ?? false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoId, productos]);

  const mutation = useMutation({
    mutationFn: (values: SerieFormValues) =>
      createSerie({
        producto_id: Number(values.producto_id),
        serie: values.serie ?? "",
        mac: values.mac ?? "",
        emta_mac: values.emta_mac ?? "",
        ua: values.ua ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SerieComplete.QUERY_KEY] });
      successToast("Serie creada correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(SerieComplete.MODEL, "create"),
      );
    },
  });

  const onSubmit = (values: SerieFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.control.handleSubmit(onSubmit)} className="space-y-4">
        <FormSelect
          name="producto_id"
          label="Producto"
          control={form.control}
          placeholder="Seleccione un producto"
          options={productoOptions}
          required
        />
        {necesitaSerie && (
          <FormInput
            name="serie"
            label="Serie"
            control={form.control}
            placeholder="Ingrese el número de serie"
            required
          />
        )}
        {necesitaMac && (
          <FormInput
            name="mac"
            label="MAC"
            control={form.control}
            placeholder="Ingrese MAC"
            required
          />
        )}
        {necesitaEmtaMac && (
          <FormInput
            name="emta_mac"
            label="EMTA MAC"
            control={form.control}
            placeholder="Ingrese EMTA MAC"
            required
          />
        )}
        {necesitaUa && (
          <FormInput
            name="ua"
            label="UA"
            control={form.control}
            placeholder="Ingrese UA"
            required
          />
        )}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Crear"}
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
}
