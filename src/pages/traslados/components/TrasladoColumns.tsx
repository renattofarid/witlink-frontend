import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { TrasladoListItem } from "../lib/traslado.interface";

interface ColumnActions {
  onConfirmar: (item: TrasladoListItem) => void;
  almacen_id: number | null;
}

function formatISODate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

export const getTrasladoListColumns = (
  actions?: ColumnActions,
): ColumnDef<TrasladoListItem>[] => [
  {
    accessorKey: "numero",
    header: "Nro.",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold">{row.original.numero}</span>
    ),
  },
  {
    id: "fecha_envio",
    header: "Fecha envío",
    cell: ({ row }) => formatISODate(row.original["fecha_envío"]),
  },
  {
    id: "almacenes",
    header: "Almacenes",
    cell: ({ row }) => {
      const { almacen_origen, almacen_destino } = row.original;
      return (
        <div className="flex items-center gap-1 text-xs">
          <span>{almacen_origen}</span>
          <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
          <span>{almacen_destino}</span>
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
            <div key={p.id} className="flex items-start gap-1.5">
              <Badge
                variant={p.tipo === "EQUIPO" ? "default" : "outline"}
                className="text-[10px] px-1.5 py-0 h-4 shrink-0"
              >
                {p.tipo}
              </Badge>
              <div className="flex flex-col">
                <span className="text-xs leading-tight">{p.producto}</span>
                {p.series.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {p.series.join(", ")}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                ×{p.cantidad}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "cantidades",
    header: "Cant.",
    cell: ({ row }) => {
      const { cantidad_series, cantidad_materiales } = row.original;
      return (
        <div className="flex flex-col gap-0.5 text-xs">
          {cantidad_series > 0 && (
            <span>{cantidad_series} serie{cantidad_series !== 1 ? "s" : ""}</span>
          )}
          {cantidad_materiales > 0 && (
            <span>{cantidad_materiales} material{cantidad_materiales !== 1 ? "es" : ""}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "confirmado",
    header: "Estado",
    cell: ({ row }) => {
      const { confirmado, usuario_confirmo } = row.original;
      const fechaConf = row.original["fecha_confirmación"];
      if (confirmado) {
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant="default" className="text-xs w-fit bg-green-600 hover:bg-green-600">
              Confirmado
            </Badge>
            {usuario_confirmo && (
              <span className="text-xs text-muted-foreground capitalize">{usuario_confirmo}</span>
            )}
            {fechaConf && (
              <span className="text-xs text-muted-foreground">{formatISODate(fechaConf)}</span>
            )}
          </div>
        );
      }
      return (
        <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400">
          Pendiente
        </Badge>
      );
    },
  },
  {
    accessorKey: "usuario",
    header: "Enviado por",
    cell: ({ row }) => (
      <span className="text-xs capitalize">{row.original.usuario}</span>
    ),
  },
  {
    id: "acciones",
    cell: ({ row }) => {
      const item = row.original;
      const canConfirm =
        !item.confirmado &&
        actions?.almacen_id !== null &&
        item.almacen_destino_id === actions?.almacen_id;

      if (!canConfirm) return null;

      return (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs text-green-700 border-green-400 hover:bg-green-50"
          onClick={() => actions!.onConfirmar(item)}
        >
          <CheckCircle2 className="size-3.5" />
          Confirmar
        </Button>
      );
    },
  },
];
