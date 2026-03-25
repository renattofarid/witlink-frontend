import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  MeasuringStrategy,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GeneralModal } from "@/components/GeneralModal";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { Button } from "@/components/ui/button";
import { ButtonAction } from "@/components/ButtonAction";
import { Plus, ArrowLeft, GripVertical, Pencil, Trash2, RotateCcw, ListOrdered } from "lucide-react";
import { successToast, errorToast } from "@/lib/core.function";
import { cn } from "@/lib/utils";
import { useOpcionMenuQuery } from "../lib/menu.hook";
import {
  deleteOpcionMenu,
  restoreOpcionMenu,
  reorderOpcionesMenu,
  setOrdenOpcionesMenu,
} from "../lib/menu.actions";
import { OPCION_MENU_QUERY_KEY } from "../lib/menu.constants";
import OpcionMenuForm from "./OpcionMenuForm";
import type { MenuResource, OpcionMenuResource } from "../lib/menu.interface";

// ─── Draggable row ────────────────────────────────────────────────────────────

function DraggableRow({
  opcion,
  index,
  onEdit,
  onDelete,
  onRestore,
  isDragOverlay = false,
}: {
  opcion: OpcionMenuResource;
  index: number;
  onEdit: (o: OpcionMenuResource) => void;
  onDelete: (o: OpcionMenuResource) => void;
  onRestore: (o: OpcionMenuResource) => void;
  isDragOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opcion.id, disabled: !!opcion.deleted_at });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const isDeleted = !!opcion.deleted_at;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "grid grid-cols-[20px_28px_1fr_1fr_80px_72px] items-center gap-2 px-3 py-2 border-b last:border-b-0 bg-background text-sm transition-colors",
        !isDragOverlay && "hover:bg-muted/30",
        isDragging && !isDragOverlay && "opacity-40",
        isDragOverlay && "shadow-lg rounded-lg border opacity-95",
        isDeleted && "opacity-50"
      )}
    >
      {/* drag handle */}
      <button
        {...listeners}
        className={cn(
          "flex items-center justify-center text-muted-foreground touch-none select-none",
          !isDeleted && !isDragOverlay
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-not-allowed opacity-30"
        )}
        disabled={isDeleted}
        tabIndex={-1}
      >
        <GripVertical className="size-3.5" />
      </button>

      {/* orden */}
      <span className="text-muted-foreground tabular-nums text-xs text-right">
        {index + 1}
      </span>

      {/* nombre */}
      <span className="font-medium truncate">{opcion.nombre}</span>

      {/* ruta */}
      <span className="text-muted-foreground truncate text-xs">{opcion.ruta}</span>

      {/* icono */}
      <span className="text-muted-foreground truncate text-xs">{opcion.icono}</span>

      {/* acciones */}
      <div className="flex gap-0.5 justify-end">
        <ButtonAction icon={Pencil} canRender={!isDeleted} onClick={() => onEdit(opcion)} />
        <ButtonAction icon={Trash2} canRender={!isDeleted} onClick={() => onDelete(opcion)} />
        <ButtonAction icon={RotateCcw} canRender={isDeleted} onClick={() => onRestore(opcion)} />
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

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
  const [items, setItems] = useState<OpcionMenuResource[]>([]);
  const [activeOpcion, setActiveOpcion] = useState<OpcionMenuResource | null>(null);

  const { data: opciones, isLoading } = useOpcionMenuQuery(grupoMenu.id);

  useEffect(() => {
    if (opciones) setItems([...opciones].sort((a, b) => Number(a.orden) - Number(b.orden)));
  }, [opciones]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const deleteMutation = useMutation({
    mutationFn: () => deleteOpcionMenu(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPCION_MENU_QUERY_KEY, grupoMenu.id] });
      successToast("Opción eliminada correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al eliminar la opción.");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreOpcionMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPCION_MENU_QUERY_KEY, grupoMenu.id] });
      successToast("Opción restaurada correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al restaurar la opción.");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderOpcionesMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPCION_MENU_QUERY_KEY, grupoMenu.id] });
      successToast("Orden actualizado correctamente.");
    },
    onError: (error: any) => {
      if (opciones) setItems(opciones); // rollback
      errorToast(error.response?.data?.message ?? "Error al reordenar.");
    },
  });

  const setOrdenMutation = useMutation({
    mutationFn: setOrdenOpcionesMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPCION_MENU_QUERY_KEY, grupoMenu.id] });
      successToast("Orden guardado correctamente.");
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? "Error al guardar el orden.");
    },
  });

  function handleSetOrden() {
    const updates = items.map((opcion, idx) => ({
      id: opcion.id,
      body: {
        nombre: opcion.nombre,
        ruta: opcion.ruta,
        icono: opcion.icono,
        orden: String(idx + 1),
        grupo_menu_id: opcion.grupo_menu_id,
      },
    }));
    setOrdenMutation.mutate(updates);
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as number;
    setActiveOpcion(items.find((o) => o.id === id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveOpcion(null);
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((o) => o.id === active.id);
    const newIndex = items.findIndex((o) => o.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);

    // Optimistic update
    setItems(reordered);

    // Only send updates for items whose orden changed
    const updates = reordered
      .map((opcion, idx) => ({ opcion, newOrden: String(idx + 1) }))
      .filter(({ opcion, newOrden }) => opcion.orden !== newOrden)
      .map(({ opcion, newOrden }) => ({
        id: opcion.id,
        body: {
          nombre: opcion.nombre,
          ruta: opcion.ruta,
          icono: opcion.icono,
          orden: newOrden,
          grupo_menu_id: opcion.grupo_menu_id,
        },
      }));

    if (updates.length > 0) {
      reorderMutation.mutate(updates);
    }
  }

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
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSetOrden}
                disabled={setOrdenMutation.isPending || items.length === 0}
              >
                <ListOrdered className="size-4 mr-1" />
                {setOrdenMutation.isPending ? "Guardando..." : "Guardar orden"}
              </Button>
              <Button size="sm" onClick={() => setView("create")}>
                <Plus className="size-4 mr-1" />
                Agregar opciones
              </Button>
            </div>

            {/* Table header */}
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-[20px_28px_1fr_1fr_80px_72px] gap-2 px-3 py-2 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
                <span />
                <span className="text-right">#</span>
                <span>Nombre</span>
                <span>Ruta</span>
                <span>Ícono</span>
                <span />
              </div>

              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Cargando...
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Sin opciones
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((o) => o.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((opcion, index) => (
                      <DraggableRow
                        key={opcion.id}
                        opcion={opcion}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onRestore={handleRestore}
                      />
                    ))}
                  </SortableContext>
                  {createPortal(
                    <DragOverlay>
                      {activeOpcion && (
                        <DraggableRow
                          opcion={activeOpcion}
                          index={items.findIndex((o) => o.id === activeOpcion.id)}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onRestore={() => {}}
                          isDragOverlay
                        />
                      )}
                    </DragOverlay>,
                    document.body
                  )}
                </DndContext>
              )}
            </div>
          </div>
        )}

        {view === "create" && (
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="mb-1">
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
            <Button variant="ghost" size="sm" onClick={handleBack} className="mb-1">
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
