import type { ColumnDef } from "@tanstack/react-table";
import { ButtonAction } from "@/components/ButtonAction";
import {
  Undo2,
  History,
  PackageCheck,
  Lock,
  Unlock,
  MapPinned,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { parseISO, format } from "date-fns";
import type { InventarioSerieResource } from "../lib/inventario.interface";
import {
  SituacionBadge,
  SITUACION,
} from "@/pages/serie/components/SerieColumns";

interface ColumnActions {
  onDevolver: (row: InventarioSerieResource) => void;
  onHistorial: (row: InventarioSerieResource) => void;
  onDevolverClaro: (row: InventarioSerieResource) => void;
  onStatusSot: (row: InventarioSerieResource) => void;
  isCorporativo?: boolean;
  onReservarSot?: (row: InventarioSerieResource) => void;
  onLiberarSot?: (row: InventarioSerieResource) => void;
  onCambiarUbicacion?: (row: InventarioSerieResource) => void;
  /** Reserva masiva de SOT: habilita la columna de selección (checkbox nativo de DataTable). */
  enableSeleccionMasiva?: boolean;
}

export const getInventarioSeriesColumns = ({
  onDevolver,
  onHistorial,
  onDevolverClaro,
  onStatusSot,
  isCorporativo,
  onReservarSot,
  onLiberarSot,
  onCambiarUbicacion,
  enableSeleccionMasiva,
}: ColumnActions): ColumnDef<InventarioSerieResource>[] => [
  ...(enableSeleccionMasiva
    ? [
        {
          id: "select",
          header: ({ table }) => {
            const rows = table.getRowModel().rows;
            const eligible = rows.filter((r) => !r.original.reserva_sot);
            const eligibleSelected = eligible.filter((r) => r.getIsSelected());
            const allSelected =
              eligible.length > 0 && eligibleSelected.length === eligible.length;
            const someSelected =
              eligibleSelected.length > 0 && !allSelected;
            return (
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                disabled={eligible.length === 0}
                onCheckedChange={(value) =>
                  eligible.forEach((r) => r.toggleSelected(!!value))
                }
              />
            );
          },
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!!row.original.reserva_sot}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          ),
        } satisfies ColumnDef<InventarioSerieResource>,
      ]
    : []),
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: (info) => {
      const raw = info.getValue() as string;
      return (
        <p className="text-xs">
          {raw ? format(parseISO(raw), "dd/MM/yyyy") : "-"}
        </p>
      );
    },
  },
  {
    accessorKey: "guia",
    header: "Guía",
    cell: ({ row }) => (
      <Badge variant="ghost" className="text-xs">
        {row.original.guia ?? "Sin guía"}
      </Badge>
    ),
  },
  {
    accessorKey: "sap",
    header: "SAP / Producto",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-xs">{row.original.sap ?? "—"}</p>
        <p className="text-xs text-muted-foreground font-normal">
          {row.original.producto ?? "—"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "serie",
    header: "Serie",
    cell: ({ row }) => (
      <Badge variant="ghost" color="green" className="text-xs">
        {row.original.serie ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "mac",
    header: "MAC",
    cell: ({ row }) => (
      <p className="text-xs text-muted-foreground">{row.original.mac ?? "-"}</p>
    ),
  },
  {
    accessorKey: "emta",
    header: "EMTA",
    cell: ({ row }) => (
      <p className="text-xs text-muted-foreground">
        {row.original.emta ?? "-"}
      </p>
    ),
  },
  {
    accessorKey: "ua",
    header: "UA",
    cell: ({ row }) => (
      <p className="text-xs text-muted-foreground">{row.original.ua ?? "-"}</p>
    ),
  },
  {
    accessorKey: "dias",
    header: "Días",
    cell: ({ row }) => <span>{row.original.dias ?? "—"}</span>,
  },
  {
    accessorKey: "ubicacion",
    header: "Ubicación",
    cell: ({ row }) => <span>{row.original.ubicacion ?? "Sin Ubicación"}</span>,
  },
  {
    accessorKey: "tecnico",
    header: "Técnico",
    cell: ({ row }) => (
      <span className="text-xs">{row.original.tecnico ?? "—"}</span>
    ),
  },
  {
    accessorKey: "personal",
    header: "Personal",
    cell: ({ row }) => <span>{row.original.personal ?? ""}</span>,
  },
  {
    accessorKey: "sot",
    header: "SOT",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">
          {row.original.sot ?? "Sin SOT"}
        </p>

        <ButtonAction
          icon={PackageCheck}
          tooltip="Cambiar SOT"
          onClick={() => onStatusSot(row.original)}
        />
      </div>
    ),
  },
  ...(isCorporativo
    ? [
        {
          id: "reserva_sot",
          header: "Reserva",
          cell: ({ row }) =>
            row.original.reserva_sot ? (
              <Badge variant="ghost" color="amber" className="text-xs">
                Reservada · {row.original.reserva_sot}
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground">Libre</p>
            ),
        } satisfies ColumnDef<InventarioSerieResource>,
      ]
    : []),
  {
    accessorKey: "motivo",
    header: "Motivo",
    cell: ({ row }) => (
      <p className="text-xs text-muted-foreground font-normal">
        {row.original.motivo ?? "Sin Motivo"}
      </p>
    ),
  },
  {
    id: "situacion_label",
    header: "Situación",
    cell: ({ row }) => (
      <SituacionBadge situacion={row.original.situacion_label} />
    ),
  },
  {
    accessorKey: "contabilizado",
    header: "Contabilizado",
    cell: ({ row }) => (
      <p className="text-xs text-muted-foreground font-normal">
        {row.original.contabilizado ?? "—"}
      </p>
    ),
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <ButtonAction
          icon={History}
          tooltip="Ver historial"
          canRender
          onClick={() => onHistorial(row.original)}
        />
        <ButtonAction
          icon={Undo2}
          color="red"
          tooltip="Devolver serie"
          canRender={row.original.situacion_label === SITUACION.DESPACHADO}
          onClick={() => onDevolver(row.original)}
        />
        <ButtonAction
          icon={PackageCheck}
          color="indigo"
          tooltip="Devolver a Claro"
          canRender={row.original.situacion_label === SITUACION.DISPONIBLE}
          onClick={() => onDevolverClaro(row.original)}
        />
        <ButtonAction
          icon={Lock}
          color="amber"
          tooltip="Reservar por SOT"
          canRender={
            !!isCorporativo && !!onReservarSot && !row.original.reserva_sot
          }
          onClick={() => onReservarSot?.(row.original)}
        />
        <ButtonAction
          icon={Unlock}
          color="amber"
          tooltip="Liberar reserva"
          canRender={
            !!isCorporativo && !!onLiberarSot && !!row.original.reserva_sot
          }
          onClick={() => onLiberarSot?.(row.original)}
        />
        <ButtonAction
          icon={MapPinned}
          tooltip="Cambiar ubicación"
          canRender={!!isCorporativo && !!onCambiarUbicacion}
          onClick={() => onCambiarUbicacion?.(row.original)}
        />
      </div>
    ),
  },
];
