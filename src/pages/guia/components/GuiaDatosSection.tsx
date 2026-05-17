import { Controller, type Control } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import { Input } from "@/components/ui/input";
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
        <Controller
          name="archivo"
          control={control}
          render={({ field: { onChange, value: _value, ...field } }) => (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Archivo adjunto (opcional)
              </label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                {...field}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
