import GeneralSheet from "@/components/GeneralSheet";
import { DataTable } from "@/components/DataTable";
import { useKardexQuery } from "@/pages/kardex/lib/kardex.hook";
import { getKardexColumns } from "@/pages/kardex/components/KardexColumns";
import { Loader2 } from "lucide-react";
import DataTablePagination from "@/components/DataTablePagination";
import { useState } from "react";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

export interface HistorialMaterialSummary {
  producto_id?: number;
  sap: string;
  producto: string;
  almacen_id?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  material: HistorialMaterialSummary | null;
}

const columns = getKardexColumns();

export default function InventarioMaterialHistorialSheet({
  open,
  onClose,
  material,
}: Props) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  const { data, isLoading } = useKardexQuery({
    ...(open && material?.producto_id ? { producto_id: String(material.producto_id) } : {}),
    ...(open && material?.almacen_id && !material.almacen_id.includes(",") ? { almacen_id: material.almacen_id } : {}),
    page: String(page),
    per_page: String(perPage),
  });

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={`Historial de Material`}
      subtitle={material ? `${material.sap} · ${material.producto}` : undefined}
      icon="History"
      size="5xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data || !data.data.length ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Sin información de trazabilidad.
        </p>
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={data.data}
            variant="simple"
            isVisibleColumnFilter={false}
          />
          <DataTablePagination
            page={page}
            per_page={perPage}
            totalPages={data.meta.last_page}
            totalData={data.meta.total}
            onPageChange={setPage}
            setPerPage={(v) => {
              setPerPage(v);
              setPage(1);
            }}
          />
        </div>
      )}
    </GeneralSheet>
  );
}
