import { useState } from "react";
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
import { deleteProducto, restoreProducto } from "../lib/producto.actions";
import { ProductoComplete } from "../lib/producto.constants";
import { getProductoColumns } from "../components/ProductoColumns";
import ProductoFilters from "../components/ProductoFilters";
import ProductoButtons from "../components/ProductoButtons";
import ProductoModal from "../components/ProductoModal";
import type { ProductoResource } from "../lib/producto.interface";

export default function ProductoPage() {
  const queryClient = useQueryClient();

  const [params, setParams] = useState<Record<string, string>>({
    pagina: "1",
    por_pagina: String(DEFAULT_PER_PAGE),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ProductoResource | null>(null);

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

  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ProductoComplete.QUERY_KEY] });
      successToast("Producto restaurado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          ERROR_MESSAGE(ProductoComplete.MODEL, "restore"),
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

  const handleRestore = (row: ProductoResource) => {
    restoreMutation.mutate(row.id);
  };

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, pagina: String(page) }));

  const handlePerPageChange = (perPage: number) =>
    setParams((prev) => ({
      ...prev,
      por_pagina: String(perPage),
      pagina: "1",
    }));

  const handleSearchChange = (value: string) =>
    setParams((prev) => ({ ...prev, search: value, pagina: "1" }));

  const columns = getProductoColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
  });

  return (
    <PageWrapper>
      <TitleComponent
        title={ProductoComplete.MODEL.plural ?? ProductoComplete.MODEL.name}
        subtitle="Gestión de productos del inventario"
        icon="Box"
      >
        <ActionsWrapper>
          <ProductoButtons onAdd={handleAdd} />
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
        />
      </DataTable>

      <DataTablePagination
        page={Number(params.pagina)}
        per_page={Number(params.por_pagina)}
        totalPages={data?.last_page ?? 1}
        totalData={data?.total ?? 0}
        onPageChange={handlePageChange}
        setPerPage={handlePerPageChange}
      />

      <ProductoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={mode}
        selected={selected}
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
