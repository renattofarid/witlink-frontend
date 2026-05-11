import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { TrasladoListItem } from "../lib/traslado.interface";

export const getTrasladoListColumns = (): ColumnDef<TrasladoListItem>[] => [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.fecha;
      if (!fecha) return "-";
      const [y, m, d] = fecha.split("-");
      return `${d}/${m}/${y}`;
    },
  },
  {
    accessorKey: "codigo",
    header: "Código SAP",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.codigo}</span>
    ),
  },
  {
    accessorKey: "producto",
    header: "Producto",
  },
  {
    accessorKey: "tipo_producto",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipo_producto;
      return (
        <Badge variant={tipo === "EQUIPO" ? "default" : "outline"} className="text-xs">
          {tipo}
        </Badge>
      );
    },
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
  },
  {
    accessorKey: "serie",
    header: "Serie",
    cell: ({ row }) => row.original.serie ?? "-",
  },
  {
    accessorKey: "almacen_origen",
    header: "Origen",
  },
  {
    accessorKey: "almacen_destino",
    header: "Destino",
  },
  {
    accessorKey: "usuario",
    header: "Usuario",
    cell: ({ row }) => (
      <span className="text-xs capitalize">{row.original.usuario}</span>
    ),
  },
];
