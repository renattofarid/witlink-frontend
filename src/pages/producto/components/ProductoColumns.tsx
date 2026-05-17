import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductoResource } from "../lib/producto.interface";
import { Badge } from "@/components/ui/badge";
import { BoolCell } from "./BoolCell";

interface ColumnActions {
  onEdit: (row: ProductoResource) => void;
  onDelete: (row: ProductoResource) => void;
}

export const getProductoColumns = ({
  onEdit,
  onDelete,
}: ColumnActions): ColumnDef<ProductoResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "sap",
    header: "SAP",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ getValue }) => {
      const tipo = getValue() as string;
      return <Badge className="uppercase">{tipo}</Badge>;
    },
  },
  {
    accessorKey: "origen",
    header: "Origen",
    cell: ({ getValue }) => {
      const origen = getValue() as string;
      return (
        <Badge
          color={origen === "Witlink" ? "teal" : "red"}
          className="uppercase"
        >
          {origen}
        </Badge>
      );
    },
  },
  {
    id: "categoria",
    header: "Categoría",
    cell: ({ row }) => row.original.categoria?.nombre ?? "-",
  },
  {
    id: "necesita_serie",
    header: "Serie",
    cell: ({ row }) => <BoolCell value={row.original.necesita_serie} />,
  },
  {
    id: "necesita_mac",
    header: "MAC",
    cell: ({ row }) => <BoolCell value={row.original.necesita_mac} />,
  },
  {
    id: "necesita_emta_mac",
    header: "EMTA MAC",
    cell: ({ row }) => <BoolCell value={row.original.necesita_emta_mac} />,
  },
  {
    id: "necesita_ua",
    header: "UA",
    cell: ({ row }) => <BoolCell value={row.original.necesita_ua} />,
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <ButtonAction icon={Pencil} onClick={() => onEdit(row.original)} />
        <ButtonAction icon={Trash2} onClick={() => onDelete(row.original)} />
      </div>
    ),
  },
];
