import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useTecnicosLiquidacionQuery } from "../lib/liquidaciones.hook";
import type { TecnicoResource } from "@/pages/tecnico/lib/tecnico.interface";

interface TecnicoSelectorProps {
  value: string;
  onChange: (id: string, nombre: string) => void;
  onNameResolved?: (nombre: string) => void;
  placeholder?: string;
}

export default function TecnicoSelector({
  value,
  onChange,
  onNameResolved,
  placeholder = "Seleccionar técnico...",
}: TecnicoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useTecnicosLiquidacionQuery({
    search,
    per_page: 20,
  });

  const tecnicos: TecnicoResource[] = data?.data ?? [];

  const selectedTecnico = tecnicos.find((t) => String(t.id) === value);

  useEffect(() => {
    if (selectedTecnico) {
      const nombre = `${selectedTecnico.persona.nombre} ${selectedTecnico.persona.apellido_paterno}`;
      onNameResolved?.(nombre);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTecnico?.id]);
  const displayName = selectedTecnico
    ? `${selectedTecnico.persona.nombre} ${selectedTecnico.persona.apellido_paterno}`
    : value
    ? `Técnico #${value}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 text-sm font-normal"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {displayName}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar técnico..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && tecnicos.length === 0 && (
              <CommandEmpty>Sin resultados.</CommandEmpty>
            )}
            {tecnicos.map((t) => {
              const nombre = `${t.persona.nombre} ${t.persona.apellido_paterno}`;
              return (
                <CommandItem
                  key={t.id}
                  value={String(t.id)}
                  onSelect={() => {
                    onChange(String(t.id), nombre);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === String(t.id) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm">{nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      DNI: {t.persona.dni}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
