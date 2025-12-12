/**
 * PrismSplit Bills Store
 * 
 * Manages bills, items, splits, and related state.
 */

import { create } from 'zustand';

import type { Bill, BillItem, ItemSplit, BillStatus, Category } from '@/types/models';
import { demoBills, demoBillItems } from '@/lib/api/demo';

interface BillDraft {
  title: string;
  groupId: string;
  category: Category;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  tax: number;
  tip: number;
}

interface BillsState {
  // State
  bills: Bill[];
  billItems: Record<string, BillItem[]>; // billId -> items
  currentBill: Bill | null;
  draft: BillDraft | null;
  selectedItems: Set<string>; // For self-select flow
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBillsByGroup: (groupId: string) => Promise<void>;
  fetchBillById: (id: string) => Promise<void>;
  fetchBillItems: (billId: string) => Promise<void>;
  createBill: (draft: BillDraft) => Promise<Bill>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  
  // Draft management
  initDraft: (groupId: string) => void;
  updateDraft: (updates: Partial<BillDraft>) => void;
  addDraftItem: () => void;
  updateDraftItem: (index: number, updates: Partial<BillDraft['items'][0]>) => void;
  removeDraftItem: (index: number) => void;
  clearDraft: () => void;

  // Self-select actions
  toggleItemSelection: (itemId: string) => void;
  confirmSelections: (billId: string) => Promise<void>;
  clearSelections: () => void;
  
  setCurrentBill: (bill: Bill | null) => void;
}

export const useBillsStore = create<BillsState>((set, get) => ({
  // Initial state
  bills: [],
  billItems: {},
  currentBill: null,
  draft: null,
  selectedItems: new Set(),
  isLoading: false,
  error: null,

  // Fetch bills for a group
  fetchBillsByGroup: async (groupId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const groupBills = demoBills.filter(b => b.group_id === groupId);
      set({ bills: groupBills, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch bills', isLoading: false });
    }
  },

  // Fetch single bill
  fetchBillById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const bill = demoBills.find(b => b.id === id);
      if (bill) {
        set({ currentBill: bill, isLoading: false });
      } else {
        set({ error: 'Bill not found', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch bill', isLoading: false });
    }
  },

  // Fetch bill items
  fetchBillItems: async (billId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      set(state => ({
        billItems: { ...state.billItems, [billId]: demoBillItems }
      }));
    } catch (error) {
      console.error('Failed to fetch bill items:', error);
    }
  },

  // Create new bill
  createBill: async (draft: BillDraft) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const subtotal = draft.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal + draft.tax + draft.tip;
      
      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        group_id: draft.groupId,
        title: draft.title,
        category: draft.category,
        total_amount: total,
        tax_amount: draft.tax,
        tip_amount: draft.tip,
        your_share: 0,
        status: 'draft',
        bill_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        payer: {
          id: 'current-user',
          full_name: 'You',
        },
        participant_avatars: [],
      };
      
      set(state => ({
        bills: [newBill, ...state.bills],
        isLoading: false,
        draft: null,
      }));
      
      return newBill;
    } catch (error) {
      set({ error: 'Failed to create bill', isLoading: false });
      throw error;
    }
  },

  // Update bill
  updateBill: async (id: string, updates: Partial<Bill>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b),
        currentBill: state.currentBill?.id === id 
          ? { ...state.currentBill, ...updates }
          : state.currentBill,
      }));
    } catch (error) {
      set({ error: 'Failed to update bill' });
    }
  },

  // Delete bill (soft delete)
  deleteBill: async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        bills: state.bills.filter(b => b.id !== id),
        currentBill: state.currentBill?.id === id ? null : state.currentBill,
      }));
    } catch (error) {
      set({ error: 'Failed to delete bill' });
    }
  },

  // Initialize draft for new bill
  initDraft: (groupId: string) => {
    set({
      draft: {
        title: '',
        groupId,
        category: 'groceries',
        items: [{ id: '1', name: '', price: 0, quantity: 1 }],
        tax: 0,
        tip: 0,
      },
    });
  },

  // Update draft
  updateDraft: (updates: Partial<BillDraft>) => {
    const { draft } = get();
    if (draft) {
      set({ draft: { ...draft, ...updates } });
    }
  },

  // Add item to draft
  addDraftItem: () => {
    const { draft } = get();
    if (draft) {
      set({
        draft: {
          ...draft,
          items: [
            ...draft.items,
            { id: String(draft.items.length + 1), name: '', price: 0, quantity: 1 }
          ],
        },
      });
    }
  },

  // Update draft item
  updateDraftItem: (index: number, updates: Partial<BillDraft['items'][0]>) => {
    const { draft } = get();
    if (draft) {
      const items = [...draft.items];
      items[index] = { ...items[index], ...updates };
      set({ draft: { ...draft, items } });
    }
  },

  // Remove draft item
  removeDraftItem: (index: number) => {
    const { draft } = get();
    if (draft && draft.items.length > 1) {
      const items = draft.items.filter((_, i) => i !== index);
      set({ draft: { ...draft, items } });
    }
  },

  // Clear draft
  clearDraft: () => {
    set({ draft: null });
  },

  // Toggle item selection (for self-select)
  toggleItemSelection: (itemId: string) => {
    set(state => {
      const newSet = new Set(state.selectedItems);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return { selectedItems: newSet };
    });
  },

  // Confirm selections
  confirmSelections: async (billId: string) => {
    const { selectedItems } = get();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // In real app, would send selections to API
      console.log('Confirmed selections for bill', billId, Array.from(selectedItems));
      set({ selectedItems: new Set() });
    } catch (error) {
      set({ error: 'Failed to save selections' });
    }
  },

  // Clear selections
  clearSelections: () => {
    set({ selectedItems: new Set() });
  },

  // Set current bill
  setCurrentBill: (bill: Bill | null) => {
    set({ currentBill: bill });
  },
}));
