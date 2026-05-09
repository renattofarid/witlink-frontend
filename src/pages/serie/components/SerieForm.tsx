import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { MacInput } from "@/components/MacInput";
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
      serie: "",
      situacion: "",
      mac: "",
      ua: "",
      producto_id: "",
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (values: SerieFormValues) =>
      createSerie({
        serie: values.serie,
        situacion: values.situacion,
        mac: values.mac,
        ua: values.ua,
        producto_id: Number(values.producto_id),
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
        <FormInput
          name="serie"
          label="Serie"
          control={form.control}
          placeholder="Ingrese el número de serie"
          required
        />
        <FormInput
          name="situacion"
          label="Situación"
          control={form.control}
          placeholder="Ingrese la situación"
          required
        />
        <MacInput
          name="mac"
          label="MAC"
          control={form.control}
        />
        <FormInput
          name="ua"
          label="UA"
          control={form.control}
          placeholder="Ingrese el UA"
          required
        />
        <FormSelect
          name="producto_id"
          label="Producto"
          control={form.control}
          placeholder="Seleccione un producto"
          options={productoOptions}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Crear"}
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
}
