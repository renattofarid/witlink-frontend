import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import EquipoRetiradoForm from "../components/EquipoRetiradoForm";
import { EquipoRetiradoComplete } from "../lib/equipo-retirado.constants";

export default function EquipoRetiradoAddPage() {
  const navigate = useNavigate();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={EquipoRetiradoComplete.MODEL.name}
        mode="create"
        icon="List"
        backRoute={EquipoRetiradoComplete.ABSOLUTE_ROUTE}
      />
      <EquipoRetiradoForm
        mode="create"
        onSuccess={() => navigate(EquipoRetiradoComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
