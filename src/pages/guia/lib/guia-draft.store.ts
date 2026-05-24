import { create } from "zustand";
import type { GuiaCreateFormValues, ProductoFormValues } from "./guia.schema";

type GuiaAlmacenDraft = Omit<GuiaCreateFormValues, "archivo">;

type GuiaEquipoRetiradoDraft = {
  sot: string;
  tipo: string;
  fecha: string;
  productos: ProductoFormValues[];
};

interface GuiaDraftState {
  activeTab: "almacen" | "equipo_retirado";
  almacenDraft: GuiaAlmacenDraft | null;
  equipoRetiradoDraft: GuiaEquipoRetiradoDraft | null;
  setActiveTab: (tab: "almacen" | "equipo_retirado") => void;
  setAlmacenDraft: (draft: GuiaAlmacenDraft | null) => void;
  setEquipoRetiradoDraft: (draft: GuiaEquipoRetiradoDraft | null) => void;
  clearDrafts: () => void;
}

export const useGuiaDraftStore = create<GuiaDraftState>((set) => ({
  activeTab: "almacen",
  almacenDraft: null,
  equipoRetiradoDraft: null,
  setActiveTab: (activeTab) => set({ activeTab }),
  setAlmacenDraft: (almacenDraft) => set({ almacenDraft }),
  setEquipoRetiradoDraft: (equipoRetiradoDraft) => set({ equipoRetiradoDraft }),
  clearDrafts: () => set({ almacenDraft: null, equipoRetiradoDraft: null }),
}));
