import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import FormWrapper from "@/components/FormWrapper";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { menuSchema, type MenuFormValues } from "../lib/menu.schema";
import { createMenu, updateMenu } from "../lib/menu.actions";
import { MenuComplete } from "../lib/menu.constants";
import type { MenuResource } from "../lib/menu.interface";

interface MenuFormProps {
  mode: "create" | "edit";
  defaultValues?: MenuResource;
  onSuccess?: () => void;
}

export default function MenuForm({
  mode,
  defaultValues,
  onSuccess,
}: MenuFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema) as Resolver<MenuFormValues>,
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      icono: defaultValues?.icono ?? "",
      orden: defaultValues?.orden ? Number(defaultValues.orden) : 0,
    },
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: (values: MenuFormValues) => {
      if (mode === "create") return createMenu(values);
      return updateMenu(defaultValues!.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MenuComplete.QUERY_KEY] });
      successToast(
        mode === "create"
          ? "Menú creado correctamente."
          : "Menú actualizado correctamente.",
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(MenuComplete.MODEL, mode),
      );
    },
  });

  const onSubmit = (values: MenuFormValues) => {
    mutation.mutate(values);
  };

  return (
    <FormWrapper>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Ingrese el nombre del menú"
          required
        />
        <FormInput
          name="icono"
          label="Ícono"
          control={form.control}
          placeholder="Ej: dashboard, people, settings"
          required
        />
        <FormInput
          name="orden"
          label="Orden"
          type="number"
          control={form.control}
          placeholder="Ingrese el orden"
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
