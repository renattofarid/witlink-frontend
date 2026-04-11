import { ButtonAction } from "@/components/ButtonAction";
import { Pencil, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductoResource } from "../lib/producto.interface";
import { Badge } from "@/components/ui/badge";
import { BoolCell } from "./BoolCell";

interface ColumnActions {
  onEdit: (row: ProductoResource) => void;
  onDelete: (row: ProductoResource) => void;
  onRestore: (row: ProductoResource) => void;
  onToggle: (
    item: ProductoResource,
    field: "necesita_serie" | "necesita_mac" | "necesita_emta_mac" | "necesita_ua",
    value: boolean
  ) => void;
}

export const getProductoColumns = ({
  onEdit,
  onDelete,
  // onRestore,
  onToggle,
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
    cell: ({ row }) => {
      const item = row.original;
      return (
        <BoolCell
          value={item.necesita_serie}
          onCheckedChange={(v) => onToggle(item, "necesita_serie", v)}
        />
      );
    },
  },
  {
    id: "necesita_mac",
    header: "MAC",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <BoolCell
          value={item.necesita_mac}
          onCheckedChange={(v) => onToggle(item, "necesita_mac", v)}
        />
      );
    },
  },
  {
    id: "necesita_emta_mac",
    header: "EMTA MAC",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <BoolCell
          value={item.necesita_emta_mac}
          onCheckedChange={(v) => onToggle(item, "necesita_emta_mac", v)}
        />
      );
    },
  },
  {
    id: "necesita_ua",
    header: "UA",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <BoolCell
          value={item.necesita_ua}
          onCheckedChange={(v) => onToggle(item, "necesita_ua", v)}
        />
      );
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      // const isDeleted = !!item.deleted_at;
      return (
        <div className="flex gap-1">
          <ButtonAction
            icon={Pencil}
            // canRender={!isDeleted}
            onClick={() => onEdit(item)}
          />
          <ButtonAction
            icon={Trash2}
            // canRender={!isDeleted}
            onClick={() => onDelete(item)}
          />
          {/* <ButtonAction
            icon={RotateCcw}
            canRender={isDeleted}
            onClick={() => onRestore(item)}
          /> */}
        </div>
      );
    },
  },
];
