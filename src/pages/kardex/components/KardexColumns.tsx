import type { ColumnDef } from "@tanstack/react-table";
import type { KardexResource } from "../lib/kardex.interface";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const movimientoBadgeColor: Record<string, BadgeColor> = {
  INGRESO: "green",
  "INGRESO PENDIENTE": "amber",
  "INGRESO CONFIRMADO": "green",
  SALIDA: "red",
  DESPACHADO: "red",
  DEVOLUCION: "blue",
  LIQUIDADO: "yellow",
  LIQUIDACION_INSTALADO: "yellow",
  RETIRADO: "gray",
  TRASLADO: "purple",
  DEVUELTO: "blue",
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
      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    accessorKey: "codigo",
    header: "SAP",
  },
  {
    accessorKey: "origen",
    header: "Origen",
    cell: ({ getValue }) => {
      const origen = String(getValue() ?? "");
      return <span className="uppercase">{origen}</span>;
    },
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
        <Badge variant="default" color={movimientoBadgeColor[mov] ?? "default"}>
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
        <span
          className={cn(
            "font-medium",
            cantidad < 0 ? "text-red-600" : "text-green-600",
          )}
        >
          {cantidad > 0 ? `+${cantidad}` : cantidad}
        </span>
      );
    },
  },
  {
    accessorKey: "stock_anterior",
    header: "Stock Anterior",
  },
  {
    accessorKey: "stock_actual",
    header: "Stock Actual",
  },
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
    cell: ({ getValue }) => {
      const ubicacion = getValue() as string;
      return <span className="uppercase">{ubicacion}</span>;
    },
  },
  {
    accessorKey: "serie",
    header: "Serie",
  },
  {
    accessorKey: "pedido",
    header: "Pedido",
  },
];
