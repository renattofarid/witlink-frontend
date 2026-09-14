import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Download, Eye, FileText, MessageSquare, Pencil, Sheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LiquidacionResource } from "../lib/liquidaciones.interface";
import {
  LIQUIDACION_ROUTE_VIEW,
  LIQUIDACION_ROUTE_EDIT,
} from "../lib/liquidaciones.constants";
import { ButtonAction } from "@/components/ButtonAction";
import { openGuiaRemisionPdf } from "../lib/liquidaciones.actions";

interface ColumnOptions {
  onExport?: (row: LiquidacionResource) => void;
  onGetActa?: (row: LiquidacionResource) => void;
  onEditObservacion?: (row: LiquidacionResource) => void;
  isCorporativo?: boolean;
}

export function getLiquidacionColumns(
  options: ColumnOptions = {},
): ColumnDef<LiquidacionResource>[] {
  const isCorporativo = options.isCorporativo === true;
  const columns: ColumnDef<LiquidacionResource>[] = [

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
      id: "almacen",
      header: "Almacén",
      cell: ({ row }) => (
        <span className="text-xs font-medium">
          {row.original.almacen?.nombre_display || row.original.almacen?.nombre || "—"}
        </span>
      ),
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const fecha = row.original.fecha;
        if (!fecha) return "—";
        const raw = fecha.includes("T") ? fecha : fecha + "T12:00:00";
        return new Date(raw).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      id: "tecnico",
      header: "Técnico",
      cell: ({ row }) => {
        const t1 = row.original.tecnico1;
        const t2 = row.original.tecnico2;

        const name1 =
          t1?.nombre_completo ||
          [t1?.nombre, t1?.apellido_paterno, t1?.apellido_materno]
            .filter(Boolean)
            .join(" ");

        const name2 =
          t2?.nombre_completo ||
          [t2?.nombre, t2?.apellido_paterno, t2?.apellido_materno]
            .filter(Boolean)
            .join(" ");

        if (!name1 && !name2)
          return <span className="text-muted-foreground text-xs">—</span>;

        return (
          <div className="flex flex-col text-xs max-w-44 truncate">
            {name1 && <span className="font-medium truncate">{name1}</span>}
            {name2 && <span className="text-muted-foreground truncate">{name2}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "tipo_trabajo",
      header: "Tipo trabajo",
      cell: ({ row }) => (
        <span className="text-xs">{row.original.tipo_trabajo || "—"}</span>
      ),
    },
    {
      accessorKey: "observaciones",
      header: "Observación / Comentario",
      cell: ({ row }) => {
        const obs = row.original.observaciones?.trim();
        if (!obs) return <span className="text-muted-foreground text-xs">—</span>;
        return (
          <div
            className="max-w-44 text-xs truncate font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200/60 dark:border-red-900/50"
            title={obs}
          >
            {obs}
          </div>
        );
      },
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
        const colorMap: Record<
          string,
          "green" | "yellow" | "red" | "blue" | "muted"
        > = {
          LIQUIDADA: "green",
          PENDIENTE: "yellow",
        };
        const upper = estado.toUpperCase();
        return (
          <Badge color={colorMap[upper] ?? "muted"} className="text-xs">
            {upper}
          </Badge>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <LiquidacionRowActions
          row={row.original}
          onExport={options.onExport}
          onGetActa={options.onGetActa}
          onEditObservacion={options.onEditObservacion}
        />
      ),
    },
  ];

  return columns.filter(
    (column) =>
      !(
        isCorporativo &&
        "accessorKey" in column &&
        column.accessorKey === "estado"
      ),
  );
}

function LiquidacionRowActions({
  row,
  onExport,
  onGetActa,
  onEditObservacion,
}: {
  row: LiquidacionResource;
  onExport?: (row: LiquidacionResource) => void;
  onGetActa?: (row: LiquidacionResource) => void;
  onEditObservacion?: (row: LiquidacionResource) => void;
}) {
  const navigate = useNavigate();
  const isLiquidada =
    (row.estado_liquidacion ?? "").toLowerCase() === "liquidada";
  const hasObs = Boolean(row.observaciones && row.observaciones.trim() !== "");

  return (
    <div className="flex gap-1">
      {onEditObservacion && (
        <ButtonAction
          icon={MessageSquare}
          color="red"
          variant={hasObs ? "secondary" : "outline"}
          className={cn(
            "text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:border-red-800 dark:text-red-400",
            hasObs &&
              "bg-red-100 text-red-700 font-semibold border-red-300 dark:bg-red-950 dark:text-red-300"
          )}
          tooltip={
            hasObs
              ? `Comentario: "${row.observaciones}" (Clic para editar)`
              : "Agregar comentario / observación"
          }
          onClick={() => onEditObservacion(row)}
        />
      )}
      <ButtonAction
        icon={Download}
        tooltip="Descargar guía de remisión"
        canRender={isLiquidada}
        onClick={() => openGuiaRemisionPdf(row.sot)}
      />
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
      {onGetActa && (
        <ButtonAction
          icon={FileText}
          tooltip="Obtener acta por SOT"
          onClick={() => onGetActa(row)}
        />
      )}
    </div>
  );
}
