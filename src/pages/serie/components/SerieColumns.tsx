import { ButtonAction } from "@/components/ButtonAction";
import { Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SerieResource } from "../lib/serie.interface";

interface ColumnActions {
  onDelete: (row: SerieResource) => void;
}

export const getSerieColumns = ({
  onDelete,
}: ColumnActions): ColumnDef<SerieResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "serie",
    header: "Serie",
  },
  {
    accessorKey: "mac",
    header: "MAC",
  },
  {
    accessorKey: "emta_mac",
    header: "EMTA MAC",
  },
  {
    accessorKey: "ua",
    header: "UA",
  },
  {
    accessorKey: "situacion",
    header: "Situación",
  },
  {
    id: "producto",
    header: "Producto",
    cell: ({ row }) => row.original.producto?.nombre ?? "-",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <ButtonAction
          icon={Trash2}
          canRender={true}
          onClick={() => onDelete(row.original)}
        />
      </div>
    ),
  },
];
