import { useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FileUploadWithCameraProps {
  label?: string;
  accept?: string;
  value?: File | null;
  previewUrl?: string;
  onChange: (file: File | null, previewUrl: string) => void;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  showFileInfo?: boolean;
}

// Cache para URLs de objetos para evitar recrearlas en cada render
const objectUrlCache = new WeakMap<File, string>();

export function FileUploadWithCamera({
  label = "Archivo",
  accept = "image/*,application/pdf",
  value = null,
  previewUrl: externalPreviewUrl = "",
  onChange,
  disabled = false,
  className = "",
  showPreview = true,
  showFileInfo = true,
}: FileUploadWithCameraProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Generar preview URL usando cache para evitar memory leaks
  const internalPreviewUrl = useMemo(() => {
    if (value instanceof File) {
      let url = objectUrlCache.get(value);
      if (!url) {
        url = URL.createObjectURL(value);
        objectUrlCache.set(value, url);
      }
      return url;
    }
    return "";
  }, [value]);

  // Usar preview externa si se proporciona, sino usar la interna
  const previewUrl = externalPreviewUrl || internalPreviewUrl;

  // Detectar si hay cámara disponible
  const hasCameraAvailable = useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined")
      return false;

    // Verificar si existe la API de MediaDevices
    const hasMediaDevices = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    if (!hasMediaDevices) return false;

    // Verificar si es un dispositivo móvil con cámara
    const userAgent = navigator.userAgent || "";
    const isMobileDevice =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      );

    // Solo mostrar opción de cámara en dispositivos móviles
    return isMobileDevice;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localPreviewUrl = URL.createObjectURL(file);
      objectUrlCache.set(file, localPreviewUrl);
      onChange(file, localPreviewUrl);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    onChange(null, "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const isPdfFile = () => {
    return value?.type === "application/pdf";
  };

  const hasFile = value instanceof File || !!previewUrl;

  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <div className="mt-2 space-y-2">
        {hasFile && showPreview ? (
          <>
            <div className="relative">
              {isPdfFile() ? (
                <div className="w-full h-64 rounded border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Archivo PDF seleccionado
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {value?.name}
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-64 object-contain rounded border-2 border-gray-200 bg-gray-50"
                />
              )}
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
                disabled={disabled}
                type="button"
              >
                <X className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
            {showFileInfo && value && (
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted rounded-md">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs sm:text-sm truncate flex-1">
                  {value.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {/* Input oculto para subir archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />

            {/* Input oculto para capturar desde cámara */}
            {hasCameraAvailable && (
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
              />
            )}

            {/* Botones de acción */}
            {hasCameraAvailable ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={disabled}
                  className="h-32 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Subir Archivo</span>
                    <span className="text-xs text-muted-foreground">
                      Desde galería
                    </span>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraClick}
                  disabled={disabled}
                  className="h-32 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Tomar Foto</span>
                    <span className="text-xs text-muted-foreground">
                      Usar cámara
                    </span>
                  </div>
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                disabled={disabled}
                className="w-full h-32 border-2 border-dashed"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Subir Archivo</span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG o PDF
                  </span>
                </div>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
