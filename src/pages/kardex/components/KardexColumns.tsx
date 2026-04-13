import type { ColumnDef } from "@tanstack/react-table";
import type { KardexResource } from "../lib/kardex.interface";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const movimientoBadgeColor: Record<string, BadgeColor> = {
  INGRESO: "green",
  SALIDA: "red",
  DEVOLUCION: "blue",
  LIQUIDACION_INSTALADO: "yellow",
  RETIRADO: "gray",
};

export const getKardexColumns = (): ColumnDef<KardexResource>[] => [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const raw = row.original.fecha;
      if (!raw) return null;
      // Replace hyphens with slashes so JS parses it as local time, not UTC
      const date = new Date(raw.replace(/-/g, "/"));
      return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
    },
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
          variant="default"
          color={movimientoBadgeColor[mov] ?? "default"}
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
