import { toast } from "sonner";
import type { Action, ModelInterface } from "./core.interface";
import { ACTIONS, ACTIONS_NAMES } from "./core.constants";

export const successToast = (
  body: string,
  description: string = new Date().toLocaleString(),
) => {
  return toast.success(body, {
    description,
    action: {
      label: "Listo",
      onClick: () => toast.dismiss(),
    },
  });
};

export const errorToast = (
  body: string = "Error",
  description: string = new Date().toLocaleString(),
) => {
  return toast.error(body, {
    description,
    action: {
      label: "Cerrar",
      onClick: () => toast.dismiss(),
    },
  });
};

export const warningToast = (
  body: string,
  description: string = new Date().toLocaleString(),
) => {
  return toast.warning(body, {
    description,
    action: {
      label: "Entendido",
      onClick: () => toast.dismiss(),
    },
  });
};

export const infoToast = (
  body: string,
  description: string = new Date().toLocaleString(),
) => {
  return toast.info(body, {
    description,
    action: {
      label: "Ok",
      onClick: () => toast.dismiss(),
    },
  });
};

export const loadingToast = (body: string = "Cargando...") => {
  return toast.loading(body);
};

export const getApiErrorMessage = (
  error: any,
  fallback = "OcurriÃ³ un error inesperado.",
): string => {
  const data = error?.response?.data;
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (data?.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
    if (first) return String(first);
  }

  if (typeof data === "string" && data.trim() && !data.includes("<html")) {
    return data.trim().slice(0, 500);
  }

  const status = error?.response?.status;
  if (status === 413) {
    return "La guÃ­a contiene demasiados datos o el archivo supera el lÃ­mite permitido por el servidor.";
  }
  if (status) {
    return `${fallback} (HTTP ${status})`;
  }
  if (error?.code === "ECONNABORTED") {
    return "El servidor tardÃ³ demasiado en procesar la guÃ­a.";
  }
  if (typeof error?.message === "string" && error.message !== "Network Error") {
    return error.message;
  }

  return "No se pudo conectar con el servidor. Verifica la conexiÃ³n e intÃ©ntalo nuevamente.";
};

export const promiseToast = <T>(
  promise: Promise<T>,
  messages: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
  } = {},
) => {
  return toast.promise(promise, {
    loading: messages.loading ?? "Procesando...",
    success: messages.success ?? "Operación exitosa",
    error: messages.error ?? "Ocurrió un error",
  });
};

export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const objectToFormData = (obj: any) => {
  const formData = new FormData();
  for (const key in obj) {
    formData.append(key, obj[key]);
  }
  return formData;
};

export const SUCCESS_MESSAGE: (
  { name, gender }: ModelInterface,
  action: Action,
) => string = ({ name, gender = true }, action) =>
  `${name} ${ACTIONS_NAMES[action]}${gender ? "a" : "o"} correctamente.`;

export const ERROR_MESSAGE: (
  { name, gender }: ModelInterface,
  action: Action,
) => string = ({ name, gender = true }, action) =>
  `Error al ${ACTIONS[action]} ${gender ? "la" : "el"} ${name}.`;

export const  SUBTITLE: ({ name }: ModelInterface, action: Action) => string = (
  { name },
  action,
) =>
  `${ACTIONS[action].charAt(0).toUpperCase() + ACTIONS[action].slice(1)} ${name.toLowerCase()}.`;
