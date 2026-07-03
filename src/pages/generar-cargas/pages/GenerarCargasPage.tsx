import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileDown, Loader2, Star } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { errorToast, successToast } from "@/lib/core.function";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import { GenerarCargasComplete } from "../lib/generar-cargas.constants";
import { useFavoritosTecnicosQuery } from "../lib/generar-cargas.hook";
import { useTecnicoDespachoQuery } from "@/pages/despachos/lib/despacho.hook";
import {
  generarCargaTecnico,
  toggleFavoritoTecnico,
} from "../lib/generar-cargas.actions";
import FavoritoListItem from "../components/FavoritoListItem";
import GenerarCargasButtons from "../components/GenerarCargasButtons";

export default function GenerarCargasPage() {
  const queryClient = useQueryClient();
  const [tecnicoId, setTecnicoId] = useState("");
  const [selected, setSelected] = useState<PersonaResource | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading } = useFavoritosTecnicosQuery({
    page: "1",
    per_page: "100",
  });
  const favoritos = data?.data ?? [];

  const favoritoMutation = useMutation({
    mutationFn: (id: number) => toggleFavoritoTecnico(id),
    onSuccess: (result) => {
      if (result.favorito) {
        successToast("Técnico agregado a favoritos.");
      }
      queryClient.invalidateQueries({
        queryKey: [GenerarCargasComplete.QUERY_KEY],
      });
    },
    onError: () => {
      errorToast("Error al actualizar favorito.");
    },
  });

  const handleGenerar = async () => {
    if (!selected) return;
    setDownloading(true);
    try {
      const blob = await generarCargaTecnico(selected.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CARGA_${selected.nombre}_${selected.apellido_paterno}_${selected.apellido_materno}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      successToast("Archivo descargado correctamente.");
    } catch {
      errorToast("Error al generar el archivo de carga.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PageWrapper>
      <TitleComponent
        title={GenerarCargasComplete.MODEL.name}
        subtitle="Gestiona y descarga los archivos de carga de tus técnicos favoritos"
        icon="FileDown"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="size-4 text-primary" />
              Generar Carga Individual
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SearchableSelectAsync
              value={tecnicoId}
              onChange={setTecnicoId}
              onValueChange={(_, item) => setSelected(item ?? null)}
              label="Personal"
              placeholder="Buscar personal..."
              useQueryHook={useTecnicoDespachoQuery}
              mapOptionFn={(item: PersonaResource) => ({
                value: String(item.id),
                label: `${item.apellido_paterno} ${item.apellido_materno}, ${item.nombre}`,
                description: item.dni,
              })}
              perPage={20}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                color="blue"
                onClick={handleGenerar}
                disabled={!selected || downloading}
              >
                {downloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Generar y Descargar
              </Button>
              <Button
                color="yellow"
                onClick={() => selected && favoritoMutation.mutate(selected.id)}
                disabled={!selected || favoritoMutation.isPending}
              >
                <Star className="size-4" />
                Agregar a Favoritos
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="size-4 fill-orange-500 text-orange-500" />
              Favoritos
              <Badge color="orange" size="sm">
                {data?.meta.total ?? 0}
              </Badge>
            </CardTitle>
            <GenerarCargasButtons />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-105 pr-3">
              <div className="flex flex-col divide-y">
                {isLoading && (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando favoritos...
                  </div>
                )}
                {!isLoading && favoritos.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No tienes técnicos favoritos.
                  </p>
                )}
                {favoritos.map((tecnico) => (
                  <FavoritoListItem key={tecnico.id} tecnico={tecnico} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
