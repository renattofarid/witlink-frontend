import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTabParams } from "@/hooks/useTabParams";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import FilterWrapper from "@/components/FilterWrapper";
import { SearchableSelect } from "@/components/SearchableSelect";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";
import { useTraspasoContrataQuery } from "../lib/traspaso-contrata.hook";
import { getTraspasoContrataColumns } from "../components/TraspasoContrataColumns";
import TraspasoContrataButtons from "../components/TraspasoContrataButtons";
import TraspasoContrataDetalleSheet from "../components/TraspasoContrataDetalleSheet";
import type { TraspasoContrataResource } from "../lib/traspaso-contrata.interface";
import {
  descargarDocumentoFirmadoTraspaso,
  descargarGuiaTraspasoContrata,
  subirDocumentoFirmadoTraspaso,
} from "../lib/traspaso-contrata.actions";
import { errorToast, successToast } from "@/lib/core.function";

export default function TraspasoContrataPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signedFileInputRef = useRef<HTMLInputElement>(null);
  const signedUploadTargetRef = useRef<TraspasoContrataResource | null>(null);
  const [viewItem, setViewItem] = useState<TraspasoContrataResource | null>(
    null,
  );

  const [params, setParams] = useTabParams(
    TraspasoContrataComplete.ABSOLUTE_ROUTE,
    {
      page: "1",
      per_page: String(DEFAULT_PER_PAGE),
    },
  );

  const { data, isLoading } = useTraspasoContrataQuery(params);

  const requestSignedUpload = (item: TraspasoContrataResource) => {
    signedUploadTargetRef.current = item;
    if (signedFileInputRef.current) {
      signedFileInputRef.current.value = "";
      signedFileInputRef.current.click();
    }
  };

  const handleSignedFile = async (file?: File) => {
    const item = signedUploadTargetRef.current;
    if (!file || !item) return;
    if (file.size > 10 * 1024 * 1024) {
      errorToast("La guía firmada no debe superar los 10 MB.");
      return;
    }
    try {
      const updated = await subirDocumentoFirmadoTraspaso(item.id, file);
      await queryClient.invalidateQueries({
        queryKey: [TraspasoContrataComplete.QUERY_KEY],
      });
      if (viewItem?.id === updated.id) setViewItem(updated);
      successToast(
        item.tiene_documento_firmado
          ? "Guía firmada reemplazada correctamente."
          : "Guía firmada subida correctamente.",
      );
    } catch (error: any) {
      errorToast(
        error.response?.data?.message ?? "No se pudo subir la guía firmada.",
      );
    }
  };

  const downloadSigned = async (item: TraspasoContrataResource) => {
    try {
      await descargarDocumentoFirmadoTraspaso(item);
    } catch {
      errorToast("No se pudo descargar la guía firmada.");
    }
  };

  const columns = getTraspasoContrataColumns({
    onView: (item) => setViewItem(item),
    onEdit: (item) =>
      navigate(`${TraspasoContrataComplete.ROUTE_UPDATE}/${item.id}`),
    onDownload: async (item) => {
      try {
        await descargarGuiaTraspasoContrata(item);
      } catch (error: any) {
        errorToast(
          error.response?.data?.message ??
            "No se pudo descargar la guía de traspaso.",
        );
      }
    },
    onUploadSigned: requestSignedUpload,
    onDownloadSigned: downloadSigned,
  });

  return (
    <PageWrapper>
      <input
        ref={signedFileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(event) => void handleSignedFile(event.target.files?.[0])}
      />
      <TitleComponent
        title={
          TraspasoContrataComplete.MODEL.plural ??
          TraspasoContrataComplete.MODEL.name
        }
        subtitle="Salidas de materiales hacia contratas"
        icon="Truck"
      >
        <ActionsWrapper>
          <TraspasoContrataButtons />
        </ActionsWrapper>
      </TitleComponent>

      <FilterWrapper>
        <SearchableSelect
          placeholder="Regularización"
          options={[
            { value: "all", label: "Todas" },
            { value: "pendiente", label: "Pendiente de guía firmada" },
            { value: "firmada", label: "Guía firmada" },
          ]}
          value={params.estado_firma || "all"}
          onChange={(value) =>
            setParams((prev) => ({
              ...prev,
              estado_firma: value === "all" ? "" : value,
              page: "1",
            }))
          }
        />
      </FilterWrapper>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />

      <DataTablePagination
        page={Number(params.page)}
        per_page={Number(params.per_page)}
        totalPages={data?.meta.last_page ?? 1}
        totalData={data?.meta.total ?? 0}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: String(p) }))}
        setPerPage={(pp) =>
          setParams((prev) => ({ ...prev, per_page: String(pp), page: "1" }))
        }
      />

      <TraspasoContrataDetalleSheet
        item={viewItem}
        onClose={() => setViewItem(null)}
        onDownload={async (item) => {
          try {
            await descargarGuiaTraspasoContrata(item);
          } catch (error: any) {
            errorToast(
              error.response?.data?.message ??
                "No se pudo descargar la guía de traspaso.",
            );
          }
        }}
        onUploadSigned={requestSignedUpload}
        onDownloadSigned={downloadSigned}
      />
    </PageWrapper>
  );
}
