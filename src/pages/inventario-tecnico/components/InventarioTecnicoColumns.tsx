import type { ColumnDef } from "@tanstack/react-table";
import { ButtonAction } from "@/components/ButtonAction";
import { Undo2 } from "lucide-react";
import type { InventarioTecnicoResource } from "../lib/inventario-tecnico.interface";

interface ColumnActions {
  onDevolverMaterial: (row: InventarioTecnicoResource) => void;
  onDevolverSerie: (row: InventarioTecnicoResource) => void;
}

export const getInventarioTecnicoColumns = ({
  onDevolverMaterial,
  onDevolverSerie,
}: ColumnActions): ColumnDef<InventarioTecnicoResource>[] => [
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.tipo}</span>
    ),
  },
  {
    accessorKey: "producto",
    header: "Producto",
  },
  {
    accessorKey: "sap",
    header: "SAP",
  },
  {
    accessorKey: "serie",
    header: "Serie",
    cell: ({ row }) => row.original.serie ?? "—",
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) =>
      row.original.cantidad != null ? row.original.cantidad : "—",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      const isMaterial = item.tipo === "material";
      const isSerie = item.tipo === "serie";
      return (
        <div className="flex gap-1">
          <ButtonAction
            icon={Undo2}
            color="warning"
            tooltip="Devolver material"
            canRender={isMaterial}
            onClick={() => onDevolverMaterial(item)}
          />
          <ButtonAction
            icon={Undo2}
            color="warning"
            tooltip="Devolver serie"
            canRender={isSerie}
            onClick={() => onDevolverSerie(item)}
          />
        </div>
      );
    },
  },
];
