import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { TrasladoResource } from "../lib/traslado.interface";

export const getTrasladoColumns = (): ColumnDef<TrasladoResource>[] => [
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
    accessorKey: "guia",
    header: "Guía",
    cell: ({ row }) => row.original.guia ?? "-",
  },
  {
    accessorKey: "tipo_movimiento",
    header: "Tipo Movimiento",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-medium">
        {row.original.tipo_movimiento}
      </Badge>
    ),
  },
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
  },
  {
    accessorKey: "origen",
    header: "Origen",
    cell: ({ row }) => row.original.origen ?? "-",
  },
  {
    accessorKey: "destino",
    header: "Destino",
  },
  {
    accessorKey: "registro",
    header: "Registro",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.registro}
      </span>
    ),
  },
  {
    accessorKey: "usuario",
    header: "Usuario",
    cell: ({ row }) => (
      <span className="text-xs capitalize">{row.original.usuario}</span>
    ),
  },
];
