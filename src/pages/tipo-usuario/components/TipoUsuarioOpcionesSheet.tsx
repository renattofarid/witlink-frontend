import { useMutation, useQueryClient } from "@tanstack/react-query";
import GeneralSheet from "@/components/GeneralSheet";
import {
  useTipoUsuarioOpcionesMenuQuery,
  useAllOpcionesMenuQuery,
} from "../lib/tipo-usuario.hook";
import { addPermiso, deletePermiso } from "../lib/tipo-usuario.actions";
import type { TipoUsuarioResource, OpcionMenuWithGrupo } from "../lib/tipo-usuario.interface";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TipoUsuarioComplete } from "../lib/tipo-usuario.constants";
import { infoToast, errorToast } from "@/lib/core.function";

interface TipoUsuarioOpcionesSheetProps {
  open: boolean;
  onClose: () => void;
  tipoUsuario: TipoUsuarioResource | null;
}

export default function TipoUsuarioOpcionesSheet({
  open,
  onClose,
  tipoUsuario,
}: TipoUsuarioOpcionesSheetProps) {
  const queryClient = useQueryClient();

  const { data: asignadas, isLoading: loadingAsignadas } = useTipoUsuarioOpcionesMenuQuery(
    tipoUsuario?.id ?? null
  );
  const { data: todas, isLoading: loadingTodas } = useAllOpcionesMenuQuery();

  const isLoading = loadingAsignadas || loadingTodas;

  const asignadasIds = new Set((asignadas ?? []).map((o) => o.id));

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [TipoUsuarioComplete.QUERY_KEY, "opciones-menu", tipoUsuario?.id],
    });

  const addMutation = useMutation({
    mutationFn: addPermiso,
    onSuccess: (_, vars) => {
      const nombre = todas?.find((o) => o.id === vars.menu_option_id)?.nombre ?? "Opción";
      infoToast(`"${nombre}" añadida al menú.`);
      invalidate();
    },
    onError: () => errorToast("No se pudo asignar el permiso."),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePermiso,
    onSuccess: (_, vars) => {
      const nombre = todas?.find((o) => o.id === vars.menu_option_id)?.nombre ?? "Opción";
      infoToast(`"${nombre}" removida del menú.`);
      invalidate();
    },
    onError: () => errorToast("No se pudo remover el permiso."),
  });

  const handleToggle = (opcion: OpcionMenuWithGrupo, checked: boolean) => {
    if (!tipoUsuario) return;
    const body = { role_id: tipoUsuario.id, menu_option_id: opcion.id };
    if (checked) {
      addMutation.mutate(body);
    } else {
      deleteMutation.mutate(body);
    }
  };

  // Agrupar todas las opciones por grupo_menu
  const groups = (todas ?? []).reduce<
    Record<number, { nombre: string; opciones: OpcionMenuWithGrupo[] }>
  >((acc, opcion) => {
    const gid = opcion.grupo_menu_id;
    if (!acc[gid]) {
      acc[gid] = { nombre: opcion.grupo_menu.nombre, opciones: [] };
    }
    acc[gid].opciones.push(opcion);
    return acc;
  }, {});

  const isBusy = addMutation.isPending || deleteMutation.isPending;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Permisos — ${tipoUsuario?.nombre ?? ""}`}
      subtitle="Selecciona las opciones de menú que tendrá este tipo de usuario"
      icon="List"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(groups).map(([gid, group]) => (
            <div key={gid} className="rounded-lg border bg-card">
              <div className="px-4 py-2.5 border-b bg-muted/50 rounded-t-lg">
                <span className="text-sm font-semibold">{group.nombre}</span>
              </div>
              <div className="divide-y">
                {group.opciones.map((opcion) => {
                  const checked = asignadasIds.has(opcion.id);
                  return (
                    <label
                      key={opcion.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={isBusy}
                        onCheckedChange={(val) => handleToggle(opcion, !!val)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{opcion.nombre}</p>
                        <p className="text-xs text-muted-foreground">{opcion.ruta}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </GeneralSheet>
  );
}
