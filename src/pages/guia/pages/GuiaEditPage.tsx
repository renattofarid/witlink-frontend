import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/lib/core.function";
import { GuiaComplete } from "../lib/guia.constants";
import { getGuia, updateGuia } from "../lib/guia.actions";
import { guiaEditSchema, type GuiaEditFormValues } from "../lib/guia.schema";

export default function GuiaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: guia, isLoading } = useQuery({
    queryKey: [GuiaComplete.QUERY_KEY, "detail", id],
    queryFn: () => getGuia(Number(id)),
    enabled: !!id,
  });

  const form = useForm<GuiaEditFormValues>({
    resolver: zodResolver(guiaEditSchema),
    defaultValues: { nombre: "" },
  });

  useEffect(() => {
    if (guia) {
      form.reset({ nombre: guia.numero ?? "" });
    }
  }, [guia, form]);

  const mutation = useMutation({
    mutationFn: (values: GuiaEditFormValues) => updateGuia(Number(id), values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GuiaComplete.QUERY_KEY] });
      successToast("Guía actualizada correctamente.");
      navigate(GuiaComplete.ABSOLUTE_ROUTE);
    },
    onError: () => {
      errorToast("Error al actualizar la guía.");
    },
  });

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="text-muted-foreground text-sm">Cargando...</div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent
        title={GuiaComplete.MODEL.name}
        mode="edit"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4 max-w-md"
      >
        <FormInput
          name="nombre"
          label="Nombre"
          control={form.control}
          placeholder="Nombre de la guía"
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Actualizar"}
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
}
