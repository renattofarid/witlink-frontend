import { GeneralModal } from "@/components/GeneralModal";
import { useMenusAllQuery, useOpcionesMenuAllQuery } from "../lib/menu.hook";
import OpcionMenuKanban from "./OpcionMenuKanban";

interface OpcionMenuKanbanModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OpcionMenuKanbanModal({
  open,
  onClose,
}: OpcionMenuKanbanModalProps) {
  const { data: groups, isLoading: isLoadingMenus } = useMenusAllQuery();
  const { data: opciones, isLoading: isLoadingOpciones } =
    useOpcionesMenuAllQuery();

  const isLoading = isLoadingMenus || isLoadingOpciones;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Reorganizar opciones de menú"
      subtitle="Arrastra las opciones entre grupos para reasignarlas"
      icon="Columns3"
      size="full"
    >
      <OpcionMenuKanban
        groups={groups ?? []}
        opciones={opciones ?? []}
        isLoading={isLoading}
      />
    </GeneralModal>
  );
}
