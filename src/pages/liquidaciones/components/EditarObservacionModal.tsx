import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/lib/core.function";
import { updateObservacionesLiquidacion } from "../lib/liquidaciones.actions";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";

interface EditarObservacionModalProps {
  open: boolean;
  onClose: () => void;
  liquidacion: LiquidacionResource | null;
}

export function EditarObservacionModal({
  open,
  onClose,
  liquidacion,
}: EditarObservacionModalProps) {
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (liquidacion) {
      setObservaciones(liquidacion.observaciones ?? "");
    } else {
      setObservaciones("");
    }
  }, [liquidacion]);

  if (!liquidacion) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateObservacionesLiquidacion(liquidacion.sot, observaciones);
      successToast("Observación actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: [LiquidacionesComplete.QUERY_KEY],
      });
      onClose();
    } catch {
      errorToast("No se pudo actualizar la observación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={`Observación SOT ${liquidacion.sot}`}
      subtitle={liquidacion.nombre ? `Cliente: ${liquidacion.nombre}` : "Comentario interno"}
      size="md"
      icon="MessageSquare"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field>
          <FieldLabel>Comentario / Observación</FieldLabel>
          <Textarea
            rows={4}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escribe un comentario (ej: Enviado a Claro por correo, me quedé en esta SOT...)"
            className="text-sm resize-none"
            autoFocus
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <MessageSquare className="size-4 mr-1" />
            {isSubmitting ? "Guardando..." : "Guardar observación"}
          </Button>
        </div>
      </form>
    </GeneralModal>
  );
}
