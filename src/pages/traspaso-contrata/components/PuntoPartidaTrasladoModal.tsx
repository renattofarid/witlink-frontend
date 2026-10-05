import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneralModal } from "@/components/GeneralModal";
import { errorToast, successToast } from "@/lib/core.function";
import {
  createPuntoPartidaTraslado,
  deletePuntoPartidaTraslado,
  updatePuntoPartidaTraslado,
} from "../lib/traspaso-contrata.actions";
import { usePuntosPartidaTrasladoQuery } from "../lib/traspaso-contrata.hook";
import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";

interface Props { open: boolean; onClose: () => void; }

export default function PuntoPartidaTrasladoModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data: puntos = [], isLoading } = usePuntosPartidaTrasladoQuery();
  const [descripcion, setDescripcion] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: () => editingId
      ? updatePuntoPartidaTraslado(editingId, descripcion.trim())
      : createPuntoPartidaTraslado(descripcion.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TraspasoContrataComplete.QUERY_KEY, "puntos-partida"] });
      setDescripcion(""); setEditingId(null);
      successToast(editingId ? "Punto de partida actualizado." : "Punto de partida creado.");
    },
    onError: (error: any) => errorToast(error.response?.data?.message ?? "No se pudo guardar el punto de partida."),
  });

  const remove = async (id: number) => {
    if (!window.confirm("¿Eliminar este punto de partida?")) return;
    try {
      await deletePuntoPartidaTraslado(id);
      await queryClient.invalidateQueries({ queryKey: [TraspasoContrataComplete.QUERY_KEY, "puntos-partida"] });
      successToast("Punto de partida eliminado.");
    } catch (error: any) { errorToast(error.response?.data?.message ?? "No se pudo eliminar el punto de partida."); }
  };

  return <GeneralModal open={open} onClose={onClose} title="Puntos de partida" subtitle="Administre las direcciones disponibles para las guías de traspaso." icon="MapPin" size="2xl">
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción del punto de partida" maxLength={255} />
        <Button type="button" disabled={!descripcion.trim() || mutation.isPending} onClick={() => mutation.mutate()}>
          {editingId ? "Actualizar" : <><Plus /> Agregar</>}
        </Button>
        {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setDescripcion(""); }}>Cancelar</Button>}
      </div>
      <div className="divide-y rounded-md border">
        {isLoading && <div className="p-4 text-sm text-muted-foreground">Cargando...</div>}
        {!isLoading && puntos.length === 0 && <div className="p-4 text-sm text-muted-foreground">No hay puntos de partida registrados.</div>}
        {puntos.map((punto) => <div key={punto.id} className="flex items-center justify-between gap-3 p-3 text-sm">
          <span className="truncate">{punto.descripcion}</span>
          <span className="flex shrink-0 gap-1">
            <Button type="button" variant="ghost" size="icon" title="Editar" onClick={() => { setEditingId(punto.id); setDescripcion(punto.descripcion); }}><Pencil className="size-4" /></Button>
            <Button type="button" variant="ghost" size="icon" title="Eliminar" onClick={() => void remove(punto.id)}><Trash2 className="size-4 text-destructive" /></Button>
          </span>
        </div>)}
      </div>
    </div>
  </GeneralModal>;
}
