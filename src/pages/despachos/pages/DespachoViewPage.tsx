/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, Package, Pencil, User, Wrench } from "lucide-react";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ExportButtons from "@/components/ExportButtons";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DespachoComplete } from "../lib/despacho.constants";
import { getDespacho, reasignarTecnicoDespacho } from "../lib/despacho.actions";
import type { DespachoResource } from "../lib/despacho.interface";
import { DespachoViewProductos } from "../components/DespachoViewProductos";
import { DespachoReasignarTecnicoDialog } from "../components/DespachoReasignarTecnicoDialog";

export default function DespachoViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [reassignOpen, setReassignOpen] = useState(false);

  const { data: despacho, isLoading } = useQuery({
    queryKey: [DespachoComplete.QUERY_KEY, "detail", id],
    queryFn: () => getDespacho(Number(id)) as Promise<DespachoResource>,
    enabled: !!id,
  });

  const reassignMutation = useMutation({
    mutationFn: (nuevoTecnicoId: number) =>
      reasignarTecnicoDespacho(Number(id), nuevoTecnicoId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [DespachoComplete.QUERY_KEY, "detail", id],
      });
      queryClient.invalidateQueries({ queryKey: [DespachoComplete.QUERY_KEY] });
      successToast(data.message ?? "Técnico reasignado correctamente.");
      setReassignOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ??
          ERROR_MESSAGE(DespachoComplete.MODEL, "edit"),
      );
    },
  });

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </div>
      </FormWrapper>
    );
  }

  if (!despacho) {
    return (
      <FormWrapper>
        <p className="text-sm text-muted-foreground">Despacho no encontrado.</p>
      </FormWrapper>
    );
  }

  const nombreTecnico = despacho.tecnico?.nombre_completo;

  const nombreUsuario = despacho.usuario?.persona
    ? `${despacho.usuario.persona.nombre} ${despacho.usuario.persona.apellido_paterno}`
    : (despacho.usuario?.nombre_usuario ?? "—");

  const fecha = despacho.fecha
    ? new Date(despacho.fecha + "T12:00:00").toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const totalItems = despacho.productos?.length ?? 0;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={DespachoComplete.MODEL.name}
        mode="detail"
        icon="List"
        backRoute={DespachoComplete.ABSOLUTE_ROUTE}
      />

      {/* ── Encabezado del documento ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight">
              #{despacho.numero}
            </span>
            {despacho.deleted_at ? (
              <Badge color="destructive">Eliminado</Badge>
            ) : (
              <Badge color="green">Activo</Badge>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {fecha}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!despacho.deleted_at && (
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`${DespachoComplete.ROUTE_UPDATE}/${id}`)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
          )}
          <ExportButtons
            pdfEndpoint={`/despachos/${id}/pdf`}
            pdfFileName={`despacho-${despacho.numero ?? id}.pdf`}
            variant="detail"
          />
        </div>
      </div>

      {/* ── Metadatos ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-8 gap-y-4 border-y py-4">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Building2 className="size-3" />
            Almacén
          </p>
          <span className="text-sm font-medium">
            {despacho.almacen?.nombre ?? `#${despacho.almacen.id}`}
          </span>
          {despacho.almacen?.direccion && (
            <span className="text-xs text-muted-foreground">
              {despacho.almacen.direccion}
            </span>
          )}
        </div>

        <div className="w-px self-stretch bg-border" />

        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Wrench className="size-3" />
            Técnico
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{nombreTecnico ?? "—"}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => setReassignOpen(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="w-px self-stretch bg-border" />

        <div className="flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <User className="size-3" />
            Registrado por
          </p>
          <span className="text-sm font-medium">{nombreUsuario}</span>
        </div>
      </div>

      {/* ── Productos ────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Productos</h3>
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
          </span>
        </div>

        <DespachoViewProductos productos={despacho.productos ?? []} />
      </div>

      <DespachoReasignarTecnicoDialog
        open={reassignOpen}
        onOpenChange={setReassignOpen}
        despacho={despacho}
        onConfirm={(nuevoTecnicoId) => reassignMutation.mutateAsync(nuevoTecnicoId) as any}
        isLoading={reassignMutation.isPending}
      />
    </FormWrapper>
  );
}
