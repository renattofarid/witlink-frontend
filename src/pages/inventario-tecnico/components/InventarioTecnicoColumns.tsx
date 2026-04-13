import type { ColumnDef } from "@tanstack/react-table";
import { ButtonAction } from "@/components/ButtonAction";
import { Undo2 } from "lucide-react";
import type { InventarioTecnicoResource } from "../lib/inventario-tecnico.interface";

const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// --- Columnas para la tabla de MATERIALES ---

interface MaterialColumnActions {
  onDevolverMaterial: (row: InventarioTecnicoResource) => void;
}

export const getMaterialColumns = ({
  onDevolverMaterial,
}: MaterialColumnActions): ColumnDef<InventarioTecnicoResource>[] => [
  {
    accessorKey: "producto",
    header: "Producto",
  },
  {
    accessorKey: "sap",
    header: "SAP",
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => row.original.cantidad ?? "—",
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => (row.original.fecha ? formatFecha(row.original.fecha) : "—"),
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
        onClick={() => onDevolverMaterial(row.original)}
      />
    ),
  },
];

// --- Columnas para la tabla de SERIES ---

interface SerieColumnActions {
  onDevolverSerie: (row: InventarioTecnicoResource) => void;
}

export const getSerieColumns = ({
  onDevolverSerie,
}: SerieColumnActions): ColumnDef<InventarioTecnicoResource>[] => [
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
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => (row.original.fecha ? formatFecha(row.original.fecha) : "—"),
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <ButtonAction
        icon={Undo2}
        color="red"
        tooltip="Devolver serie"
        canRender
        onClick={() => onDevolverSerie(row.original)}
      />
    ),
  },
];
