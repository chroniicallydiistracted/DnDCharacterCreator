import { create } from 'zustand';

interface UiState {
  // Source filter (empty = all sources shown)
  activeSourceFilters: string[];
  setSourceFilters: (filters: string[]) => void;
  toggleSourceFilter: (source: string) => void;

  // Search text per context
  searchText: Record<string, string>;
  setSearchText: (context: string, text: string) => void;

  // Modal
  modal: { type: string; data?: unknown } | null;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;

  // Sheet active tab
  sheetTab: 'features' | 'spells' | 'equipment' | 'notes';
  setSheetTab: (tab: UiState['sheetTab']) => void;

  // Preview entity
  previewKey: string | null;
  setPreview: (key: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeSourceFilters: [],
  setSourceFilters: (filters) => set({ activeSourceFilters: filters }),
  toggleSourceFilter: (source) => set(s => ({
    activeSourceFilters: s.activeSourceFilters.includes(source)
      ? s.activeSourceFilters.filter(f => f !== source)
      : [...s.activeSourceFilters, source],
  })),

  searchText: {},
  setSearchText: (context, text) => set(s => ({
    searchText: { ...s.searchText, [context]: text },
  })),

  modal: null,
  openModal:  (type, data) => set({ modal: { type, data } }),
  closeModal: ()            => set({ modal: null }),

  sheetTab: 'features',
  setSheetTab: (tab) => set({ sheetTab: tab }),

  previewKey: null,
  setPreview: (key) => set({ previewKey: key }),
}));
