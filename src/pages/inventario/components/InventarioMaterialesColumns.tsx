import type { ColumnDef } from "@tanstack/react-table";
import { ButtonAction } from "@/components/ButtonAction";
import { Undo2 } from "lucide-react";
import type { InventarioMaterialResource } from "../lib/inventario.interface";

interface ColumnActions {
  onDevolver: (row: InventarioMaterialResource) => void;
}

export const getInventarioMaterialesColumns = ({ onDevolver }: ColumnActions): ColumnDef<InventarioMaterialResource>[] => [
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    accessorKey: "sap",
    header: "SAP",
  },
  {
    accessorKey: "producto",
    header: "Producto",
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
  },
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
  },
  {
    accessorKey: "personal",
    header: "Personal",
  },
  {
    accessorKey: "sot",
    header: "SOT",
  },
  {
    accessorKey: "motivo",
    header: "Motivo",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <ButtonAction
        icon={Undo2}
        color="red"
        tooltip="Devolver material"
        canRender
        onClick={() => onDevolver(row.original)}
      />
    ),
  },
];
