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

  // Acciones SOT
  setCurrentSot: (sot: SotSearchResponse | null) => void;
  setSotNotFound: (v: boolean) => void;
  setSotSearched: (sot: string | null) => void;

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
> = {
  currentSot: null,
  sotNotFound: false,
  sotSearched: null,
  items: [],
  isProductModalOpen: false,
  selectedInventoryTecnicoId: "",
  materialSearchQuery: "",
  equipmentSearchQuery: "",
};

export const useLiquidacionStore = create<LiquidacionStore>((set) => ({
  ...INITIAL,

  setCurrentSot: (sot) => set({ currentSot: sot, sotNotFound: false }),
  setSotNotFound: (v) => set({ sotNotFound: v }),
  setSotSearched: (sot) => set({ sotSearched: sot }),

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  addItems: (newItems) =>
    set((state) => ({ items: [...state.items, ...newItems] })),
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
