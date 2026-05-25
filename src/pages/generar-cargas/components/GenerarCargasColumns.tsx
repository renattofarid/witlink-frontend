import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/lib/core.function";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";
import {
  generarCargaTecnico,
  toggleFavoritoTecnico,
} from "../lib/generar-cargas.actions";
import { GenerarCargasComplete } from "../lib/generar-cargas.constants";

function DescargarCargaButton({ row }: { row: PersonaResource }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await generarCargaTecnico(row.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CARGA_${row.nombre}_${row.apellido_paterno}_${row.apellido_materno}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      successToast("Archivo descargado correctamente.");
    } catch {
      errorToast("Error al generar el archivo de carga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleDownload} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Descargar
    </Button>
  );
}

function QuitarFavoritoButton({ row }: { row: PersonaResource }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleFavoritoTecnico(row.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GenerarCargasComplete.QUERY_KEY],
      });
    },
    onError: () => {
      errorToast("Error al actualizar favorito.");
    },
  });

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="text-yellow-500 hover:text-red-500"
    >
      <Star className="size-4 fill-current" />
    </Button>
  );
}

export const getGenerarCargasColumns = (): ColumnDef<PersonaResource>[] => [
  {
    id: "favorito",
    header: "",
    cell: ({ row }) => <QuitarFavoritoButton row={row.original} />,
  },
  {
    id: "nombre_completo",
    header: "Nombre",
    cell: ({ row }) => {
      const { nombre, apellido_paterno, apellido_materno } = row.original;
      return `${apellido_paterno} ${apellido_materno}, ${nombre}`;
    },
  },
  {
    accessorKey: "dni",
    header: "DNI",
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => row.original.telefono ?? "-",
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => <DescargarCargaButton row={row.original} />,
  },
];
