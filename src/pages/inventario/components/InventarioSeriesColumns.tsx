import type { ColumnDef } from "@tanstack/react-table";
import type { InventarioSerieResource } from "../lib/inventario.interface";
import { Badge } from "@/components/ui/badge";

export const getInventarioSeriesColumns =
  (): ColumnDef<InventarioSerieResource>[] => [
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return (
          <div className="text-xs">
            <p>{date.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}</p>
            <p className="text-muted-foreground">{date.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "guia",
      header: "Guía",
      cell: ({ row }) => (
        <Badge variant="ghost" className="text-xs">{row.original.guia ?? "Sin guía"}</Badge>
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
      cell: ({ row }) => <p className="text-xs text-muted-foreground">{row.original.mac ?? "-"}</p>,
    },
    {
      accessorKey: "emta",
      header: "EMTA",
      cell: ({ row }) => <p className="text-xs text-muted-foreground">{row.original.emta ?? "-"}</p>,
    },
    {
      accessorKey: "ua",
      header: "UA",
      cell: ({ row }) => <p className="text-xs text-muted-foreground">{row.original.ua ?? "-"}</p>,
    },
    {
      accessorKey: "ubicacion",
      header: "Ubicación",
      cell: ({ row }) => <span>{row.original.ubicacion ?? "Sin Ubicación"}</span>,
    },
    {
      accessorKey: "personal",
      header: "Personal",
      cell: ({ row }) => <span>{row.original.personal ?? ""}</span>,
    },
    {
      accessorKey: "sot",
      header: "SOT",
      cell: ({ row }) => <p className="text-xs text-muted-foreground font-normal">{row.original.sot ?? "Sin SOT"}</p>,
    },
    {
      accessorKey: "motivo",
      header: "Motivo",
      cell: ({ row }) => <p className="text-xs text-muted-foreground font-normal">{row.original.motivo ?? "Sin Motivo"}</p>,
    },
  ];
