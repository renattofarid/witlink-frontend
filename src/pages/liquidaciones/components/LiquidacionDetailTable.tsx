import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PackagePlus } from "lucide-react";
import type { LiquidacionCartItem } from "../lib/liquidaciones.interface";

interface LiquidacionDetailTableProps {
  items: LiquidacionCartItem[];
  onRemove: (tempId: string) => void;
  onAddProducts: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function LiquidacionDetailTable({
  items,
  onRemove,
  onAddProducts,
  onSave,
  isSaving,
}: LiquidacionDetailTableProps) {
  const columns: ColumnDef<LiquidacionCartItem>[] = [
    {
      accessorKey: "producto_nombre",
      header: "Producto",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.original.producto_nombre}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {row.original.producto_sap}
          </span>
        </div>
      ),
    },
    {
      id: "serie",
      header: "Serie",
      cell: ({ row }) => {
        const series = row.original.series;
        if (!series.length)
          return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {series.map((s) => (
              <Badge key={s.id} variant="outline" className="text-xs font-mono">
                {s.serie}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "cantidad",
      header: "Cantidad",
      cell: ({ row }) => (
        <span className="font-semibold text-sm">{row.original.cantidad}</span>
      ),
    },
    {
      accessorKey: "tecnico_nombre",
      header: "Origen inventario",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.tecnico_nombre}</span>
      ),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge
          color={row.original.tipo === "material" ? "blue" : "green"}
          className="text-xs"
        >
          {row.original.tipo === "material" ? "Material" : "Equipo"}
        </Badge>
      ),
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={() => onRemove(row.original.tempId)}
        >
          <Trash2 className="size-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header sección */}
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
          Detalle de liquidación
        </h3>
        <Separator className="flex-1" />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onAddProducts}
          >
            <PackagePlus className="size-3 mr-1" />
            Agregar producto
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            onClick={onSave}
            disabled={isSaving || items.length === 0}
          >
            {isSaving ? "Guardando..." : "Guardar liquidación"}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg text-muted-foreground gap-2">
          <PackagePlus className="size-8 opacity-40" />
          <p className="text-sm">Sin productos agregados</p>
          <p className="text-xs">Haz clic en "Agregar producto" para comenzar</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          variant="outline"
          isVisibleColumnFilter={false}
        />
      )}
    </div>
  );
}
