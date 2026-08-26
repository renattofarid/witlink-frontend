import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  Layers,
  Minus,
  Warehouse,
  Wrench,
} from "lucide-react";
import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardQuery } from "../lib/home.hook";
import type { MovimientoReciente } from "../lib/home.interface";

const MOVIMIENTO_COLORS: Record<string, BadgeColor> = {
  INGRESO: "green",
  "INGRESO PENDIENTE": "amber",
  "INGRESO CONFIRMADO": "green",
  SALIDA: "red",
  TRASLADO: "blue",
  DESPACHADO: "green",
  LIQUIDADO: "purple",
  RETIRADO: "red",
  DEVOLUCION: "teal",
};

const TIPO_COLORS: Record<string, BadgeColor> = {
  EQUIPO: "purple",
  MATERIAL: "teal",
};

const CARD_COLORS = {
  blue: { bg: "bg-blue-500", icon: "bg-blue-600", text: "text-blue-100" },
  orange: {
    bg: "bg-orange-500",
    icon: "bg-orange-600",
    text: "text-orange-100",
  },
  green: {
    bg: "bg-emerald-500",
    icon: "bg-emerald-600",
    text: "text-emerald-100",
  },
  violet: {
    bg: "bg-violet-500",
    icon: "bg-violet-600",
    text: "text-violet-100",
  },
  red: { bg: "bg-rose-500", icon: "bg-rose-600", text: "text-rose-100" },
} as const;

type CardColor = keyof typeof CARD_COLORS;

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  color,
}: {
  title: string;
  value: number | string | undefined;
  icon: LucideIcon;
  isLoading: boolean;
  color: CardColor;
}) {
  const c = CARD_COLORS[color];
  return (
    <div
      className={`${c.bg} rounded-xl p-4 text-white shadow-md flex flex-col gap-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium ${c.text} leading-tight`}>{title}</p>
        <div className={`${c.icon} rounded-lg p-1.5 shrink-0`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      {isLoading ? (
        <div className="h-8 w-20 animate-pulse rounded bg-white/30" />
      ) : (
        <p className="text-3xl font-bold tracking-tight">
          {value !== undefined ? Number(value).toLocaleString("es-PE") : "—"}
        </p>
      )}
    </div>
  );
}

function MovimientoRow({
  mov,
  index,
}: {
  mov: MovimientoReciente;
  index: number;
}) {
  const cantidad = parseFloat(mov.cantidad);
  const isPositive = cantidad >= 0;

  return (
    <tr
      key={index}
      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
    >
      <td className="py-2.5 pr-4 text-sm text-muted-foreground whitespace-nowrap">
        {mov.fecha}
      </td>
      <td className="py-2.5 pr-4">
        <div className="font-medium text-sm leading-tight">{mov.producto}</div>
        <div className="text-xs text-muted-foreground">{mov.codigo}</div>
      </td>
      <td className="py-2.5 pr-4">
        <Badge color={TIPO_COLORS[mov.tipo] ?? "gray"} size="sm">
          {mov.tipo}
        </Badge>
      </td>
      <td className="py-2.5 pr-4">
        <Badge color={MOVIMIENTO_COLORS[mov.movimiento] ?? "gray"} size="sm">
          {mov.movimiento}
        </Badge>
      </td>
      <td
        className={`py-2.5 pr-4 text-right font-mono font-semibold text-sm ${
          isPositive
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {isPositive ? "+" : ""}
        {cantidad % 1 === 0 ? cantidad.toFixed(0) : cantidad.toFixed(2)}
      </td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {mov.ubicacion}
      </td>
      <td className="py-2.5 font-mono text-xs text-muted-foreground">
        {mov.serie ?? <span className="text-muted-foreground/50">—</span>}
      </td>
    </tr>
  );
}

export default function HomePage() {
  const { data, isLoading } = useDashboardQuery();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          title="Equipos en Almacén"
          value={data?.equipos_almacen}
          icon={Warehouse}
          isLoading={isLoading}
          color="blue"
        />
        <StatCard
          title="Equipos con Técnicos"
          value={data?.equipos_tecnicos}
          icon={Wrench}
          isLoading={isLoading}
          color="orange"
        />
        <StatCard
          title="Materiales Disponibles"
          value={data?.materiales_disponibles}
          icon={Layers}
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          title="Ingresos Hoy"
          value={data?.ingresos_hoy}
          icon={ArrowDownCircle}
          isLoading={isLoading}
          color="violet"
        />
        <StatCard
          title="Material Consumido"
          value={data?.material_consumido}
          icon={Minus}
          isLoading={isLoading}
          color="red"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-4 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Fecha
                  </th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Producto
                  </th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tipo
                  </th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Movimiento
                  </th>
                  <th className="text-right py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Cant.
                  </th>
                  <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Ubicación
                  </th>
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Serie
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 pr-4">
                          <div className="h-4 animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !data?.movimientos_recientes?.length ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Sin movimientos recientes
                    </td>
                  </tr>
                ) : (
                  data.movimientos_recientes.map((mov, i) => (
                    <MovimientoRow key={i} mov={mov} index={i} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
