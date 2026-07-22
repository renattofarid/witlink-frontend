import { useState } from "react";
import {
  Eye,
  Truck,
  User,
  MapPin,
  FileText,
  Package,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/components/GeneralSheet";
import type { GuiaDevolucionListItem } from "../lib/devolucion.interface";

function formatISODate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

interface Field {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  className?: string;
}

function DocField({ label, value, mono, className }: Field) {
  return (
    <div className={`space-y-0.5 min-w-0 ${className ?? ""}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`text-sm wrap-break-word ${mono ? "font-mono" : ""}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3 py-1.5">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

interface Props {
  guia: GuiaDevolucionListItem;
}

export default function DevolucionDetalleSheet({ guia }: Props) {
  const [open, setOpen] = useState(false);

  const t = guia.transportista;
  const hasTransportista = Boolean(
    t?.nombre || t?.documento || t?.direccion || t?.conductor || t?.licencia_conducir || t?.placa_vehiculo || t?.marca_vehiculo,
  );
  const hasOtrosDatos = Boolean(guia.otros_datos?.peso || guia.otros_datos?.numero_bultos);
  const totalItems = guia.productos.reduce((acc, p) => acc + p.series.length, 0);

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        tooltip="Ver detalle"
        onClick={() => setOpen(true)}
      >
        <Eye className="size-3.5" />
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Guía de devolución"
        icon="ClipboardList"
        size="4xl"
      >
        <div className="rounded-lg border-2 shadow-sm overflow-hidden bg-background">
          {/* ── Encabezado tipo documento ─────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 bg-muted/30 p-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Guía de traslado por devolución
              </p>
              <p className="font-mono text-2xl font-bold tracking-tight">
                {guia.numero}
              </p>
              {guia.anulado ? (
                <Badge variant="default" color="red" icon={Ban}>
                  Anulada
                </Badge>
              ) : (
                <Badge variant="default" color="green">
                  Vigente
                </Badge>
              )}
            </div>

            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Emisión
                </p>
                <p className="text-sm font-medium">{formatISODate(guia.fecha_emision)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Traslado
                </p>
                <p className="text-sm font-medium">{formatISODate(guia.fecha_traslado)}</p>
              </div>
              {guia.anulado && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Anulación
                  </p>
                  <p className="text-sm font-medium">{formatISODate(guia.fecha_anulacion)}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Motivo / referencia ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-3 border-b p-3 md:grid-cols-3">
            <DocField label="Motivo de traslado" value={guia.motivo_traslado} />
            <DocField label="N.° guía de referencia" value={guia.numero_guia_referencia} mono />
            <DocField label="Observación" value={guia.observacion} />
          </div>

          {/* ── Origen / Destino en dos casillas tipo formato SUNAT ─────────── */}
          <div className="grid grid-cols-1 divide-y border-b md:grid-cols-2 md:divide-x md:divide-y-0">
            <div>
              <SectionTitle icon={MapPin}>Punto de partida</SectionTitle>
              <div className="grid grid-cols-1 gap-3 p-3">
                <DocField label="Almacén de origen" value={guia.almacen_origen?.nombre} />
                <DocField label="Dirección" value={guia.punto_partida} />
              </div>
            </div>
            <div>
              <SectionTitle icon={MapPin}>Punto de llegada</SectionTitle>
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
                <DocField label="Destinatario" value={guia.destinatario} className="sm:col-span-2" />
                <DocField label="RUC / DNI" value={guia.ruc_dni} mono />
                <DocField label="Teléfono" value={guia.telefono} mono />
                <DocField
                  label={guia.almacen_destino ? "Almacén de destino" : "Dirección"}
                  value={guia.almacen_destino?.nombre ?? guia.punto_llegada}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          </div>

          {/* ── Transportista ────────────────────────────────────────────── */}
          {hasTransportista && (
            <div className="border-b">
              <SectionTitle icon={Truck}>Transportista</SectionTitle>
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 md:grid-cols-4">
                <DocField label="Transportista" value={t?.nombre} className="sm:col-span-2 md:col-span-2" />
                <DocField label="RUC transportista" value={t?.documento} mono />
                <DocField label="Conductor" value={t?.conductor} />
                <DocField label="Dirección" value={t?.direccion} className="sm:col-span-2 md:col-span-4" />
                <DocField label="Licencia de conducir" value={t?.licencia_conducir} mono />
                <DocField label="Placa de vehículo" value={t?.placa_vehiculo} mono />
                <DocField label="Marca de vehículo" value={t?.marca_vehiculo} />
                {hasOtrosDatos && (
                  <>
                    <DocField label="Peso" value={guia.otros_datos?.peso} />
                    <DocField label="N.° de bultos" value={guia.otros_datos?.numero_bultos} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Productos y series como tabla de detalle de guía ────────────── */}
          <div className="border-b">
            <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5">
              <div className="flex items-center gap-1.5">
                <Package className="size-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Detalle de bienes a transportar
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {totalItems} {totalItems === 1 ? "serie" : "series"}
              </span>
            </div>

            <div className="divide-y">
              {guia.productos.map((p) => (
                <div key={p.id}>
                  <div className="flex items-start justify-between gap-2 bg-muted/10 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{p.producto}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.sap}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      Cant: {p.cantidad}
                    </Badge>
                  </div>
                  {p.series.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/20 text-muted-foreground uppercase tracking-wide">
                            <th className="w-8 px-2 py-1.5 text-left font-medium">#</th>
                            <th className="px-2 py-1.5 text-left font-medium">Serie</th>
                            <th className="px-2 py-1.5 text-left font-medium">MAC</th>
                            <th className="px-2 py-1.5 text-left font-medium">EMTA MAC</th>
                            <th className="px-2 py-1.5 text-left font-medium">UA</th>
                            <th className="px-2 py-1.5 text-left font-medium">Situación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.series.map((s, idx) => (
                            <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="px-2 py-1.5 text-muted-foreground">{idx + 1}</td>
                              <td className="px-2 py-1.5 font-mono font-medium">{s.serie}</td>
                              <td className="px-2 py-1.5 font-mono text-muted-foreground">{s.mac || "-"}</td>
                              <td className="px-2 py-1.5 font-mono text-muted-foreground">{s.emta_mac || "-"}</td>
                              <td className="px-2 py-1.5 text-muted-foreground">{s.ua || "-"}</td>
                              <td className="px-2 py-1.5">
                                <Badge variant="outline" className="text-xs">{s.situacion}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Pie de documento ─────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/20 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="size-3.5" />
              Emitido por{" "}
              <span className="font-medium text-foreground">
                {guia.usuario?.persona ?? guia.usuario?.nombre_usuario ?? "-"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="size-3.5" />
              Registrado el {formatISODate(guia.created_at)}
              {guia.updated_at && guia.updated_at !== guia.created_at && (
                <> · Actualizado el {formatISODate(guia.updated_at)}</>
              )}
            </div>
          </div>
        </div>
      </GeneralSheet>
    </>
  );
}
