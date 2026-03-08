import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { successToast, errorToast } from "@/lib/core.function";
import { Plus, Trash2 } from "lucide-react";
import { createOpcionMenu, updateOpcionMenu } from "../lib/menu.actions";
import { OPCION_MENU_QUERY_KEY } from "../lib/menu.constants";
import { opcionMenuSchema, type OpcionMenuFormValues } from "../lib/menu.schema";
import type { OpcionMenuResource } from "../lib/menu.interface";

// Schema para bulk create (array de opciones)
const bulkOpcionMenuSchema = z.object({
  opciones: z.array(opcionMenuSchema).min(1, "Agrega al menos una opción"),
});
type BulkOpcionMenuFormValues = z.infer<typeof bulkOpcionMenuSchema>;

interface OpcionMenuFormCreateProps {
  mode: "create";
  grupoMenuId: number;
  onSuccess?: () => void;
}

interface OpcionMenuFormEditProps {
  mode: "edit";
  defaultValues: OpcionMenuResource;
  onSuccess?: () => void;
}

type OpcionMenuFormProps = OpcionMenuFormCreateProps | OpcionMenuFormEditProps;

function EditForm({
  defaultValues,
  onSuccess,
}: {
  defaultValues: OpcionMenuResource;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<OpcionMenuFormValues>({
    resolver: zodResolver(opcionMenuSchema),
    defaultValues: {
      nombre: defaultValues.nombre,
      ruta: defaultValues.ruta,
      icono: defaultValues.icono,
      orden: defaultValues.orden,
      grupo_menu_id: defaultValues.grupo_menu_id,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: OpcionMenuFormValues) =>
      updateOpcionMenu(defaultValues.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [OPCION_MENU_QUERY_KEY, defaultValues.grupo_menu_id],
      });
      successToast("Opción de menú actualizada correctamente.");
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al actualizar la opción de menú."
      );
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <FormInput name="nombre" label="Nombre" control={form.control} placeholder="Nombre" required />
        <FormInput name="ruta" label="Ruta" control={form.control} placeholder="/ruta" required />
        <FormInput name="icono" label="Ícono" control={form.control} placeholder="Ej: dashboard" required />
        <FormInput name="orden" label="Orden" control={form.control} placeholder="1" required />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando..." : "Actualizar"}
        </Button>
      </div>
    </form>
  );
}

function BulkCreateForm({
  grupoMenuId,
  onSuccess,
}: {
  grupoMenuId: number;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<BulkOpcionMenuFormValues>({
    resolver: zodResolver(bulkOpcionMenuSchema),
    defaultValues: {
      opciones: [
        { nombre: "", ruta: "", icono: "", orden: "", grupo_menu_id: grupoMenuId },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "opciones",
  });

  const mutation = useMutation({
    mutationFn: async (values: BulkOpcionMenuFormValues) => {
      for (const opcion of values.opciones) {
        await createOpcionMenu({ ...opcion, grupo_menu_id: grupoMenuId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [OPCION_MENU_QUERY_KEY, grupoMenuId],
      });
      const count = form.getValues("opciones").length;
      successToast(
        count === 1
          ? "Opción de menú creada correctamente."
          : `${count} opciones de menú creadas correctamente.`
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al crear las opciones de menú."
      );
    },
  });

  const addRow = () => {
    append({ nombre: "", ruta: "", icono: "", orden: "", grupo_menu_id: grupoMenuId });
  };

  return (
    <form
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="space-y-3"
    >
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-start border rounded-md p-3"
          >
            <FormInput
              name={`opciones.${index}.nombre`}
              label={index === 0 ? "Nombre" : undefined}
              control={form.control}
              placeholder="Nombre"
            />
            <FormInput
              name={`opciones.${index}.ruta`}
              label={index === 0 ? "Ruta" : undefined}
              control={form.control}
              placeholder="/ruta"
            />
            <FormInput
              name={`opciones.${index}.icono`}
              label={index === 0 ? "Ícono" : undefined}
              control={form.control}
              placeholder="Ej: dashboard"
            />
            <FormInput
              name={`opciones.${index}.orden`}
              label={index === 0 ? "Orden" : undefined}
              control={form.control}
              placeholder="1"
            />
            <div className={index === 0 ? "pt-6" : "pt-0"}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-1">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="size-4 mr-1" />
          Agregar fila
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Guardando..."
            : fields.length === 1
              ? "Crear opción"
              : `Crear ${fields.length} opciones`}
        </Button>
      </div>
    </form>
  );
}

export default function OpcionMenuForm(props: OpcionMenuFormProps) {
  if (props.mode === "edit") {
    return (
      <EditForm defaultValues={props.defaultValues} onSuccess={props.onSuccess} />
    );
  }
  return (
    <BulkCreateForm grupoMenuId={props.grupoMenuId} onSuccess={props.onSuccess} />
  );
}
