import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import {
  categoriaSchema,
  type CategoriaFormValues,
} from "../lib/categoria.schema";
import { createCategoria, updateCategoria } from "../lib/categoria.actions";
import { CategoriaComplete } from "../lib/categoria.constants";
import type { CategoriaResource } from "../lib/categoria.interface";

interface CategoriaFormProps {
  mode: "create" | "edit";
  defaultValues?: CategoriaResource;
  onSuccess?: () => void;
}

export default function CategoriaForm({
  mode,
  defaultValues,
  onSuccess,
}: CategoriaFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: CategoriaFormValues) => {
      if (mode === "create") {
        return createCategoria(values);
      }
      return updateCategoria(defaultValues!.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CategoriaComplete.QUERY_KEY],
      });
      successToast(
        mode === "create"
          ? "Categoría creada correctamente."
          : "Categoría actualizada correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(CategoriaComplete.MODEL, mode),
      );
    },
  });

  const onSubmit = (values: CategoriaFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Ingrese el nombre de la categoría"
          required
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Guardando..."
              : mode === "create"
                ? "Crear"
                : "Actualizar"}
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
}
