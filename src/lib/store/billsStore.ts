/**
 * PrismSplit Bills Store
 * 
 * Manages bills, items, splits, and related state.
 */

import { create } from 'zustand';

import type { Bill, BillItem, ItemSplit, Category, BillItemWithSplits } from '@/types/models';
import { demoBills, demoBillItems, demoGroupMembers } from '@/lib/api/demo';

interface BillDraft {
  title: string;
  groupId: string;
  category: Category;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    discount?: number;
  }>;
  tax: number;
  tip: number;
  discount?: number; // Overall discount
  tax_split_mode?: 'equal' | 'proportional';
  tip_split_mode?: 'equal' | 'proportional';
  participantIds?: string[]; // IDs of users involved in the split (for simple mode)
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
  updateBillItems: (billId: string, items: { name: string; price: number; quantity: number; discount?: number }[]) => Promise<void>;
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
      
      let rawItems = demoBillItems.filter(i => i.bill_id === billId);

      
      // FALLBACK: If no items found for this bill (e.g. demo bills other than bill-1),
      // reuse demoBillItems but assign them to this billId so the UI isn't empty.
      if (rawItems.length === 0 && billId.startsWith('bill-')) {

         rawItems = demoBillItems.map(item => ({
             ...item,
             bill_id: billId,
             id: `${billId}-${item.id}` // Ensure unique IDs
         }));
      }
      
      // Explode items with quantity > 1
      const explodedItems: BillItemWithSplits[] = [];
      
      rawItems.forEach(item => {
        if (item.quantity <= 1) {
          explodedItems.push(item);
        } else {
          // Explode!
          let remainingSplits = [...item.splits].map(s => ({...s})); // Deep copy splits to track remaining amounts
          const unitDiscount = (item.discount || 0) / item.quantity;
          
          for (let i = 0; i < item.quantity; i++) {
            const newItemId = `${item.id}_${i}`;
            const newItemPrice = item.price; // Unit price
            
            // Distribute splits to this unit
            const newItemSplits: ItemSplit[] = [];
            let currentUnitFilled = 0;
            
            // Greedily fill this unit with available splits
            for (let sIndex = 0; sIndex < remainingSplits.length; sIndex++) {
              const split = remainingSplits[sIndex];
              if (split.amount <= 0.001) continue; // Skip exhausted splits
              
              const roomInUnit = newItemPrice - currentUnitFilled;
              if (roomInUnit <= 0.001) break; // Unit full
              
              const allocateAmount = Math.min(split.amount, roomInUnit);
              
              newItemSplits.push({
                ...split,
                id: `${split.id}_${i}`, // Unique split ID
                item_id: newItemId,
                amount: allocateAmount,
                percentage: (allocateAmount / newItemPrice) * 100,
              });
              
              // Apply allocation
              remainingSplits[sIndex].amount -= allocateAmount;
              currentUnitFilled += allocateAmount;
            }
            
            explodedItems.push({
              ...item,
              id: newItemId,
              name: `${item.name} (${i + 1}/${item.quantity})`,
              quantity: 1, // Force quantity to 1 for exploded items
              discount: unitDiscount, // Per-unit discount
              splits: newItemSplits,
              unclaimed: newItemPrice - currentUnitFilled - unitDiscount, // Adjust unclaimed by discount
            } as BillItemWithSplits);
          }
        }
      });


      set(state => ({
        billItems: { ...state.billItems, [billId]: explodedItems }
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
      
      const subtotal = draft.items.reduce((sum, item) => sum + (item.price * item.quantity) - (item.discount || 0), 0);
      const total = subtotal - (draft.discount || 0) + draft.tax + draft.tip;
      
      const newBill: Bill = {
        id: `bill-${Date.now()}`,
        group_id: draft.groupId,
        title: draft.title,
        category: draft.category,
        total_amount: total,
        tax_amount: draft.tax,
        tip_amount: draft.tip,
        discount_amount: draft.discount || 0,
        tax_split_mode: draft.tax_split_mode || 'proportional', // Default to 'proportional' if not provided
        tip_split_mode: draft.tip_split_mode || 'proportional', // Default to 'proportional' if not provided
        your_share: 0,
        bill_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        payer: {
          id: 'current-user',
          full_name: 'You',
        },
        participant_avatars: draft.participantIds && draft.participantIds.length > 0 
          ? (demoGroupMembers[draft.groupId] || [])
              .filter(m => draft.participantIds?.includes(m.user_id))
              .map(m => m.user.avatar_url || '')
              .filter(url => url !== '')
              .slice(0, 3) 
          : [], 
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

  // Update bill items (replace existing)
  updateBillItems: async (billId: string, newItems: { name: string; price: number; quantity: number; discount?: number }[]) => {
    try {
        const explodedItems: BillItemWithSplits[] = [];

        newItems.forEach((item, index) => {
            // Calculate total line value in cents to allow fair splitting
            // We use the INPUT price (which might be high precision 17.3333) * Qty to get the intended Total (52.00)
            const totalLinePrice = Math.round(item.price * item.quantity * 100);
            const totalLineDiscount = Math.round((item.discount || 0) * 100);
            
            const qty = Math.max(1, Math.floor(item.quantity)); // Ensure at least 1, integer
            
            // Base amounts per item (in cents)
            const basePriceCents = Math.floor(totalLinePrice / qty);
            const priceRemainder = totalLinePrice % qty;
            
            const baseDiscountCents = Math.floor(totalLineDiscount / qty);
            const discountRemainder = totalLineDiscount % qty;

            for (let i = 0; i < qty; i++) {
                 // Distribute price remainder to first N items
                 const priceCents = basePriceCents + (i < priceRemainder ? 1 : 0);
                 const finalPrice = priceCents / 100;
                 
                 // Distribute discount remainder to first N items
                 const discountCents = baseDiscountCents + (i < discountRemainder ? 1 : 0);
                 const finalDiscount = discountCents / 100;

                 explodedItems.push({
                     id: `${billId}-item-${Date.now()}-${index}-${i}`,
                     bill_id: billId,
                     name: qty > 1 ? `${item.name} (${i + 1}/${qty})` : item.name,
                     price: finalPrice,
                     quantity: 1,
                     discount: finalDiscount,
                     splits: [],
                     total_claimed: 0,
                     unclaimed: finalPrice - finalDiscount,
                     sort_order: index,
                 });
            }
        });

        set(state => ({
            billItems: { ...state.billItems, [billId]: explodedItems }
        }));
    } catch (error) {
        console.error("Failed to update bill items", error);
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
        items: [{ id: '1', name: '', price: 0, quantity: 1, discount: 0 }],
        tax: 0,
        tip: 0,
        discount: 0,
        tax_split_mode: 'proportional',
        tip_split_mode: 'proportional',
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
            { id: String(draft.items.length + 1), name: '', price: 0, quantity: 1, discount: 0 }
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
