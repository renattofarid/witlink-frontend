import type { ColumnDef } from "@tanstack/react-table";
import type { InventarioMaterialResource } from "../lib/inventario.interface";

export const getInventarioMaterialesColumns =
  (): ColumnDef<InventarioMaterialResource>[] => [
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
  ];
