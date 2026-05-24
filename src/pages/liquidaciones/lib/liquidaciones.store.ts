import { create } from "zustand";
import type { SotSearchResponse, LiquidacionCartItem } from "./liquidaciones.interface";

interface LiquidacionStore {
  // SOT cargada
  currentSot: SotSearchResponse | null;
  sotNotFound: boolean;
  sotSearched: string | null;

  // Carrito de productos a liquidar
  items: LiquidacionCartItem[];

  // Modal de agregar productos
  isProductModalOpen: boolean;

  // Inventario a consultar (dentro del modal)
  selectedInventoryTecnicoId: string;

  // Filtros internos del modal
  materialSearchQuery: string;
  equipmentSearchQuery: string;

  // Valores del formulario guardados entre navegaciones
  savedFormValues: { sot: string; values: Record<string, string> } | null;

  // Acciones SOT
  setCurrentSot: (sot: SotSearchResponse | null) => void;
  setSotNotFound: (v: boolean) => void;
  setSotSearched: (sot: string | null) => void;
  setSavedFormValues: (v: { sot: string; values: Record<string, string> } | null) => void;

  // Acciones carrito
  addItem: (item: LiquidacionCartItem) => void;
  addItems: (items: LiquidacionCartItem[]) => void;
  removeItem: (tempId: string) => void;
  clearItems: () => void;

  // Modal
  openProductModal: () => void;
  closeProductModal: () => void;

  // Inventario
  setSelectedInventoryTecnico: (id: string) => void;

  // Filtros
  setMaterialSearchQuery: (q: string) => void;
  setEquipmentSearchQuery: (q: string) => void;

  // Reset completo
  reset: () => void;
}

const INITIAL: Pick<
  LiquidacionStore,
  | "currentSot"
  | "sotNotFound"
  | "sotSearched"
  | "items"
  | "isProductModalOpen"
  | "selectedInventoryTecnicoId"
  | "materialSearchQuery"
  | "equipmentSearchQuery"
  | "savedFormValues"
> = {
  currentSot: null,
  sotNotFound: false,
  sotSearched: null,
  items: [],
  isProductModalOpen: false,
  selectedInventoryTecnicoId: "",
  materialSearchQuery: "",
  equipmentSearchQuery: "",
  savedFormValues: null,
};

export const useLiquidacionStore = create<LiquidacionStore>((set) => ({
  ...INITIAL,

  setCurrentSot: (sot) => set({ currentSot: sot, sotNotFound: false, items: [] }),
  setSotNotFound: (v) => set({ sotNotFound: v }),
  setSotSearched: (sot) => set({ sotSearched: sot }),
  setSavedFormValues: (v) => set({ savedFormValues: v }),

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  addItems: (newItems) =>
    set((state) => {
      const result = [...state.items];
      for (const newItem of newItems) {
        if (newItem.tipo === "material") {
          const idx = result.findIndex(
            (i) =>
              i.tipo === "material" &&
              i.producto_id === newItem.producto_id &&
              i.tecnico_id === newItem.tecnico_id,
          );
          if (idx !== -1) {
            result[idx] = {
              ...result[idx],
              cantidad: result[idx].cantidad + newItem.cantidad,
            };
          } else {
            result.push(newItem);
          }
        } else {
          result.push(newItem);
        }
      }
      return { items: result };
    }),
  removeItem: (tempId) =>
    set((state) => ({ items: state.items.filter((i) => i.tempId !== tempId) })),
  clearItems: () => set({ items: [] }),

  openProductModal: () => set({ isProductModalOpen: true }),
  closeProductModal: () => set({ isProductModalOpen: false }),

  setSelectedInventoryTecnico: (id) =>
    set({ selectedInventoryTecnicoId: id }),

  setMaterialSearchQuery: (q) => set({ materialSearchQuery: q }),
  setEquipmentSearchQuery: (q) => set({ equipmentSearchQuery: q }),

  reset: () => set({ ...INITIAL }),
}));
