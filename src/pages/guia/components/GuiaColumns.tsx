import { ButtonAction } from "@/components/ButtonAction";
import {
  Pencil,
  Trash2,
  RotateCcw,
  FileText,
  Eye,
  CheckCircle,
  Sheet,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { GuiaListResource } from "../lib/guia.interface";
import { openPdf, exportGuiaExcel } from "../lib/guia.actions";
import { Button } from "@/components/ui/button";
import { parse } from "date-fns";

interface ColumnActions {
  onView: (row: GuiaListResource) => void;
  onViewRetirado: (row: GuiaListResource) => void;
  onEdit: (row: GuiaListResource) => void;
  onEditRetirado: (row: GuiaListResource) => void;
  onDelete: (row: GuiaListResource) => void;
  onRestore: (row: GuiaListResource) => void;
  onConfirm: (row: GuiaListResource) => void;
  canConfirm: boolean;
}

function formatFechaConHora(raw: string | null | undefined) {
  if (!raw) return { dateStr: "-", timeStr: null };

  const normalized = raw.replace(" ", "T");
  const d = new Date(normalized);

  if (isNaN(d.getTime())) {
    return { dateStr: raw, timeStr: null };
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const hasTimeComponent = raw.includes(" ") || raw.includes("T");
  let timeStr: string | null = null;

  if (hasTimeComponent) {
    timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  return { dateStr, timeStr };
}

export const getGuiaColumns = ({
  onView,
  onViewRetirado,
  onEdit,
  onEditRetirado,
  onDelete,
  onRestore,
  onConfirm,
  canConfirm,
}: ColumnActions): ColumnDef<GuiaListResource>[] => [
  {
    id: "tipo",
    header: "Tipo",
    cell: ({ row }) =>
      row.original.type === "retirado" ? (
        <Badge variant="ghost" color="amber">
          Retirado
        </Badge>
      ) : (
        <Badge variant="ghost" color="blue">
          Guía
        </Badge>
      ),
  },
  {
    id: "numero_sot",
    header: "N° / SOT",
    cell: ({ row }) => {
      const { type, numero, sot } = row.original;
      if (type === "retirado")
        return <span className="text-xs tabular-nums">{sot ?? "-"}</span>;
      return <span className="font-medium text-xs">{numero || "-"}</span>;
    },
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const { dateStr, timeStr } = formatFechaConHora(row.original.fecha);
      if (dateStr === "-") return "-";

      return (
        <div className="flex flex-col text-xs leading-tight font-mono">
          <span className="font-semibold text-foreground">{dateStr}</span>
          {timeStr && (
            <span className="text-[11px] text-muted-foreground">{timeStr}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "almacen",
    header: "Almacén",
    cell: ({ row }) => row.original.almacen ?? "-",
  },
  {
    accessorKey: "motivo",
    header: "Motivo",
    cell: ({ row }) => row.original.motivo ?? "-",
  },
  {
    accessorKey: "usuario",
    header: "Usuario",
    cell: ({ row }) => row.original.usuario,
  },
  {
    id: "cantidades",
    header: "Mat. | Series",
    cell: ({ row }) => (
      <span className="text-xs tabular-nums">
        {row.original.cantidad_materiales} | {row.original.cantidad_series}
      </span>
    ),
  },
  {
    id: "pdf",
    header: "PDF",
    cell: ({ row }) => {
      const url = row.original.ruta_pdf_guia;
      if (!url) return <span className="text-muted-foreground text-xs">-</span>;
      return (
        <Button size="xs" onClick={() => openPdf(url)}>
          <FileText className="size-3.5" />
          <span className="text-xs">Ver</span>
        </Button>
      );
    },
  },
  {
    id: "confirmado",
    header: "Estado",
    cell: ({ row }) => {
      if (row.original.type === "retirado") return null;
      return row.original.confirmado ? (
        <Badge
          variant="default"
          className="text-xs bg-green-600 hover:bg-green-700"
        >
          Confirmado
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs">
          Pendiente
        </Badge>
      );
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
      const isDeleted = !!item.deleted_at;
      const isRetirado = item.type === "retirado";


      return (
        <div className="flex gap-1">
          <ButtonAction
            icon={Eye}
            canRender={!isDeleted && !isRetirado}
            onClick={() => onView(item)}
          />
          <ButtonAction
            icon={Eye}
            canRender={!isDeleted && isRetirado}
            onClick={() => onViewRetirado(item)}
          />
          <ButtonAction
            icon={Pencil}
            canRender={!isDeleted && !isRetirado}
            onClick={() => onEdit(item)}
          />
          <ButtonAction
            icon={Pencil}
            canRender={!isDeleted && isRetirado}
            onClick={() => onEditRetirado(item)}
          />
          <ButtonAction
            icon={CheckCircle}
            canRender={canConfirm && !isDeleted && !isRetirado && !item.confirmado}
            onClick={() => onConfirm(item)}
          />
          <ButtonAction
            icon={Sheet}
            canRender={!isDeleted && !isRetirado}
            onClick={() => exportGuiaExcel(item.id)}
          />
          <ButtonAction
            icon={Trash2}
            canRender={!isDeleted}
            onClick={() => onDelete(item)}
          />
          <ButtonAction
            icon={RotateCcw}
            canRender={isDeleted}
            onClick={() => onRestore(item)}
          />
        </div>
      );
    },
  },
];
