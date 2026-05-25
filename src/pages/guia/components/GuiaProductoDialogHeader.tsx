import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ProductoFormValues } from "../lib/guia.schema";

interface GuiaProductoDialogHeaderProps {
  editingIndex: number | null;
  productSubForm: UseFormReturn<ProductoFormValues>;
  onClose: () => void;
}

export function GuiaProductoDialogHeader({
  editingIndex,
  onClose,
}: GuiaProductoDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-muted-foreground">
        {editingIndex !== null ? `Producto #${editingIndex + 1}` : "Nuevo producto"}
      </p>
      <Button type="button" variant="ghost" size="icon" className="size-6" onClick={onClose}>
        <X className="size-3" />
      </Button>
    </div>
  );
}
