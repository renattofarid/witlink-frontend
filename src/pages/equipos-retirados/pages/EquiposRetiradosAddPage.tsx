import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import EquiposRetiradosForm from "../components/EquiposRetiradosForm";
import { EquiposRetiradosComplete } from "../lib/equipos-retirados.constants";

export default function EquiposRetiradosAddPage() {
  const navigate = useNavigate();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={EquiposRetiradosComplete.MODEL.name}
        mode="create"
        icon="List"
        backRoute={EquiposRetiradosComplete.ABSOLUTE_ROUTE}
      />
      <EquiposRetiradosForm
        mode="create"
        onSuccess={() => navigate(EquiposRetiradosComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
