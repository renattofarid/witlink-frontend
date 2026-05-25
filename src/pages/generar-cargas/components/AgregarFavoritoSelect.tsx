import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { errorToast, successToast } from "@/lib/core.function";
import {
  getTecnicosNoFavoritos,
  toggleFavoritoTecnico,
} from "../lib/generar-cargas.actions";
import { GenerarCargasComplete } from "../lib/generar-cargas.constants";

export default function AgregarFavoritoSelect() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["tecnicos-no-favoritos", debouncedSearch],
    queryFn: () => getTecnicosNoFavoritos(debouncedSearch),
    enabled: open && debouncedSearch.length >= 2,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: (id: number) => toggleFavoritoTecnico(id),
    onSuccess: (result) => {
      if (result.favorito) {
        successToast("Técnico agregado a favoritos.");
      }
      queryClient.invalidateQueries({
        queryKey: [GenerarCargasComplete.QUERY_KEY],
      });
      setOpen(false);
      setSearch("");
    },
    onError: () => {
      errorToast("Error al agregar a favoritos.");
    },
  });

  const tecnicos = data?.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="size-4" />
          Agregar técnico
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar técnico..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" />
                Buscando...
              </div>
            )}
            {!isLoading && debouncedSearch.length < 2 && (
              <CommandEmpty>Escribe al menos 2 caracteres.</CommandEmpty>
            )}
            {!isLoading && debouncedSearch.length >= 2 && tecnicos.length === 0 && (
              <CommandEmpty>No se encontraron técnicos.</CommandEmpty>
            )}
            {tecnicos.length > 0 && (
              <CommandGroup>
                {tecnicos.map((tecnico) => (
                  <CommandItem
                    key={tecnico.id}
                    value={String(tecnico.id)}
                    onSelect={() => mutation.mutate(tecnico.id)}
                    disabled={mutation.isPending}
                    className="flex justify-between"
                  >
                    <span>
                      {tecnico.apellido_paterno} {tecnico.apellido_materno},{" "}
                      {tecnico.nombre}
                    </span>
                    <span className="text-muted-foreground text-xs">{tecnico.dni}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
