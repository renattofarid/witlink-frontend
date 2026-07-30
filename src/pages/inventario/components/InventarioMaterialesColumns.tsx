import type { ColumnDef } from "@tanstack/react-table";
import { ButtonAction } from "@/components/ButtonAction";
import { Lock, Unlock } from "lucide-react";
import type { InventarioMaterialResource } from "../lib/inventario.interface";

interface ColumnActions {
  isCorporativo?: boolean;
  onReservarSot?: (row: InventarioMaterialResource) => void;
  onLiberarSot?: (row: InventarioMaterialResource) => void;
}

export const getInventarioMaterialesColumns = ({
  isCorporativo,
  onReservarSot,
  onLiberarSot,
}: ColumnActions = {}): ColumnDef<InventarioMaterialResource>[] => [
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
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.sot ?? "Sin SOT"}
      </span>
    ),
  },
  {
    accessorKey: "motivo",
    header: "Motivo",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) =>
      isCorporativo ? (
        <div className="flex gap-1">
          <ButtonAction
            icon={Lock}
            color="amber"
            tooltip="Reservar por SOT"
            canRender={!!onReservarSot}
            onClick={() => onReservarSot?.(row.original)}
          />
          <ButtonAction
            icon={Unlock}
            color="amber"
            tooltip="Liberar reserva"
            canRender={!!onLiberarSot}
            onClick={() => onLiberarSot?.(row.original)}
          />
        </div>
      ) : null,
  },
];
