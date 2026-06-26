import { ButtonAction } from "@/components/ButtonAction";
import { Badge } from "@/components/ui/badge";
import type { BadgeColor } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SerieResource } from "../lib/serie.interface";

// Valores conocidos del backend — agregar aquí cuando la API incluya nuevas situaciones
export const SITUACION = {
  PENDIENTE: "PENDIENTE",
  DISPONIBLE: "DISPONIBLE",
  DESPACHADO: "DESPACHADO",
  LIQUIDADO: "LIQUIDADO",
  RETIRADO: "RETIRADO",
  DEVUELTO: "DEVUELTO",
} as const;

export type SituacionLabel = SerieResource["situacion_label"];

const SITUACION_COLOR: Record<SituacionLabel, BadgeColor> = {
  PENDIENTE: "yellow",
  DISPONIBLE: "green",
  DESPACHADO: "blue",
  LIQUIDADO: "emerald",
  RETIRADO: "gray",
  DEVUELTO: "orange",
};

function getSituacionColor(situacion: string): BadgeColor {
  return (SITUACION_COLOR as Record<string, BadgeColor>)[situacion] ?? "muted";
}

export function SituacionBadge({ situacion }: { situacion: string }) {
  return (
    <Badge color={getSituacionColor(situacion)} variant="default">
      {situacion}
    </Badge>
  );
}

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
    accessorKey: "guia_numero",
    header: "Número de Guía",
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
    id: "situacion_label",
    header: "Situación",
    cell: ({ row }) => (
      <SituacionBadge situacion={row.original.situacion_label} />
    ),
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
