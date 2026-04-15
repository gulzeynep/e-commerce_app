import { create } from 'zustand';

interface AppState {
  userIdInput: string;
  activeUserId: string | null;
  activeView: 'home' | 'catalog' | 'general';
  catalog: Record<string, string[]>;
  refreshTrigger: number;
  
  setUserIdInput: (id: string) => void;
  setActiveUserId: (id: string | null) => void;
  setActiveView: (view: 'home' | 'catalog' | 'general') => void;
  setCatalog: (catalogData: Record<string, string[]>) => void;
  triggerRefresh: () => void;
}

export const useStore = create<AppState>((set) => ({
  userIdInput: "",
  activeUserId: null, 
  activeView: 'home', 
  catalog: {},
  refreshTrigger: 0,
  
  setUserIdInput: (id) => set({ userIdInput: id }),
  setActiveUserId: (id) => set({ activeUserId: id }),
  setActiveView: (view) => set({ activeView: view }),
  setCatalog: (catalogData) => set({ catalog: catalogData }),
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));