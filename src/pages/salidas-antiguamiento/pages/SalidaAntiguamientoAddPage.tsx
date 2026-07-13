import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import SalidaAntiguamientoForm from "../components/SalidaAntiguamientoForm";
import { SalidaAntiguamientoComplete } from "../lib/salida-antiguamiento.constants";

export default function SalidaAntiguamientoAddPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(SalidaAntiguamientoComplete.ABSOLUTE_ROUTE);
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title={SalidaAntiguamientoComplete.MODEL.name}
        mode="create"
        icon="Archive"
        backRoute={SalidaAntiguamientoComplete.ABSOLUTE_ROUTE}
      />
      <SalidaAntiguamientoForm onSuccess={handleSuccess} />
    </FormWrapper>
  );
}
