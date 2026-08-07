import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { ButtonAction } from "@/components/ButtonAction";
import type { SotRemisionResource } from "../lib/sot-remision.interface";

interface ColumnActions {
  onView: (row: SotRemisionResource) => void;
}

export const getSotRemisionColumns = ({
  onView,
}: ColumnActions): ColumnDef<SotRemisionResource>[] => [
  {
    accessorKey: "sot",
    header: "SOT",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.sot}</span>
    ),
  },
  {
    accessorKey: "ruc",
    header: "R.U.C./D.N.I.",
    cell: ({ row }) => row.original.ruc || "—",
  },
  {
    accessorKey: "razon_social",
    header: "Razón social",
    cell: ({ row }) => row.original.razon_social || "—",
  },
  {
    accessorKey: "direccion",
    header: "Dirección",
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-80" title={row.original.direccion ?? ""}>
        {row.original.direccion || "—"}
      </span>
    ),
  },
  {
    accessorKey: "distrito",
    header: "Distrito",
    cell: ({ row }) => row.original.distrito || "—",
  },
  {
    accessorKey: "provincia",
    header: "Provincia",
    cell: ({ row }) => row.original.provincia || "—",
  },
  {
    accessorKey: "departamento",
    header: "Departamento",
    cell: ({ row }) => row.original.departamento || "—",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-1">
        <ButtonAction
          icon={Eye}
          canRender={true}
          onClick={() => onView(row.original)}
        />
      </div>
    ),
  },
];
