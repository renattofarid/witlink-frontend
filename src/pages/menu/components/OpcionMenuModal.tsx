import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/components/GeneralModal";
import { DataTable } from "@/components/DataTable";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { successToast, errorToast } from "@/lib/core.function";
import { useOpcionMenuQuery } from "../lib/menu.hook";
import { deleteOpcionMenu, restoreOpcionMenu } from "../lib/menu.actions";
import { OPCION_MENU_QUERY_KEY } from "../lib/menu.constants";
import { getOpcionMenuColumns } from "./OpcionMenuColumns";
import OpcionMenuForm from "./OpcionMenuForm";
import type { MenuResource, OpcionMenuResource } from "../lib/menu.interface";

type View = "list" | "create" | "edit";

interface OpcionMenuModalProps {
  open: boolean;
  onClose: () => void;
  grupoMenu: MenuResource;
}

export default function OpcionMenuModal({
  open,
  onClose,
  grupoMenu,
}: OpcionMenuModalProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("list");
  const [selectedOpcion, setSelectedOpcion] = useState<OpcionMenuResource | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<OpcionMenuResource | null>(null);

  const { data: opciones, isLoading } = useOpcionMenuQuery(grupoMenu.id);

  const deleteMutation = useMutation({
    mutationFn: () => deleteOpcionMenu(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [OPCION_MENU_QUERY_KEY, grupoMenu.id],
      });
      successToast("Opción eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al eliminar la opción."
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreOpcionMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [OPCION_MENU_QUERY_KEY, grupoMenu.id],
      });
      successToast("Opción restaurada correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "Error al restaurar la opción."
      );
    },
  });

  const handleEdit = (row: OpcionMenuResource) => {
    setSelectedOpcion(row);
    setView("edit");
  };

  const handleDelete = (row: OpcionMenuResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handleRestore = (row: OpcionMenuResource) => {
    restoreMutation.mutate(row.id);
  };

  const handleBack = () => {
    setView("list");
    setSelectedOpcion(null);
  };

  const handleClose = () => {
    setView("list");
    setSelectedOpcion(null);
    onClose();
  };

  const columns = getOpcionMenuColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  const title =
    view === "list"
      ? `Opciones de: ${grupoMenu.nombre}`
      : view === "create"
        ? "Agregar opciones de menú"
        : "Editar opción de menú";

  return (
    <>
      <GeneralModal
        open={open}
        onClose={handleClose}
        title={title}
        icon="List"
        size="4xl"
      >
        {view === "list" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setView("create")}>
                <Plus className="size-4 mr-1" />
                Agregar opciones
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={opciones ?? []}
              isLoading={isLoading}
            />
          </div>
        )}

        {view === "create" && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-1"
            >
              <ArrowLeft className="size-4 mr-1" />
              Volver a la lista
            </Button>
            <OpcionMenuForm
              mode="create"
              grupoMenuId={grupoMenu.id}
              onSuccess={handleBack}
            />
          </div>
        )}

        {view === "edit" && selectedOpcion && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-1"
            >
              <ArrowLeft className="size-4 mr-1" />
              Volver a la lista
            </Button>
            <OpcionMenuForm
              mode="edit"
              defaultValues={selectedOpcion}
              onSuccess={handleBack}
            />
          </div>
        )}
      </GeneralModal>

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar opción de menú"
        description="¿Estás seguro de que deseas eliminar esta opción? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </>
  );
}
