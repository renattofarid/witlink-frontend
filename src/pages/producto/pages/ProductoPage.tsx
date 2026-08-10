import { useState } from "react";
import { useTabParams } from "@/hooks/useTabParams";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import TitleComponent from "@/components/TitleComponent";
import ActionsWrapper from "@/components/ActionsWrapper";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast, ERROR_MESSAGE } from "@/lib/core.function";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useProductoQuery } from "../lib/producto.hook";
import { deleteProducto } from "../lib/producto.actions";
import { ProductoComplete } from "../lib/producto.constants";
import { getProductoColumns } from "../components/ProductoColumns";
import ProductoFilters from "../components/ProductoFilters";
import ProductoButtons from "../components/ProductoButtons";
import ProductoModal from "../components/ProductoModal";
import EquipoRetiradoModal from "../components/EquipoRetiradoModal";
import ImportarSapDialog from "../components/ImportarSapDialog";
import type { ProductoResource } from "../lib/producto.interface";

export default function ProductoPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useTabParams(ProductoComplete.ABSOLUTE_ROUTE, {
    page: "1",
    per_page: String(DEFAULT_PER_PAGE),
    tipo: "",
    search: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ProductoResource | null>(null);
  const [retiroOpen, setRetiroOpen] = useState(false);
  const [importarSapOpen, setImportarSapOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ProductoResource | null>(null);

  const { data, isLoading } = useProductoQuery(params);

  const deleteMutation = useMutation({
    mutationFn: () => deleteProducto(toDelete!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ProductoComplete.QUERY_KEY] });
      successToast("Producto eliminado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(ProductoComplete.MODEL, "delete"),
      );
    },
  });

  const handleAdd = () => {
    setSelected(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (row: ProductoResource) => {
    setSelected(row);
    setMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: ProductoResource) => {
    setToDelete(row);
    setDeleteOpen(true);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({ ...prev, per_page: String(perPage), page: "1" }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, page: "1" }));

  const handleTypeChange = (value: string) =>
    setParams((prev) => ({ ...prev, tipo: value, page: "1" }));

  const columns = getProductoColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={ProductoComplete.MODEL.plural ?? ProductoComplete.MODEL.name}
        subtitle="Gestión de productos del inventario"
        icon="Box"
      >
        <ActionsWrapper>
          <ProductoButtons
            onAdd={handleAdd}
            onRetiro={() => setRetiroOpen(true)}
            onImportarSap={() => setImportarSapOpen(true)}
          />
        </ActionsWrapper>
      </TitleComponent>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
      >
        <ProductoFilters
          search={params.search ?? ""}
          onSearchChange={handleSearchChange}
          type={params.tipo ?? ""}
          onTypeChange={handleTypeChange}
        />
      </DataTable>

      <DataTablePagination
        page={Number(params.page)}
        per_page={Number(params.per_page)}
        totalPages={data?.meta.last_page ?? 1}
        totalData={data?.meta.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />

      <ProductoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
      />

      <EquipoRetiradoModal
        open={retiroOpen}
        onClose={() => setRetiroOpen(false)}
      />

      <ImportarSapDialog
        open={importarSapOpen}
        onClose={() => setImportarSapOpen(false)}
      />

      <SimpleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar Producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
    </PageWrapper>
  );
}
