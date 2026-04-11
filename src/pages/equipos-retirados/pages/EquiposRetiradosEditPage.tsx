import { useParams, useNavigate } from "react-router-dom";
import FormWrapper from "@/components/FormWrapper";
import TitleFormComponent from "@/components/TitleFormComponent";
import EquiposRetiradosForm from "../components/EquiposRetiradosForm";
import { EquiposRetiradosComplete } from "../lib/equipos-retirados.constants";
import { useEquipoRetiradoDetailQuery } from "../lib/equipos-retirados.hook";

export default function EquiposRetiradosEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: equipo, isLoading } = useEquipoRetiradoDetailQuery(
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
        title={EquiposRetiradosComplete.MODEL.name}
        mode="edit"
        icon="List"
        backRoute={EquiposRetiradosComplete.ABSOLUTE_ROUTE}
      />
      <EquiposRetiradosForm
        mode="edit"
        equipo={equipo}
        onSuccess={() => navigate(EquiposRetiradosComplete.ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
