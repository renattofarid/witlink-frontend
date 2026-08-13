import { ButtonAction } from "@/components/ButtonAction";
import { Badge } from "@/components/ui/badge";
import type { BadgeColor } from "@/components/ui/badge";
import { History, Trash2 } from "lucide-react";
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
  DEVUELTO_A_CLARO: "DEVUELTO A CLARO",
  INSTALADO: "INSTALADO"
} as const;

export type SituacionLabel = SerieResource["situacion_label"];

const SITUACION_COLOR: Record<SituacionLabel, BadgeColor> = {
  PENDIENTE: "yellow",
  DISPONIBLE: "green",
  DESPACHADO: "blue",
  LIQUIDADO: "emerald",
  RETIRADO: "gray",
  DEVUELTO: "orange",
  "DEVUELTO A CLARO": "indigo",
  INSTALADO : "amber"
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
  onHistorial: (row: SerieResource) => void;
}

export const getSerieColumns = ({
  onDelete,
  onHistorial,
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
    id: "antiguedad",
    header: "Antigüedad",
    cell: ({ row }) => {
      const dias = Math.max(0, row.original.dias_en_almacen ?? 0);
      let colorClass =
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/40";
      if (dias > 90) {
        colorClass =
          "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/40 font-bold";
      } else if (dias > 30) {
        colorClass =
          "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/40 font-semibold";
      }
      return (
        <Badge variant="outline" className={`text-xs ${colorClass}`}>
          {dias} {dias === 1 ? "día" : "días"}
        </Badge>
      );
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <ButtonAction
          icon={History}
          tooltip="Ver historial"
          canRender={true}
          onClick={() => onHistorial(row.original)}
        />
        <ButtonAction
          icon={Trash2}
          canRender={true}
          onClick={() => onDelete(row.original)}
        />
      </div>
    ),
  },
];
