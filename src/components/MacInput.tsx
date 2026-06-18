import { Controller, type Control } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Strip any separators (handles legacy colon-format values stored before this change)
function toRawHex(mac: string): string {
  return mac.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
}

interface MacInputProps {
  name: string;
  label?: string;
  control: Control<any>;
}

export function MacInput({ name, label, control }: MacInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const rawValue = toRawHex(field.value ?? "");

        return (
          <Field className="flex flex-col gap-1">
            {label && (
              <FieldLabel className="text-xs md:text-sm leading-none dark:text-muted-foreground">
                {label}
              </FieldLabel>
            )}
            <InputOTP
              maxLength={12}
              pattern="^[0-9A-Fa-f]*$"
              value={rawValue}
              onChange={(val) =>
                field.onChange(val ? val.toUpperCase() : null)
              }
              onBlur={field.onBlur}
              className="w-full!"
            >
              {[0, 2, 4, 6, 8, 10].map((offset, i) => (
                <>
                  {i > 0 && (
                    <span
                      key={`sep-${i}`}
                      className="text-muted-foreground text-sm select-none"
                    >
                      :
                    </span>
                  )}
                  <InputOTPGroup key={`grp-${offset}`}>
                    <InputOTPSlot index={offset} />
                    <InputOTPSlot index={offset + 1} />
                  </InputOTPGroup>
                </>
              ))}
            </InputOTP>
            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </Field>
        );
      }}
    />
  );
}
