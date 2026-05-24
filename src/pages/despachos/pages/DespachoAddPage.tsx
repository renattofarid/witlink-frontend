import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import DespachoForm from "../components/DespachoForm";
import { DespachoComplete } from "../lib/despacho.constants";

export default function DespachoAddPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(DespachoComplete.ABSOLUTE_ROUTE);
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title={DespachoComplete.MODEL.name}
        mode="create"
        icon="List"
        backRoute={DespachoComplete.ABSOLUTE_ROUTE}
      />
      <DespachoForm onSuccess={handleSuccess} />
    </FormWrapper>
  );
}
