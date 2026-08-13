import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, X, Package } from "lucide-react";
import { getSeriesRetiradas } from "../lib/devolucion.actions";
import {
  SITUACION_BLOQUEADA_DEVOLUCION,
  type SerieRetiradaResource,
  type SeriesRetiradasParams,
} from "../lib/devolucion.interface";

export interface DevolucionSerieCartItem {
  id: number;
  serie: string;
  producto_id: number;
  producto: string;
  sap: string;
  marca?: string;
  situacion?: string;
  despacho?: SerieRetiradaResource["despacho"];
  almacenPertenencia?: string | null;
}

/** row.almacen_pertenencia?.nombre con fallback a row.almacen?.nombre (retirados corporativos). */
function getAlmacenPertenenciaNombre(serie: SerieRetiradaResource): string | null {
  return serie.almacen_pertenencia?.nombre ?? serie.almacen?.nombre ?? null;
}

interface Props {
  items: DevolucionSerieCartItem[];
  onAdd: (item: DevolucionSerieCartItem) => void;
  onRemove: (id: number) => void;
  /** Filtros adicionales (flujo PEXT: sot/despacho_id). */
  extraParams?: Omit<SeriesRetiradasParams, "search">;
}

export default function DevolucionSeriesInput({ items, onAdd, onRemove, extraParams }: Props) {
  const [input, setInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<SerieRetiradaResource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFromResource = (serie: SerieRetiradaResource) => {
    if (items.some((i) => i.id === serie.id)) {
      setError("Esta serie ya fue agregada");
      return;
    }
    if (serie.situacion === SITUACION_BLOQUEADA_DEVOLUCION) {
      setError("Esta serie ya fue devuelta a Claro y no puede seleccionarse");
      return;
    }
    onAdd({
      id: serie.id,
      serie: serie.serie,
      producto_id: serie.producto_id,
      producto: serie.producto,
      sap: serie.sap,
      situacion: serie.situacion,
      despacho: serie.despacho,
      almacenPertenencia: getAlmacenPertenenciaNombre(serie),
    });
    setInput("");
    setMatches([]);
    setError(null);
    inputRef.current?.focus();
  };

  const handleSearch = async () => {
    const val = input.trim();
    if (!val) return;
    setSearching(true);
    setError(null);
    setMatches([]);
    try {
      const result = await getSeriesRetiradas({ search: val, ...extraParams });
      // Las series ya "Devuelto a Claro" (DC) no pueden reingresar a una guía de devolución.
      const found = (result.data ?? []).filter(
        (s) => s.situacion !== SITUACION_BLOQUEADA_DEVOLUCION,
      );
      if (found.length === 0) {
        setError(`No se encontró ninguna serie disponible con "${val}"`);
      } else if (found.length === 1) {
        addFromResource(found[0]);
      } else {
        setMatches(found);
      }
    } catch {
      setError("Error al buscar la serie");
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
              setMatches([]);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar serie retirada... → Enter"
            disabled={searching}
            className="pr-9"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {matches.length > 0 && (
        <div className="border rounded-md overflow-hidden shadow-sm">
          <div className="px-3 py-1.5 bg-muted/50 border-b">
            <p className="text-xs text-muted-foreground">
              {matches.length} resultado{matches.length !== 1 ? "s" : ""} — seleccione uno
            </p>
          </div>
          {matches.map((item) => {
            const almacenPertenencia = getAlmacenPertenenciaNombre(item);
            return (
              <button
                key={item.id}
                type="button"
                className="w-full text-left px-3 py-2.5 hover:bg-muted flex items-center gap-3 border-b last:border-0 transition-colors"
                onClick={() => addFromResource(item)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm font-mono">{item.serie}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.producto}
                    {item.despacho && (
                      <>
                        <span className="mx-1 text-border">·</span>
                        Despacho {item.despacho.numero} (SOT {item.despacho.sot})
                      </>
                    )}
                    {almacenPertenencia && (
                      <>
                        <span className="mx-1 text-border">·</span>
                        {almacenPertenencia}
                      </>
                    )}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
                  {item.situacion}
                </Badge>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {items.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <div className="px-3 py-1.5 bg-muted/50 border-b flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              {items.length} serie{items.length !== 1 ? "s" : ""} en la lista
            </p>
          </div>
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 border-b last:border-0 hover:bg-muted/30"
            >
              <span className="text-xs text-muted-foreground w-5 text-center font-mono shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium font-mono truncate">{item.serie}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.producto}
                  <span className="mx-1 text-border">·</span>
                  {item.sap}
                  {item.despacho && (
                    <>
                      <span className="mx-1 text-border">·</span>
                      Despacho {item.despacho.numero} (SOT {item.despacho.sot})
                    </>
                  )}
                  {item.almacenPertenencia && (
                    <>
                      <span className="mx-1 text-border">·</span>
                      {item.almacenPertenencia}
                    </>
                  )}
                </p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
                {item.situacion ?? "RE"}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-md py-8 flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="size-8 opacity-30" />
          <p className="text-sm">Ninguna serie agregada</p>
          <p className="text-xs">Busque por código y presione Enter</p>
        </div>
      )}
    </div>
  );
}
