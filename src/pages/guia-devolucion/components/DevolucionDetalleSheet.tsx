import { useState } from "react";
import { Eye } from "lucide-react";
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
}

function DetailField({ label, value }: Field) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "-"}</p>
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
        title={`Guía de devolución ${guia.numero}`}
        subtitle={guia.anulado ? "Anulada" : "Vigente"}
        icon="ClipboardList"
        size="3xl"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            {guia.anulado ? (
              <Badge variant="default" color="red">Anulado</Badge>
            ) : (
              <Badge variant="default" color="green">Vigente</Badge>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Datos de la guía
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DetailField label="Fecha de emisión" value={formatISODate(guia.fecha_emision)} />
              <DetailField label="Fecha de traslado" value={formatISODate(guia.fecha_traslado)} />
              <DetailField label="N.° guía de referencia" value={guia.numero_guia_referencia} />
              <DetailField label="Motivo de traslado" value={guia.motivo_traslado} />
              <DetailField label="Observación" value={guia.observacion} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Origen y destino
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DetailField label="Punto de partida" value={guia.punto_partida} />
              <DetailField label="Almacén de origen" value={guia.almacen_origen?.nombre} />
              <DetailField label="Almacén de destino" value={guia.almacen_destino?.nombre} />
              <DetailField label="Destinatario" value={guia.destinatario} />
              <DetailField label="RUC / DNI" value={guia.ruc_dni} />
              <DetailField label="Teléfono" value={guia.telefono} />
              <DetailField label="Punto de llegada" value={guia.punto_llegada} />
            </div>
          </div>

          {hasTransportista && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Transportista
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DetailField label="Transportista" value={t?.nombre} />
                <DetailField label="RUC transportista" value={t?.documento} />
                <DetailField label="Dirección transportista" value={t?.direccion} />
                <DetailField label="Conductor" value={t?.conductor} />
                <DetailField label="Licencia de conducir" value={t?.licencia_conducir} />
                <DetailField label="Placa de vehículo" value={t?.placa_vehiculo} />
                <DetailField label="Marca de vehículo" value={t?.marca_vehiculo} />
                {hasOtrosDatos && (
                  <>
                    <DetailField label="Peso" value={guia.otros_datos?.peso} />
                    <DetailField label="N.° de bultos" value={guia.otros_datos?.numero_bultos} />
                  </>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Emisión
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <DetailField label="Emitido por" value={guia.usuario?.persona ?? guia.usuario?.nombre_usuario} />
              {guia.anulado && (
                <DetailField label="Fecha de anulación" value={formatISODate(guia.fecha_anulacion)} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Productos y series
            </h3>
            <div className="space-y-3">
              {guia.productos.map((p) => (
                <div key={p.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{p.producto}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.sap}</p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      Cant: {p.cantidad}
                    </Badge>
                  </div>
                  {p.series.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground uppercase tracking-wide">
                            <th className="py-1.5 px-2 text-left font-medium">Serie</th>
                            <th className="py-1.5 px-2 text-left font-medium">MAC</th>
                            <th className="py-1.5 px-2 text-left font-medium">EMTA MAC</th>
                            <th className="py-1.5 px-2 text-left font-medium">UA</th>
                            <th className="py-1.5 px-2 text-left font-medium">Situación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.series.map((s) => (
                            <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                              <td className="py-1.5 px-2 font-mono font-medium">{s.serie}</td>
                              <td className="py-1.5 px-2 font-mono text-muted-foreground">{s.mac || "-"}</td>
                              <td className="py-1.5 px-2 font-mono text-muted-foreground">{s.emta_mac || "-"}</td>
                              <td className="py-1.5 px-2 text-muted-foreground">{s.ua || "-"}</td>
                              <td className="py-1.5 px-2">
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
        </div>
      </GeneralSheet>
    </>
  );
}
