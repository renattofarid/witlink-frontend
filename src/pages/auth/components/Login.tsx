"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { login } from "../lib/auth.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Waypoints } from "lucide-react";

const formSchema = z.object({
  nombre_usuario: z
    .string()
    .nonempty("El usuario no puede estar vacío")
    .max(50, "El usuario no puede tener más de 50 caracteres"),
  contraseña: z
    .string()
    .nonempty("La contraseña no puede estar vacía")
    .max(50, "La contraseña no puede tener más de 50 caracteres"),
});

export default function LoginPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_usuario: "",
      contraseña: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await login({
        nombre_usuario: data.nombre_usuario,
        contraseña: data.contraseña,
      });
      successToast("Inicio de sesión exitoso");
      navigate("/inicio");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error al iniciar sesión.";
      console.error("Detalles del error:", errorMessage);
      errorToast(errorMessage ?? "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex size-8 items-center justify-center rounded-md">
                  <Waypoints className="size-6" />
                </div>
                <span className="sr-only">
                  Witlink - Plataforma de gestión de recursos y módulos
                </span>
              </a>
              <h1 className="text-xl font-bold">Bienvenido a Witlink.</h1>
              <FieldDescription>
                Inicia sesión con tu cuenta para acceder a tus módulos.
              </FieldDescription>
            </div>
            <div>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid w-full gap-6"
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="nombre_usuario">Usuario</FieldLabel>
                    <Input
                      id="nombre_usuario"
                      type="text"
                      placeholder="Usuario o correo electrónico"
                      {...form.register("nombre_usuario")}
                    />
                    {form.formState.errors.nombre_usuario && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.nombre_usuario.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="contraseña">Contraseña</FieldLabel>
                    </div>
                    <Input
                      id="contraseña"
                      type="password"
                      {...form.register("contraseña")}
                    />
                    {form.formState.errors.contraseña && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.contraseña.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <Button type="submit" disabled={isLoading} tabIndex={-1}>
                      {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                    <FieldDescription className="text-center">
                      Si no tienes una cuenta, contacta a tu administrador.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
