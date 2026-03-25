import { GeneralModal } from "@/components/GeneralModal";
import { useMenuQuery } from "../lib/menu.hook";
import { useOpcionesMenuAllQuery } from "../lib/menu.hook";
import OpcionMenuKanban from "./OpcionMenuKanban";

interface OpcionMenuKanbanModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OpcionMenuKanbanModal({
  open,
  onClose,
}: OpcionMenuKanbanModalProps) {
  const { data: menusData, isLoading: isLoadingMenus } = useMenuQuery({
    all: "true",
  });
  const { data: opciones, isLoading: isLoadingOpciones } =
    useOpcionesMenuAllQuery();

  const groups = menusData?.data ?? [];
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
        groups={groups}
        opciones={opciones ?? []}
        isLoading={isLoading}
      />
    </GeneralModal>
  );
}
