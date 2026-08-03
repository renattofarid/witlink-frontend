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
  ...(isCorporativo
    ? [
        {
          id: "cantidad_reservada",
          header: "Reservada",
          cell: ({ row }) => {
            const reservada = Number(row.original.cantidad_reservada ?? 0);
            return reservada > 0 ? (
              <span className="text-xs font-medium text-amber-600">
                {reservada}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">0</span>
            );
          },
        } satisfies ColumnDef<InventarioMaterialResource>,
      ]
    : []),
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
  },
  {
    accessorKey: "personal",
    header: "Personal",
  },
  {
    accessorKey: "motivo",
    header: "Motivo",
  },
  ...(onReservarSot || onLiberarSot
    ? [
        {
          id: "acciones",
          header: "Acciones",
          cell: ({ row }) => {
            const reservada = Number(row.original.cantidad_reservada ?? 0);
            return isCorporativo ? (
              <div className="flex gap-1">
                <ButtonAction
                  icon={Lock}
                  color="amber"
                  tooltip="Reservar por SOT"
                  canRender={!!onReservarSot && reservada <= 0}
                  onClick={() => onReservarSot?.(row.original)}
                />
                <ButtonAction
                  icon={Unlock}
                  color="amber"
                  tooltip="Liberar reserva"
                  canRender={!!onLiberarSot && reservada > 0}
                  onClick={() => onLiberarSot?.(row.original)}
                />
              </div>
            ) : null;
          },
        } satisfies ColumnDef<InventarioMaterialResource>,
      ]
    : []),
];
