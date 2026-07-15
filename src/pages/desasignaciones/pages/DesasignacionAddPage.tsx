import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import DesasignacionForm from "../components/DesasignacionForm";
import { DesasignacionComplete } from "../lib/desasignacion.constants";

export default function DesasignacionAddPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(DesasignacionComplete.ABSOLUTE_ROUTE);
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title={DesasignacionComplete.MODEL.name}
        mode="create"
        icon="Undo2"
        backRoute={DesasignacionComplete.ABSOLUTE_ROUTE}
      />
      <DesasignacionForm onSuccess={handleSuccess} />
    </FormWrapper>
  );
}
