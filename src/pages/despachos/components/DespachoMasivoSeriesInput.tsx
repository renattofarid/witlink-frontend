import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { validateSerieMasivoDisponible } from "../lib/despacho.actions";
import type { MasivoSerieValidadaItem } from "../lib/despacho.interface";

interface DespachoMasivoSeriesInputProps {
  items: MasivoSerieValidadaItem[];
  onAdd: (item: MasivoSerieValidadaItem) => void;
  onRemove: (id: number) => void;
}

export function DespachoMasivoSeriesInput({
  items,
  onAdd,
  onRemove,
}: DespachoMasivoSeriesInputProps) {
  const [input, setInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isValidatingRef = useRef(false);

  const handleValidate = useCallback(async () => {
    if (isValidatingRef.current) return;
    const trimmed = input.trim().toUpperCase();
    if (!trimmed) return;

    if (items.some((item) => item.serie.toUpperCase() === trimmed)) {
      setError("Esta serie ya fue agregada");
      return;
    }

    isValidatingRef.current = true;
    setIsValidating(true);
    setError("");
    try {
      const res = await validateSerieMasivoDisponible(trimmed);
      onAdd({
        id: res.serie.id,
        serie: res.serie.serie,
        producto_id: res.serie.producto_id,
        producto_nombre: res.serie.producto.nombre,
        producto_sap: res.serie.producto.sap,
        producto_tipo: res.serie.producto.tipo,
      });
      setInput("");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Serie no disponible");
    } finally {
      isValidatingRef.current = false;
      setIsValidating(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [input, items, onAdd]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleValidate();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input row */}
      <div className="space-y-1">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toUpperCase());
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (input.trim()) handleValidate(); }}
            placeholder="Ingresar número de serie y presionar Enter..."
            className={`font-mono${error ? " border-destructive" : ""}`}
            disabled={isValidating}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0"
            onClick={handleValidate}
            disabled={isValidating || !input.trim()}
          >
            {isValidating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {/* Validated series list */}
      {items.length > 0 && (
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-md border px-2 py-2 bg-background"
            >
              <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                {index + 1}.
              </span>
              <Check className="size-3 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-mono font-medium">{item.serie}</span>
                <p className="text-xs text-muted-foreground truncate">
                  {item.producto_nombre}
                  <span className="mx-1 text-border">·</span>
                  {item.producto_sap}
                </p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
                {item.producto_tipo}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6 text-destructive hover:text-destructive shrink-0"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {items.length} serie{items.length !== 1 ? "s" : ""} validada
          {items.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
