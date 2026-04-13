import type { ColumnDef } from "@tanstack/react-table";
import type { KardexResource } from "../lib/kardex.interface";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const movimientoBadgeColor: Record<string, string> = {
  INGRESO: "bg-green-100 text-green-800 border-green-200",
  SALIDA: "bg-red-100 text-red-800 border-red-200",
  DEVOLUCION: "bg-blue-100 text-blue-800 border-blue-200",
  LIQUIDACION_INSTALADO: "bg-yellow-100 text-yellow-800 border-yellow-200",
  RETIRADO: "bg-gray-100 text-gray-800 border-gray-200",
};

export const getKardexColumns = (): ColumnDef<KardexResource>[] => [
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    accessorKey: "codigo",
    header: "SAP",
  },
  {
    accessorKey: "producto",
    header: "Producto",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
  },
  {
    accessorKey: "movimiento",
    header: "Movimiento",
    cell: ({ row }) => {
      const mov = row.original.movimiento;
      return (
        <Badge
          variant="outline"
          className={cn("text-xs", movimientoBadgeColor[mov] ?? "")}
        >
          {mov}
        </Badge>
      );
    },
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => {
      const cantidad = row.original.cantidad;
      return (
        <span className={cn("font-medium", cantidad < 0 ? "text-red-600" : "text-green-600")}>
          {cantidad > 0 ? `+${cantidad}` : cantidad}
        </span>
      );
    },
  },
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
  },
  {
    accessorKey: "serie",
    header: "Serie",
  },
];
