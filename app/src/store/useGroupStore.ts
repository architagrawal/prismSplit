import { create } from 'zustand';

interface GroupStore {
  currentGroupId: string | null;
  setCurrentGroupId: (id: string | null) => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  currentGroupId: null,
  setCurrentGroupId: (id) => set({ currentGroupId: id }),
}));
