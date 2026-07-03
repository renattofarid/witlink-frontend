import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorToast } from "@/lib/core.function";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import { toggleFavoritoTecnico } from "../lib/generar-cargas.actions";
import { GenerarCargasComplete } from "../lib/generar-cargas.constants";

export default function FavoritoListItem({
  tecnico,
}: {
  tecnico: PersonaResource;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleFavoritoTecnico(tecnico.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GenerarCargasComplete.QUERY_KEY],
      });
    },
    onError: () => {
      errorToast("Error al quitar de favoritos.");
    },
  });

  return (
    <div className="flex items-center justify-between gap-2 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <UserRound className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium uppercase">
          {tecnico.apellido_paterno} {tecnico.apellido_materno}{" "}
          {tecnico.nombre}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          ({tecnico.dni})
        </span>
      </div>
      <Button
        size="icon-sm"
        variant="ghost"
        color="red"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
