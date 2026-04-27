import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Sheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";
import {
  LIQUIDACION_ROUTE_VIEW,
  LIQUIDACION_ROUTE_EDIT,
} from "../lib/liquidaciones.constants";
import { ButtonAction } from "@/components/ButtonAction";

interface ColumnOptions {
  onExport?: (row: LiquidacionResource) => void;
}

export function getLiquidacionColumns(
  options: ColumnOptions = {},
): ColumnDef<LiquidacionResource>[] {
  return [
    {
      accessorKey: "sot",
      header: "SOT",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-sm">
          {row.original.sot}
        </span>
      ),
    },
    {
      accessorKey: "nombre",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.original.nombre || "—"}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.codigo}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) =>
        row.original.fecha
          ? new Date(row.original.fecha + "T12:00:00").toLocaleDateString(
              "es-PE",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              },
            )
          : "—",
    },
    {
      accessorKey: "tipo_trabajo",
      header: "Tipo trabajo",
      cell: ({ row }) => (
        <span className="text-xs">{row.original.tipo_trabajo || "—"}</span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.estado;
        const colorMap: Record<
          string,
          "green" | "yellow" | "red" | "blue" | "muted"
        > = {
          ATENDIDA: "green",
          "P. VALIDAR": "yellow",
          RECHAZADO: "red",
          REPROGRAMADO: "blue",
        };
        return (
          <Badge color={colorMap[estado] ?? "muted"} className="text-xs">
            {estado || "—"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "estado_liquidacion",
      header: "Liq. estado",
      cell: ({ row }) => {
        const estado = row.original.estado_liquidacion;
        if (!estado)
          return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <Badge color="blue" variant="outline" className="text-xs">
            {estado}
          </Badge>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <LiquidacionRowActions row={row.original} onExport={options.onExport} />
      ),
    },
  ];
}

function LiquidacionRowActions({
  row,
  onExport,
}: {
  row: LiquidacionResource;
  onExport?: (row: LiquidacionResource) => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex gap-1">
      <ButtonAction
        icon={Eye}
        tooltip="Ver detalle"
        onClick={() => navigate(`${LIQUIDACION_ROUTE_VIEW}/${row.sot}`)}
      />
      <ButtonAction
        icon={Pencil}
        tooltip="Editar"
        onClick={() => navigate(`${LIQUIDACION_ROUTE_EDIT}/${row.sot}`)}
      />
      {onExport && (
        <ButtonAction
          icon={Sheet}
          tooltip="Exportar Excel"
          onClick={() => onExport(row)}
        />
      )}
    </div>
  );
}
