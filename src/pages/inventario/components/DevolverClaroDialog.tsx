import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DevolverClaroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (contabilizado: string) => Promise<void>;
  isLoading?: boolean;
}

export function DevolverClaroDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DevolverClaroDialogProps) {
  const [contabilizado, setContabilizado] = useState("");

  useEffect(() => {
    if (open) setContabilizado("");
  }, [open]);

  const handleConfirm = async () => {
    if (!contabilizado.trim()) return;
    await onConfirm(contabilizado.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Devolver a Claro</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label className="text-xs md:text-sm">Contabilizado</Label>
          <Input
            value={contabilizado}
            onChange={(e) => setContabilizado(e.target.value)}
            placeholder="Serie o código del cliente"
            maxLength={100}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !contabilizado.trim()}
          >
            {isLoading ? "Procesando..." : "Devolver a Claro"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
