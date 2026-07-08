import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useTecnicoDespachoQuery } from "@/pages/despachos/lib/despacho.hook";
import type { PersonaResource } from "@/pages/persona/lib/persona.interface";

interface TecnicoSelectorProps {
  value: string;
  onChange: (id: string, nombre: string) => void;
  onNameResolved?: (nombre: string) => void;
  placeholder?: string;
}

export default function TecnicoSelector({
  value,
  onChange,
  onNameResolved,
  placeholder = "Seleccionar técnico...",
}: TecnicoSelectorProps) {
  const form = useForm({ defaultValues: { tecnico_id: value } });
  const tecnicoId = useWatch({ control: form.control, name: "tecnico_id" });

  useEffect(() => {
    if (value !== tecnicoId) {
      form.setValue("tecnico_id", value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <FormSelectAsync
      name="tecnico_id"
      control={form.control}
      placeholder={placeholder}
      useQueryHook={useTecnicoDespachoQuery}
      mapOptionFn={(item: PersonaResource) => ({
        value: String(item.id),
        label: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
        description: item.dni,
      })}
      perPage={20}
      required
      onValueChange={(id, item) => {
        const persona = item as PersonaResource | undefined;
        const nombre = persona
          ? `${persona.nombre} ${persona.apellido_paterno}`
          : "";
        onChange(id, nombre);
        if (nombre) {
          onNameResolved?.(nombre);
        }
      }}
    />
  );
}
