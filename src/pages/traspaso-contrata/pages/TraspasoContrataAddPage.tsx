import { useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import TraspasoContrataForm from "../components/TraspasoContrataForm";
import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";

export default function TraspasoContrataAddPage() {
  const navigate = useNavigate();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={TraspasoContrataComplete.MODEL.name}
        mode="create"
        icon="Truck"
        backRoute={TraspasoContrataComplete.ABSOLUTE_ROUTE}
      />
      <TraspasoContrataForm
        mode="create"
        onSuccess={() => navigate(TraspasoContrataComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
