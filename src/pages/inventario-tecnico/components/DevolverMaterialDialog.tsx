import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DevolverMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxCantidad: number;
  onConfirm: (cantidad: number) => Promise<void>;
}

export default function DevolverMaterialDialog({
  open,
  onOpenChange,
  maxCantidad,
  onConfirm,
}: DevolverMaterialDialogProps) {
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (cantidad < 1 || cantidad > maxCantidad) return;
    setLoading(true);
    try {
      await onConfirm(cantidad);
      onOpenChange(false);
      setCantidad(1);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!loading) {
      onOpenChange(value);
      if (!value) setCantidad(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Devolver Material</DialogTitle>
          <DialogDescription>
            Ingresa la cantidad a devolver al almacén. Máximo: {maxCantidad}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <Label htmlFor="cantidad-devolver">Cantidad</Label>
          <Input
            id="cantidad-devolver"
            type="number"
            min={1}
            max={maxCantidad}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || cantidad < 1 || cantidad > maxCantidad}
          >
            {loading ? "Devolviendo..." : "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
