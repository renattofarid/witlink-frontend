"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/lib/config";
import { Sheet, FileDown } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonsProps {
  excelEndpoint?: string;
  pdfEndpoint?: string;
  excelFileName?: string;
  pdfFileName?: string;
  variant?: "grouped" | "separate" | "detail";
  params?: Record<string, string>;
  excelResponseFormat?: "blob" | "base64";
}

export default function ExportButtons({
  excelEndpoint,
  pdfEndpoint,
  excelFileName = "export.xlsx",
  pdfFileName = "export.pdf",
  variant = "grouped",
  params,
  excelResponseFormat = "blob",
}: ExportButtonsProps) {
  const handleExcelDownload = async () => {
    if (!excelEndpoint) return;

    try {
      if (excelResponseFormat === "base64") {
        const { data } = await api.get(excelEndpoint, { params });
        const binary = atob(data.file_base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: data.mime_type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.file_name ?? excelFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const response = await api.get(excelEndpoint, {
          responseType: "blob",
          params,
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", excelFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      toast.success("Excel descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      toast.error("Error al descargar el archivo Excel");
    }
  };

  const handlePDFDownload = async () => {
    if (!pdfEndpoint) return;

    try {
      const response = await api.get(pdfEndpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", pdfFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      toast.error("Error al descargar el archivo PDF");
    }
  };

  if (variant === "grouped") {
    return (
      <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-800">
        {excelEndpoint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="px-2 hover:bg-green-700/5 hover:text-green-700 dark:hover:bg-primary dark:hover:text-white transition-colors"
                onClick={handleExcelDownload}
              >
                <Sheet className="size-4" />
                Excel
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar Excel</p>
            </TooltipContent>
          </Tooltip>
        )}

        {pdfEndpoint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="px-2 hover:bg-red-700/5 hover:text-red-700 transition-colors"
                onClick={handlePDFDownload}
              >
                <FileDown className="size-4" />
                PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar PDF</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Variant "detail" - botones con texto y tamaño normal para vistas de detalle
  if (variant === "detail") {
    return (
      <>
        {excelEndpoint && (
          <Button variant="outline" onClick={handleExcelDownload}>
            <Sheet className="size-4" />
            Excel
          </Button>
        )}
        {pdfEndpoint && (
          <Button variant="outline" onClick={handlePDFDownload}>
            <FileDown className="size-4" />
            PDF
          </Button>
        )}
      </>
    );
  }

  // Variant "separate" - botones individuales solo ícono para columnas de tabla
  return (
    <>
      {excelEndpoint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="px-2 h-8 w-8 p-0 hover:bg-green-700/5 hover:text-green-700 transition-colors"
              onClick={handleExcelDownload}
            >
              <Sheet className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar Excel</p>
          </TooltipContent>
        </Tooltip>
      )}

      {pdfEndpoint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="px-2 h-8 w-8 p-0 hover:bg-red-700/5 hover:text-red-700 transition-colors"
              onClick={handlePDFDownload}
            >
              <FileDown className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar PDF</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
