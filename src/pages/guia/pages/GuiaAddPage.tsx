import { useNavigate, useSearchParams } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Archive } from "lucide-react";
import GuiaForm from "../components/GuiaForm";
import GuiaEquipoRetiradoForm from "../components/GuiaEquipoRetiradoForm";
import { GuiaComplete } from "../lib/guia.constants";

export default function GuiaAddPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab =
    searchParams.get("tipo") === "equipo_retirado" ? "equipo_retirado" : "almacen";

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Nueva guía"
        mode="create"
        icon="ClipboardList"
        backRoute={GuiaComplete.ABSOLUTE_ROUTE}
      />
      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full">
          <TabsTrigger value="almacen" className="flex-1">
            <ClipboardList className="size-3.5 mr-1.5" />
            Almacén
          </TabsTrigger>
          <TabsTrigger value="equipo_retirado" className="flex-1">
            <Archive className="size-3.5 mr-1.5" />
            Equipo Retirado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="almacen" className="pt-4">
          <GuiaForm
            mode="create"
            onSuccess={() => navigate(GuiaComplete.ABSOLUTE_ROUTE)}
          />
        </TabsContent>

        <TabsContent value="equipo_retirado" className="pt-4">
          <GuiaEquipoRetiradoForm
            mode="create"
            onSuccess={() => navigate(GuiaComplete.ABSOLUTE_ROUTE)}
          />
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
}
