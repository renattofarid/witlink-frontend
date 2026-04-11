import type { ColumnDef } from "@tanstack/react-table";
import type { InventarioSerieResource } from "../lib/inventario.interface";

export const getInventarioSeriesColumns = (): ColumnDef<InventarioSerieResource>[] => [
  {
    accessorKey: "fecha",
    header: "Fecha",
  },
  {
    accessorKey: "guia",
    header: "Guía",
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
    accessorKey: "serie",
    header: "Serie",
  },
  {
    accessorKey: "mac",
    header: "MAC",
  },
  {
    accessorKey: "emta",
    header: "EMTA",
  },
  {
    accessorKey: "ua",
    header: "UA",
  },
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
  },
  {
    accessorKey: "dias",
    header: "Días",
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
