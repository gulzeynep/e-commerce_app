import { create } from 'zustand';

interface AppState {
  userId: string;
  catalog: Record<string, string[]>;
  refreshTrigger: number;
  
  setUserId: (id: string) => void;
  setCatalog: (catalogData: Record<string, string[]>) => void;
  triggerRefresh: () => void;
}

export const useStore = create<AppState>((set) => ({
  userId: "user-1",
  catalog: {},
  refreshTrigger: 0,
  
  setUserId: (id) => set({ userId: id }),
  setCatalog: (catalogData) => set({ catalog: catalogData }),
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));