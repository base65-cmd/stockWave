import { create } from "zustand";

const useSidebarStore = create((set) => ({
  isOpen: true,
  activeMenu: 0,
  toggle: () =>
    set((state) => {
      const newState = !state.isOpen;
      return { isOpen: newState };
    }),
  setActiveMenu: (index) => set({ activeMenu: index }),
  clearActiveMenu: () => set({ activeMenu: null }),
}));

export default useSidebarStore;
