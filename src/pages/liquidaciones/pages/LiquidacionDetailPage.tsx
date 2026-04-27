import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  User,
  MapPin,
  Package,
  Wrench,
  ClipboardList,
} from "lucide-react";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { searchSot } from "../lib/liquidaciones.actions";

// ── helpers ──────────────────────────────────────────────────────────────────

function InfoField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {Icon && <Icon className="size-3" />}
        {label}
      </p>
      <div className="text-sm font-medium">{value ?? "—"}</div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function LiquidacionDetailPage() {
  const { sot } = useParams<{ sot: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: [LiquidacionesComplete.QUERY_KEY, "detail-by-sot", sot],
    queryFn: () => searchSot(sot!),
    enabled: !!sot,
    retry: false,
  });

  const liquidacion = data?.liquidacion;
  const documentos = data?.documentos_equipos_retirados ?? [];

  const fecha = liquidacion?.fecha
    ? new Date(liquidacion.fecha + "T12:00:00").toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  if (isLoading) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title={LiquidacionesComplete.MODEL.name}
          mode="detail"
          icon="ClipboardList"
          backRoute={LiquidacionesComplete.ABSOLUTE_ROUTE}
        />
        <DetailSkeleton />
      </FormWrapper>
    );
  }

  if (isError || !liquidacion) {
    return (
      <FormWrapper>
        <TitleFormComponent
          title={LiquidacionesComplete.MODEL.name}
          mode="detail"
          icon="ClipboardList"
          backRoute={LiquidacionesComplete.ABSOLUTE_ROUTE}
        />
        <p className="text-sm text-muted-foreground">
          Liquidación no encontrada.
        </p>
      </FormWrapper>
    );
  }

  const estadoColorMap: Record<string, any> = {
    ATENDIDA: "green",
    "P. VALIDAR": "yellow",
    RECHAZADO: "red",
    REPROGRAMADO: "blue",
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title={LiquidacionesComplete.MODEL.name}
        mode="detail"
        icon="ClipboardList"
        backRoute={LiquidacionesComplete.ABSOLUTE_ROUTE}
      />

      {/* Información general */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="size-4" />
              Información de la orden
            </CardTitle>
            <div className="flex gap-2">
              {liquidacion.estado && (
                <Badge
                  color={estadoColorMap[liquidacion.estado] ?? "muted"}
                  className="text-xs"
                >
                  {liquidacion.estado}
                </Badge>
              )}
              {liquidacion.estado_liquidacion && (
                <Badge variant="outline" className="text-xs">
                  {liquidacion.estado_liquidacion}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <InfoField label="SOT" icon={ClipboardList} value={liquidacion.sot} />
            <InfoField label="Fecha" icon={CalendarDays} value={fecha} />
            <InfoField label="Código" value={liquidacion.codigo} />
            <InfoField label="Cliente" icon={User} value={liquidacion.nombre} />
          </div>
          <Separator />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <InfoField label="Dirección" icon={MapPin} value={liquidacion.direccion} />
            <InfoField label="Distrito" value={liquidacion.distrito} />
            <InfoField label="Plano" value={liquidacion.plano} />
            <InfoField label="Paquete" value={liquidacion.paquete} />
          </div>
          <Separator />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <InfoField label="Contacto" value={liquidacion.contacto} />
            <InfoField label="Tipo trabajo" value={liquidacion.tipo_trabajo} />
            <InfoField label="Observaciones" value={liquidacion.observaciones} />
          </div>
        </CardContent>
      </Card>

      {/* Técnicos asignados */}
      {(liquidacion.tecnico1 || liquidacion.tecnico2) && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="size-4" />
              Personal asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              {liquidacion.tecnico1 && (
                <InfoField label="Personal 1" value={`#${liquidacion.tecnico1}`} />
              )}
              {liquidacion.tecnico2 && (
                <InfoField label="Personal 2" value={`#${liquidacion.tecnico2}`} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos / equipos retirados */}
      {documentos.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="size-4" />
              Documentos relacionados
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {documentos.map((doc) => (
              <div key={doc.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {doc.nombre_tipo}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(doc.fecha + "T12:00:00").toLocaleDateString("es-PE")}
                  </span>
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {doc.productos.length} producto{doc.productos.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-1.5 pl-2">
                  {doc.productos.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm border rounded-md px-3 py-2 bg-muted/30"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{p.producto.nombre}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {p.producto.sap}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ×{p.cantidad}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </FormWrapper>
  );
}
