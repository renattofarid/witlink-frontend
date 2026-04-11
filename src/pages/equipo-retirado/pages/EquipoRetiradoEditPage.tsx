import { useParams, useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import EquipoRetiradoForm from "../components/EquipoRetiradoForm";
import { EquipoRetiradoComplete } from "../lib/equipo-retirado.constants";
import { useEquipoRetiradoDetailQuery } from "../lib/equipo-retirado.hook";

export default function EquipoRetiradoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: equipoRetirado, isLoading } = useEquipoRetiradoDetailQuery(
    id ? Number(id) : null,
  );

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="text-muted-foreground text-sm">Cargando...</div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <TitleFormComponent
        title={EquipoRetiradoComplete.MODEL.name}
        mode="edit"
        icon="List"
        backRoute={EquipoRetiradoComplete.ABSOLUTE_ROUTE}
      />
      <EquipoRetiradoForm
        mode="edit"
        equipoRetirado={equipoRetirado}
        onSuccess={() => navigate(EquipoRetiradoComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
