import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { DespachoComplete } from "../lib/despacho.constants";
import { getDespacho } from "../lib/despacho.actions";
import type { DespachoDetailResource, DespachoProductoDetalleResource } from "../lib/despacho.interface";

const productoColumns: ColumnDef<DespachoProductoDetalleResource>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">{row.index + 1}</span>
    ),
  },
  {
    id: "nombre",
    header: "Producto",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.producto.nombre || row.original.producto.sap || "—"}
      </span>
    ),
  },
  {
    id: "sap",
    header: "SAP",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.producto.sap || "—"}
      </span>
    ),
  },
  {
    id: "tipo",
    header: "Tipo",
    cell: ({ row }) =>
      row.original.producto.tipo ? (
        <Badge variant="outline" className="text-xs capitalize">
          {row.original.producto.tipo}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "cantidad",
    header: "Cant.",
    cell: ({ row }) => row.original.cantidad,
  },
  {
    id: "series",
    header: "Series",
    cell: ({ row }) => {
      const series = row.original.series ?? [];
      if (!series.length)
        return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {series.map((s, i) => (
            <Badge key={i} variant="default" className="text-xs font-mono">
              {s.serie?.serie || "—"}
              {s.serie?.mac ? ` · ${s.serie.mac}` : ""}
            </Badge>
          ))}
        </div>
      );
    },
  },
];

export default function DespachoViewPage() {
  const { id } = useParams();

  const { data: despacho, isLoading } = useQuery({
    queryKey: [DespachoComplete.QUERY_KEY, "detail", id],
    queryFn: () => getDespacho(Number(id)) as Promise<DespachoDetailResource>,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-primary"></div>
        </div>
      </FormWrapper>
    );
  }

  if (!despacho) {
    return (
      <FormWrapper>
        <div className="text-muted-foreground text-sm">Despacho no encontrado.</div>
      </FormWrapper>
    );
  }

  const tecnico = despacho.tecnico;
  const nombreTecnico = tecnico?.persona
    ? `${tecnico.persona.nombre} ${tecnico.persona.apellido_paterno}`
    : `Técnico #${despacho.tecnico_id}`;

  const usuario = despacho.usuario;
  const nombreUsuario = usuario?.persona
    ? `${usuario.persona.nombre} ${usuario.persona.apellido_paterno}`
    : (usuario?.nombre_usuario ?? "—");

  const fecha = despacho.fecha
    ? new Date(despacho.fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  const isDeleted = !!despacho.deleted_at;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={DespachoComplete.MODEL.name}
        mode="detail"
        icon="List"
        backRoute={DespachoComplete.ABSOLUTE_ROUTE}
      />
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Datos del despacho
          </h3>
          <Separator className="mt-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Número
            </p>
            <p className="font-medium">{despacho.numero}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Fecha
            </p>
            <p className="font-medium">{fecha}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Técnico
            </p>
            <p className="font-medium">{nombreTecnico}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Almacén
            </p>
            <p className="font-medium">
              {despacho.almacen?.nombre ?? `#${despacho.almacen_id}`}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Registrado por
            </p>
            <p className="font-medium">{nombreUsuario}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Estado
            </p>
            {isDeleted ? (
              <Badge variant="default" className="text-xs">
                Eliminado
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs text-green-600 border-green-600"
              >
                Activo
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── Productos ────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Productos
          </h3>
          <Separator className="mt-2" />
        </div>

        {(despacho.productos?.length ?? 0) > 0 ? (
          <DataTable
            columns={productoColumns}
            data={despacho.productos ?? []}
            variant="outline"
            isVisibleColumnFilter={false}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Este despacho no tiene productos registrados.
          </p>
        )}
      </div>
    </FormWrapper>
  );
}
