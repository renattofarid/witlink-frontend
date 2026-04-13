import type { Control } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { GuiaCreateFormValues } from "../lib/guia.schema";

interface GuiaDatosSectionProps {
  control: Control<GuiaCreateFormValues>;
}

export function GuiaDatosSection({ control }: GuiaDatosSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
          Datos de la guía
        </h3>
        <Separator className="flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormInput
          name="numero"
          label="Número de guía"
          control={control}
          placeholder="Ej. GR-001"
          required
          uppercase
        />
        <DatePickerFormField
          required
          name="fecha"
          label="Fecha"
          control={control}
          disabledRange={[{ after: new Date() }]}
        />
        <FormInput
          label="Archivo adjunto (opcional)"
          name="file"
          type="file"
          control={control}
          accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
        />
      </div>
    </div>
  );
}
