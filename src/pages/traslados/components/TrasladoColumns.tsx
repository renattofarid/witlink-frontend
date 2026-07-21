import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";
import type { TrasladoListItem } from "../lib/traslado.interface";

interface ColumnActions {
  onConfirmar: (item: TrasladoListItem) => void;
  onAnular: (item: TrasladoListItem) => void;
  almacen_id: number | null;
}

function formatISODate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

function abbreviateName(full: string): string {
  const parts = full.trim().split(" ");
  if (parts.length <= 2) return full;
  return `${parts[0]} ${parts[1]}`;
}

export const getTrasladoListColumns = (
  actions?: ColumnActions,
): ColumnDef<TrasladoListItem>[] => [
  {
    accessorKey: "numero",
    header: "Nro.",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono  font-semibold">{row.original.numero}</span>
    ),
  },
  {
    id: "fecha_envio",
    header: "Fecha envío",
    size: 100,
    cell: ({ row }) => (
      <span className="">{formatISODate(row.original["fecha_envío"])}</span>
    ),
  },
  {
    id: "almacenes",
    header: "Origen → Destino",
    size: 180,
    cell: ({ row }) => {
      const { almacen_origen, almacen_destino } = row.original;
      return (
        <div className="flex items-center gap-1 ">
          <span className="truncate max-w-17.5">{almacen_origen}</span>
          <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate max-w-17.5">{almacen_destino}</span>
        </div>
      );
    },
  },
  {
    id: "productos",
    header: "Productos",
    cell: ({ row }) => {
      const { productos } = row.original;
      return (
        <div className="flex flex-col gap-1">
          {productos.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <Badge
                variant={p.tipo === "EQUIPO" ? "default" : "outline"}
                className="text-[10px] px-1.5 py-0 h-4 shrink-0"
              >
                {p.tipo}
              </Badge>
              <span className=" leading-tight line-clamp-1">{p.producto}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "cantidad",
    header: "Cant.",
    size: 100,
    cell: ({ row }) => {
      const { cantidad_series, cantidad_materiales } = row.original;
      const parts: string[] = [];
      if (cantidad_series > 0)
        parts.push(
          `${cantidad_series} serie${cantidad_series !== 1 ? "s" : ""}`,
        );
      if (cantidad_materiales > 0) parts.push(`${cantidad_materiales} mat.`);
      return (
        <span className=" text-muted-foreground whitespace-nowrap">
          {parts.join(" · ") || "-"}
        </span>
      );
    },
  },
  {
    id: "estado",
    header: "Estado",
    size: 140,
    cell: ({ row }) => {
      const { confirmado, anulado, usuario_confirmo, usuario_anula } =
        row.original;
      const fechaConf = row.original["fecha_confirmación"];
      const fechaAnul = row.original.fecha_anulacion;

      if (anulado) {
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant="default" color="red" className="w-fit">
              Anulado
            </Badge>
            {(usuario_anula || fechaAnul) && (
              <span className="text-[10px] text-muted-foreground leading-tight">
                {usuario_anula && (
                  <span className="capitalize">
                    {abbreviateName(usuario_anula)}
                  </span>
                )}
                {usuario_anula && fechaAnul && " · "}
                {fechaAnul && formatISODate(fechaAnul)}
              </span>
            )}
          </div>
        );
      }
      if (confirmado) {
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant="default" color="green" className="w-fit">
              Confirmado
            </Badge>
            {(usuario_confirmo || fechaConf) && (
              <span className="text-[10px] text-muted-foreground leading-tight">
                {usuario_confirmo && (
                  <span className="capitalize">
                    {abbreviateName(usuario_confirmo)}
                  </span>
                )}
                {usuario_confirmo && fechaConf && " · "}
                {fechaConf && formatISODate(fechaConf)}
              </span>
            )}
          </div>
        );
      }
      return (
        <Badge variant="default" color="amber">
          Pendiente
        </Badge>
      );
    },
  },
  {
    accessorKey: "usuario",
    header: "Enviado por",
    size: 140,
    cell: ({ row }) => (
      <span className=" capitalize">{row.original.usuario}</span>
    ),
  },
  {
    id: "acciones",
    size: 140,
    cell: ({ row }) => {
      const item = row.original;
      const isDestino =
        actions?.almacen_id !== null &&
        item.almacen_destino_id === actions?.almacen_id;
      const isPendiente = !item.confirmado && !item.anulado;
      const canConfirm = isPendiente && isDestino;
      const canAnular = isPendiente && isDestino;

      return (
        <div className="flex items-center gap-1">
          <ExportButtons
            pdfEndpoint={`/traslados/${item.id}/pdf`}
            pdfFileName={`traslado-${item.numero ?? item.id}.pdf`}
            variant="separate"
          />
          {canConfirm && (
            <Button
              size="sm"
              variant="secondary"
              color="green"
              tooltip="Confirmar traslado"
              onClick={() => actions!.onConfirmar(item)}
            >
              <CheckCircle2 className="size-3.5" />
            </Button>
          )}
          {canAnular && (
            <Button
              size="sm"
              variant="secondary"
              color="red"
              tooltip="Anular traslado"
              onClick={() => actions!.onAnular(item)}
            >
              <XCircle className="size-3.5" />
            </Button>
          )}
        </div>
      );
    },
  },
];
