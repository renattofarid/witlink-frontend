import { create } from "zustand";

interface InventarioTecnicoFiltersState {
  tecnicoId: string;
  fecha: string;
  setTecnicoId: (id: string) => void;
  setFecha: (fecha: string) => void;
}

export const useInventarioTecnicoFiltersStore =
  create<InventarioTecnicoFiltersState>((set) => ({
    tecnicoId: "",
    fecha: "",
    setTecnicoId: (tecnicoId) => set({ tecnicoId }),
    setFecha: (fecha) => set({ fecha }),
  }));
