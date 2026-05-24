import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, PackagePlus, Save, Package } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Package className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
              Detalle
            </p>
            <div className="flex items-center gap-2 leading-none">
              <p className="text-sm font-semibold text-foreground">
                Liquidación
              </p>
              {items.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 rounded-full"
                >
                  {items.length} {items.length === 1 ? "ítem" : "ítems"}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onAddProducts}
          >
            <PackagePlus className="size-3.5" />
            Agregar producto
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={onSave}
            disabled={isSaving || items.length === 0}
          >
            <Save className="size-3.5" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
          <div className="size-14 rounded-full bg-muted flex items-center justify-center">
            <PackagePlus className="size-6 opacity-40" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground/80">
              Sin productos agregados
            </p>
            <p className="text-xs">
              Agrega productos para registrar el detalle de la liquidación
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 mt-1"
            onClick={onAddProducts}
          >
            <PackagePlus className="size-3.5" />
            Agregar primer producto
          </Button>
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
