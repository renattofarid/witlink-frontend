import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { GuiaComplete, GUIA_ROUTE_VIEW } from "../lib/guia.constants";
import { getGuia } from "../lib/guia.actions";
import { api } from "@/lib/config";
import { promiseToast } from "@/lib/core.function";
import type { GuiaProductoResource } from "../lib/guia.interface";

async function openPdf(archivo: string) {
  const promise = api
    .get(`/archivos/${archivo}`, { responseType: "blob" })
    .then((response) => {
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = archivo;
      a.click();
      window.open(url);
    });
  promiseToast(promise, {
    loading: "Descargando PDF...",
    success: "PDF descargado",
    error: "Error al descargar el PDF",
  });
}

const productoColumns: ColumnDef<GuiaProductoResource>[] = [
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
            <Badge key={i} variant="secondary" className="text-xs font-mono">
              {s.serie?.serie || "—"}
              {s.serie?.mac ? ` · ${s.serie.mac}` : ""}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "observaciones",
    header: "Observaciones",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.observaciones || "—"}
      </span>
    ),
  },
];

export default function GuiaViewPage() {
  const { id } = useParams();

  const { data: guia, isLoading } = useQuery({
    queryKey: [GuiaComplete.QUERY_KEY, "detail", id],
    queryFn: () => getGuia(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="text-muted-foreground text-sm">Cargando...</div>
      </FormWrapper>
    );
  }

  if (!guia) {
    return (
      <FormWrapper>
        <div className="text-muted-foreground text-sm">Guía no encontrada.</div>
      </FormWrapper>
    );
  }

  const persona = guia.usuario?.persona;
  const nombreUsuario = persona
    ? `${persona.nombre} ${persona.apellido_paterno}`
    : guia.usuario?.nombre_usuario ?? "—";

  const fecha = guia.fecha
    ? new Date(guia.fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <FormWrapper>
      <TitleFormComponent
        title={GuiaComplete.MODEL.name}
        mode="detail"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />

      {/* ── Datos de la guía ─────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Datos de la guía
          </h3>
          <Separator className="mt-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Número
            </p>
            <p className="font-medium">{guia.numero}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Fecha
            </p>
            <p className="font-medium">{fecha}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Proveedor
            </p>
            <p className="font-medium">{guia.proveedor?.razon_social ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {guia.proveedor?.ruc ?? ""}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Registrado por
            </p>
            <p className="font-medium">{nombreUsuario}</p>
          </div>
        </div>

        {guia.ruta_pdf_guia && (
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openPdf(guia.ruta_pdf_guia!)}
            >
              <FileText className="size-3.5 mr-1" />
              Ver PDF adjunto
            </Button>
          </div>
        )}
      </div>

      {/* ── Productos ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Productos
          </h3>
          <Separator className="mt-2" />
        </div>

        {(guia.productos?.length ?? 0) > 0 ? (
          <DataTable
            columns={productoColumns}
            data={guia.productos ?? []}
            variant="outline"
            isVisibleColumnFilter={false}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Esta guía no tiene productos registrados.
          </p>
        )}
      </div>
    </FormWrapper>
  );
}
