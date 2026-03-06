import GeneralSheet from "@/components/GeneralSheet";
import { useTipoUsuarioOpcionesMenuQuery } from "../lib/tipo-usuario.hook";
import type { TipoUsuarioResource } from "../lib/tipo-usuario.interface";
import { Loader2 } from "lucide-react";

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
  const { data: opciones, isLoading } = useTipoUsuarioOpcionesMenuQuery(
    tipoUsuario?.id ?? null
  );

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Opciones de Menú — ${tipoUsuario?.nombre ?? ""}`}
      subtitle="Opciones de menú asociadas a este tipo de usuario"
      icon="List"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !opciones || opciones.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          No hay opciones de menú asignadas.
        </p>
      ) : (
        <div className="divide-y">
          {opciones.map((opcion) => (
            <div key={opcion.id} className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{opcion.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">{opcion.ruta}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                Orden: {opcion.orden}
              </span>
            </div>
          ))}
        </div>
      )}
    </GeneralSheet>
  );
}
