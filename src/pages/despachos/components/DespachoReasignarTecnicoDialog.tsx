import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { useTecnicoDespachoQuery } from "../lib/despacho.hook";
import type { DespachoResource } from "../lib/despacho.interface";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";

interface DespachoReasignarTecnicoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despacho: DespachoResource | null;
  onConfirm: (nuevoTecnicoId: number) => Promise<void>;
  isLoading?: boolean;
}

export function DespachoReasignarTecnicoDialog({
  open,
  onOpenChange,
  despacho,
  onConfirm,
  isLoading = false,
}: DespachoReasignarTecnicoDialogProps) {
  const [nuevoTecnicoId, setNuevoTecnicoId] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) setNuevoTecnicoId("");
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (!nuevoTecnicoId) return;
    await onConfirm(Number(nuevoTecnicoId));
    setNuevoTecnicoId("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reasignar técnico</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo técnico para el despacho{" "}
            {despacho?.numero ?? ""}. El stock, las series y los movimientos se
            transferirán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <SearchableSelectAsync
          value={nuevoTecnicoId}
          onChange={setNuevoTecnicoId}
          placeholder="Seleccionar nuevo técnico..."
          useQueryHook={useTecnicoDespachoQuery}
          mapOptionFn={(item: PersonaResource) => ({
            value: String(item.id),
            label: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
            description: item.dni,
          })}
          perPage={20}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !nuevoTecnicoId}
          >
            {isLoading ? "Reasignando..." : "Reasignar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
