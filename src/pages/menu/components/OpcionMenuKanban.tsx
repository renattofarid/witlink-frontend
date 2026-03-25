import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { successToast, errorToast } from "@/lib/core.function";
import { updateOpcionMenu } from "../lib/menu.actions";
import { OPCION_MENU_QUERY_KEY } from "../lib/menu.constants";
import type { MenuResource, OpcionMenuResource } from "../lib/menu.interface";
import FormSkeleton from "@/components/FormSkeleton";

function buildContainers(
  groups: MenuResource[],
  opciones: OpcionMenuResource[]
): Record<number, OpcionMenuResource[]> {
  const result: Record<number, OpcionMenuResource[]> = {};
  for (const group of groups) {
    result[group.id] = [];
  }
  for (const opcion of opciones) {
    const groupId = opcion.grupo_menu?.id ?? opcion.grupo_menu_id;
    if (result[groupId]) {
      result[groupId].push(opcion);
    } else {
      result[groupId] = [opcion];
    }
  }
  return result;
}

function findContainerForItem(
  containers: Record<number, OpcionMenuResource[]>,
  itemId: number
): number | null {
  for (const [groupId, items] of Object.entries(containers)) {
    if (items.some((item) => item.id === itemId)) {
      return Number(groupId);
    }
  }
  return null;
}

function KanbanCard({
  opcion,
  isDragOverlay = false,
}: {
  opcion: OpcionMenuResource;
  isDragOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: opcion.id,
    disabled: !!opcion.deleted_at,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-background border rounded-lg p-2.5 flex items-center gap-2 shadow-sm select-none touch-none",
        !opcion.deleted_at && !isDragOverlay && "cursor-grab active:cursor-grabbing",
        isDragging && !isDragOverlay && "opacity-40 border-dashed",
        isDragOverlay && "shadow-lg rotate-1 cursor-grabbing",
        opcion.deleted_at && "opacity-50 cursor-not-allowed"
      )}
    >
      <GripVertical className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{opcion.nombre}</p>
        <p className="text-xs text-muted-foreground truncate">{opcion.ruta}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
        #{opcion.orden}
      </span>
    </div>
  );
}

function KanbanColumn({
  group,
  items,
}: {
  group: MenuResource;
  items: OpcionMenuResource[];
}) {
  const columnId = `col-${group.id}`;
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  const activeItems = items.filter((i) => !i.deleted_at);

  return (
    <div
      className={cn(
        "shrink-0 w-56 rounded-xl border bg-muted/30 p-3 flex flex-col gap-2 transition-colors",
        isOver && "border-primary/60 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between px-0.5 pb-1 border-b">
        <h3 className="font-semibold text-sm truncate">{group.nombre}</h3>
        <span className="text-xs text-muted-foreground ml-2 shrink-0">
          {activeItems.length}
        </span>
      </div>
      <SortableContext
        id={columnId}
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="flex flex-col gap-1.5 min-h-20">
          {items.map((opcion) => (
            <KanbanCard key={opcion.id} opcion={opcion} />
          ))}
          {items.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground/40 h-18">
              Sin opciones
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface OpcionMenuKanbanProps {
  groups: MenuResource[];
  opciones: OpcionMenuResource[];
  isLoading: boolean;
}

export default function OpcionMenuKanban({
  groups,
  opciones,
  isLoading,
}: OpcionMenuKanbanProps) {
  const queryClient = useQueryClient();
  const [containers, setContainers] = useState<
    Record<number, OpcionMenuResource[]>
  >({});
  const [activeOpcion, setActiveOpcion] = useState<OpcionMenuResource | null>(
    null
  );

  useEffect(() => {
    setContainers(buildContainers(groups, opciones));
  }, [groups, opciones]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const moveMutation = useMutation({
    mutationFn: ({
      id,
      opcion,
      newGroupId,
    }: {
      id: number;
      opcion: OpcionMenuResource;
      newGroupId: number;
    }) =>
      updateOpcionMenu(id, {
        nombre: opcion.nombre,
        ruta: opcion.ruta,
        icono: opcion.icono,
        orden: opcion.orden,
        grupo_menu_id: newGroupId,
      }),
    onSuccess: (_, { opcion, newGroupId }) => {
      queryClient.invalidateQueries({
        queryKey: [OPCION_MENU_QUERY_KEY, opcion.grupo_menu_id],
      });
      queryClient.invalidateQueries({
        queryKey: [OPCION_MENU_QUERY_KEY, newGroupId],
      });
      queryClient.invalidateQueries({ queryKey: [OPCION_MENU_QUERY_KEY] });
      successToast(`"${opcion.nombre}" movido correctamente.`);
    },
    onError: (error: any) => {
      setContainers(buildContainers(groups, opciones));
      errorToast(
        error.response?.data?.message ?? "Error al mover la opción de menú."
      );
    },
  });

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as number;
    const sourceGroupId = findContainerForItem(containers, id);
    if (sourceGroupId !== null) {
      const opcion = containers[sourceGroupId].find((o) => o.id === id);
      setActiveOpcion(opcion ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveOpcion(null);
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as string | number;

    const sourceGroupId = findContainerForItem(containers, activeId);
    if (sourceGroupId === null) return;

    let targetGroupId: number;
    if (typeof overId === "string" && overId.startsWith("col-")) {
      targetGroupId = parseInt(overId.replace("col-", ""));
    } else {
      targetGroupId =
        findContainerForItem(containers, overId as number) ?? sourceGroupId;
    }

    if (sourceGroupId === targetGroupId) return;

    const movedOpcion = containers[sourceGroupId].find(
      (o) => o.id === activeId
    );
    if (!movedOpcion) return;

    // Optimistic update
    setContainers((prev) => ({
      ...prev,
      [sourceGroupId]: prev[sourceGroupId].filter((o) => o.id !== activeId),
      [targetGroupId]: [
        ...(prev[targetGroupId] ?? []),
        { ...movedOpcion, grupo_menu_id: targetGroupId },
      ],
    }));

    moveMutation.mutate({
      id: activeId,
      opcion: movedOpcion,
      newGroupId: targetGroupId,
    });
  }

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-3 pt-1">
        {groups.map((group) => (
          <KanbanColumn
            key={group.id}
            group={group}
            items={containers[group.id] ?? []}
          />
        ))}
        {groups.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay grupos de menú.
          </p>
        )}
      </div>
      <DragOverlay>
        {activeOpcion && (
          <KanbanCard opcion={activeOpcion} isDragOverlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}
