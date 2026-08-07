import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidacionesComplete } from "../lib/liquidaciones.constants";
import { searchSot } from "../lib/liquidaciones.actions";
import LiquidacionHeaderInfo from "../components/LiquidacionHeaderInfo";
import LiquidacionLiquidadaView from "../components/LiquidacionLiquidadaView";

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
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

  return (
    <FormWrapper>
      <TitleFormComponent
        title={LiquidacionesComplete.MODEL.name}
        mode="detail"
        icon="ClipboardList"
        backRoute={LiquidacionesComplete.ABSOLUTE_ROUTE}
      />

      <LiquidacionHeaderInfo liquidacion={liquidacion} />

      {liquidacion.estado_liquidacion === "liquidada" ? (
        <LiquidacionLiquidadaView
          liquidacion={liquidacion}
          documentosEquiposRetirados={documentos}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Esta SOT aún no ha sido liquidada.
        </p>
      )}
    </FormWrapper>
  );
}
