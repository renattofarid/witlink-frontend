import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductoFormValues } from "../lib/guia.schema";

interface GuiaProductoDialogHeaderProps {
  editingIndex: number | null;
  tab: "catalogo" | "manual";
  productSubForm: UseFormReturn<ProductoFormValues>;
  onTabChange: (tab: "catalogo" | "manual") => void;
  onClose: () => void;
}

export function GuiaProductoDialogHeader({
  editingIndex,
  tab,
  productSubForm,
  onTabChange,
  onClose,
}: GuiaProductoDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {editingIndex !== null ? `Producto #${editingIndex + 1}` : "Nuevo producto"}
        </p>
        <div className="flex gap-1">
          {(["catalogo", "manual"] as const).map((t) => (
            <Button
              key={t}
              size="xs"
              type="button"
              onClick={() => {
                if (tab === t) return;
                if (t === "catalogo") {
                  productSubForm.setValue("categoria_id", null);
                  productSubForm.setValue("sap", null);
                  productSubForm.setValue("nombre", null);
                  productSubForm.setValue("tipo", null);
                  productSubForm.setValue("origen", null);
                } else {
                  productSubForm.setValue("producto_id", null);
                  productSubForm.setValue("tipo", null);
                }
                productSubForm.setValue("necesita_serie", null);
                productSubForm.setValue("necesita_mac", null);
                productSubForm.setValue("necesita_emta_mac", null);
                productSubForm.setValue("necesita_ua", null);
                onTabChange(t);
              }}
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {t === "catalogo" ? "Catálogo" : "Nuevo"}
            </Button>
          ))}
        </div>
      </div>
      <Button type="button" variant="ghost" size="icon" className="size-6" onClick={onClose}>
        <X className="size-3" />
      </Button>
    </div>
  );
}
