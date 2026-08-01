import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Archive } from "lucide-react";
import GuiaForm from "../components/GuiaForm";
import GuiaEquipoRetiradoForm from "../components/GuiaEquipoRetiradoForm";
import { GuiaComplete } from "../lib/guia.constants";
import { useGuiaDraftStore } from "../lib/guia-draft.store";

export default function GuiaAddPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeTab: storedTab, setActiveTab, clearDrafts } = useGuiaDraftStore();

  // URL param takes priority on first mount, then store controls the tab
  const urlTab = searchParams.get("tipo");
  const [activeTab, setActiveTabLocal] = useState<"almacen" | "equipo_retirado">(() => {
    if (urlTab === "equipo_retirado" || urlTab === "almacen") return urlTab;
    return storedTab;
  });

  const handleTabChange = (v: string) => {
    const tab = v as "almacen" | "equipo_retirado";
    setActiveTabLocal(tab);
    setActiveTab(tab);
  };

  const handleSuccess = () => {
    clearDrafts();
    navigate(GuiaComplete.ABSOLUTE_ROUTE);
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Ingreso"
        mode="create"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-fit gap-2 px-2">
          <TabsTrigger value="almacen" className="flex-1 px-4">
            <ClipboardList className="size-3.5 mr-1.5" />
            Almacén
          </TabsTrigger>
          <TabsTrigger value="equipo_retirado" className="flex-1 px-4">
            <Archive className="size-3.5 mr-1.5" />
            Equipo Retirado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="almacen" className="pt-4">
          <GuiaForm mode="create" onSuccess={handleSuccess} />
        </TabsContent>

        <TabsContent value="equipo_retirado" className="pt-4">
          <GuiaEquipoRetiradoForm mode="create" onSuccess={handleSuccess} />
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
}
