/**
 * PrismSplit Bills Store
 * 
 * Manages bills, items, splits, and related state.
 * Connected to Supabase for persistent storage.
 */

import { create } from 'zustand';
import { supabase, ensureSession } from '@/lib/supabase';
import type { Bill, BillItem, ItemSplit, Category, BillItemWithSplits, User } from '@/types/models';

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
    category?: Category;
    splits?: ItemSplit[];
    locked?: 'price' | 'total';
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
  updateBillItems: (billId: string, items: { name: string; price: number; quantity: number; discount?: number; category?: Category }[]) => Promise<void>;
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

  // Payments
  recordPayment: (groupId: string, payerId: string, receiverId: string, amount: number) => Promise<boolean>;
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
      await ensureSession();
      
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          payer:profiles!paid_by (
            id,
            full_name,
            avatar_url,
            email,
            color_index
          )
        `)
        .eq('group_id', groupId)
        .order('bill_date', { ascending: false });

      if (error) throw error;

      const bills: Bill[] = (data || []).map((b: any) => ({
        id: b.id,
        group_id: b.group_id,
        title: b.title,
        category: b.category || 'other',
        total_amount: parseFloat(b.total_amount) || 0,
        tax_amount: parseFloat(b.tax_amount) || 0,
        tip_amount: parseFloat(b.tip_amount) || 0,
        discount_amount: parseFloat(b.discount_amount) || 0,
        tax_split_mode: b.tax_split_mode || 'proportional',
        tip_split_mode: b.tip_split_mode || 'proportional',
        your_share: 0, // Will be calculated from splits
        bill_date: b.bill_date,
        created_at: b.created_at,
        is_itemized: b.is_itemized,
        item_count: 0, // Will be fetched with items
        payer: {
          id: b.payer?.id || b.paid_by,
          full_name: b.payer?.full_name || 'Unknown',
        },
        participant_avatars: [],
      }));

      set({ bills, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch bills:', error);
      set({ error: error.message || 'Failed to fetch bills', isLoading: false });
    }
  },

  // Fetch single bill
  fetchBillById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await ensureSession();
      
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          payer:profiles!paid_by (
            id,
            full_name,
            avatar_url,
            email,
            color_index
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const bill: Bill = {
        id: data.id,
        group_id: data.group_id,
        title: data.title,
        category: data.category || 'other',
        total_amount: parseFloat(data.total_amount) || 0,
        tax_amount: parseFloat(data.tax_amount) || 0,
        tip_amount: parseFloat(data.tip_amount) || 0,
        discount_amount: parseFloat(data.discount_amount) || 0,
        tax_split_mode: data.tax_split_mode || 'proportional',
        tip_split_mode: data.tip_split_mode || 'proportional',
        your_share: 0,
        bill_date: data.bill_date,
        created_at: data.created_at,
        is_itemized: data.is_itemized,
        payer: {
          id: data.payer?.id || data.paid_by,
          full_name: data.payer?.full_name || 'Unknown',
        },
        participant_avatars: [],
      };

      set({ currentBill: bill, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch bill:', error);
      set({ error: error.message || 'Bill not found', isLoading: false });
    }
  },

  // Fetch bill items with splits - explodes items with quantity > 1 into separate line items
  fetchBillItems: async (billId: string) => {
    try {
      await ensureSession();
      
      const { data, error } = await supabase
        .from('bill_items')
        .select(`
          *,
          splits:item_splits (
            id,
            user_id,
            split_type,
            amount,
            percentage,
            user:profiles (
              id,
              full_name,
              avatar_url,
              color_index
            )
          )
        `)
        .eq('bill_id', billId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Map raw data to BillItemWithSplits
      const rawItems: BillItemWithSplits[] = (data || []).map((item: any) => ({
        id: item.id,
        bill_id: item.bill_id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        quantity: item.quantity || 1,
        discount: parseFloat(item.discount) || 0,
        category: item.category, // Item-level category (may be null)
        sort_order: item.sort_order,
        splits: (item.splits || []).map((s: any) => ({
          id: s.id,
          item_id: item.id,
          user_id: s.user_id,
          split_type: s.split_type,
          amount: parseFloat(s.amount) || 0,
          percentage: parseFloat(s.percentage) || 0,
          user: s.user ? {
            id: s.user.id,
            full_name: s.user.full_name,
            avatar_url: s.user.avatar_url,
            color_index: s.user.color_index,
          } : undefined,
        })),
        total_claimed: 0,
        unclaimed: 0,
      }));

      // Explode items with quantity > 1 into separate line items
      const explodedItems: BillItemWithSplits[] = [];
      
      rawItems.forEach(item => {
        if (item.quantity <= 1) {
          // Calculate totals for single items
          const totalClaimed = item.splits.reduce((sum, s) => sum + (s.amount || 0), 0);
          explodedItems.push({
            ...item,
            total_claimed: totalClaimed,
            unclaimed: item.price - (item.discount || 0) - totalClaimed,
          });
        } else {
          // Explode items with quantity > 1
          let remainingSplits = [...item.splits].map(s => ({...s})); // Deep copy splits
          const unitDiscount = (item.discount || 0) / item.quantity;
          
          for (let i = 0; i < item.quantity; i++) {
            const newItemId = `${item.id}_${i}`;
            const newItemPrice = item.price; // Unit price
            
            // Distribute splits to this unit
            const newItemSplits: typeof item.splits = [];
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
                id: `${split.id}_${i}`,
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
              quantity: 1,
              discount: unitDiscount,
              splits: newItemSplits,
              total_claimed: currentUnitFilled,
              unclaimed: newItemPrice - currentUnitFilled - unitDiscount,
            });
          }
        }
      });

      set(state => ({
        billItems: { ...state.billItems, [billId]: explodedItems }
      }));
    } catch (error: any) {
      console.error('Failed to fetch bill items:', error);
    }
  },

  // Create new bill using RPC function
  createBill: async (draft: BillDraft) => {
    set({ isLoading: true, error: null });
    
    try {
      await ensureSession();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const subtotal = draft.items.reduce((sum, item) => 
        sum + (item.price * item.quantity) - (item.discount || 0), 0);
      const total = subtotal - (draft.discount || 0) + draft.tax + draft.tip;

      // Prepare items for RPC
      const itemsData = draft.items.map((item, index) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount || 0,
        category: item.category || null, // Item category, null means use bill category
        sort_order: index,
        splits: (item.splits || []).map(s => ({
          user_id: s.user_id,
          split_type: s.split_type || 'equal',
          amount: s.amount,
          percentage: s.percentage,
        })),
      }));

      // Call RPC function
      const { data: newBillId, error: rpcError } = await supabase.rpc(
        'create_bill_with_items',
        {
          p_group_id: draft.groupId,
          p_title: draft.title,
          p_total_amount: total,
          p_tax_amount: draft.tax,
          p_tip_amount: draft.tip,
          p_discount_amount: draft.discount || 0,
          p_tax_split_mode: draft.tax_split_mode || 'proportional',
          p_tip_split_mode: draft.tip_split_mode || 'proportional',
          p_paid_by: user.id,
          p_category: draft.category,
          p_is_itemized: draft.items.length > 0 && draft.items.some(i => i.name),
          p_items: itemsData,
        }
      );

      if (rpcError) throw rpcError;

      // Fetch user profile for payer info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, color_index')
        .eq('id', user.id)
        .single();

      const newBill: Bill = {
        id: newBillId,
        group_id: draft.groupId,
        title: draft.title,
        category: draft.category,
        total_amount: total,
        tax_amount: draft.tax,
        tip_amount: draft.tip,
        discount_amount: draft.discount || 0,
        tax_split_mode: draft.tax_split_mode || 'proportional',
        tip_split_mode: draft.tip_split_mode || 'proportional',
        your_share: 0,
        bill_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_itemized: draft.items.length > 0 && draft.items.some(i => i.name),
        payer: {
          id: user.id,
          full_name: profile?.full_name || 'You',
          avatar_url: profile?.avatar_url,
          color_index: profile?.color_index || 0,
        } as User,
        participant_avatars: [],
      };

      set(state => ({
        bills: [newBill, ...state.bills],
        isLoading: false,
        draft: null,
      }));

      return newBill;
    } catch (error: any) {
      console.error('Failed to create bill:', error);
      set({ error: error.message || 'Failed to create bill', isLoading: false });
      throw error;
    }
  },

  // Update bill
  updateBill: async (id: string, updates: Partial<Bill>) => {
    try {
      await ensureSession();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('bills')
        .update({
          title: updates.title,
          category: updates.category,
          total_amount: updates.total_amount,
          tax_amount: updates.tax_amount,
          tip_amount: updates.tip_amount,
          discount_amount: updates.discount_amount,
          tax_split_mode: updates.tax_split_mode,
          tip_split_mode: updates.tip_split_mode,
          bill_date: updates.bill_date,
          last_edited_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b),
        currentBill: state.currentBill?.id === id 
          ? { ...state.currentBill, ...updates }
          : state.currentBill,
      }));
    } catch (error: any) {
      console.error('Failed to update bill:', error);
      set({ error: error.message || 'Failed to update bill' });
    }
  },

  // Update bill items - delete old and insert new
  updateBillItems: async (billId: string, newItems: { name: string; price: number; quantity: number; discount?: number; category?: Category }[]) => {
    try {
      await ensureSession();
      
      // Delete existing items (cascade deletes splits)
      await supabase.from('bill_items').delete().eq('bill_id', billId);

      // Insert new items
      const itemsToInsert = newItems.map((item, index) => ({
        bill_id: billId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount: item.discount || 0,
        sort_order: index,
      }));

      if (itemsToInsert.length > 0) {
        const { error } = await supabase.from('bill_items').insert(itemsToInsert);
        if (error) throw error;
      }

      // Refetch items
      await get().fetchBillItems(billId);
    } catch (error: any) {
      console.error('Failed to update bill items:', error);
    }
  },

  // Delete bill
  deleteBill: async (id: string) => {
    try {
      await ensureSession();
      
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        bills: state.bills.filter(b => b.id !== id),
        currentBill: state.currentBill?.id === id ? null : state.currentBill,
      }));
    } catch (error: any) {
      console.error('Failed to delete bill:', error);
      set({ error: error.message || 'Failed to delete bill' });
    }
  },

  // Initialize draft for new bill
  initDraft: (groupId: string) => {
    set({
      draft: {
        title: '',
        groupId,
        category: 'groceries',
        items: [{ id: '1', name: '', price: 0, quantity: 1, discount: 0, category: 'groceries' }],
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

  // Add new item to draft
  addDraftItem: () => {
    const { draft } = get();
    if (draft) {
      set({
        draft: {
          ...draft,
          items: [
            ...draft.items,
            { id: Date.now().toString(), name: '', price: 0, quantity: 1, discount: 0 }
          ],
        },
      });
    }
  },

  // Update draft item
  updateDraftItem: (index: number, updates: Partial<BillDraft['items'][0]>) => {
    const { draft } = get();
    if (draft) {
      const newItems = [...draft.items];
      newItems[index] = { ...newItems[index], ...updates };
      set({ draft: { ...draft, items: newItems } });
    }
  },

  // Remove draft item
  removeDraftItem: (index: number) => {
    const { draft } = get();
    if (draft && draft.items.length > 1) {
      set({
        draft: {
          ...draft,
          items: draft.items.filter((_, i) => i !== index),
        },
      });
    }
  },

  // Clear draft
  clearDraft: () => {
    set({ draft: null });
  },

  // Toggle item selection
  toggleItemSelection: (itemId: string) => {
    const { selectedItems } = get();
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    set({ selectedItems: newSelected });
  },

  // Record payment/settlement
  recordPayment: async (groupId: string, payerId: string, receiverId: string, amount: number) => {
    try {
      await ensureSession();
      
      const { error } = await supabase
        .from('settlements')
        .insert({
          group_id: groupId,
          from_user: payerId,
          to_user: receiverId,
          amount,
        });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Failed to record payment:', error);
      return false;
    }
  },

  // Confirm item selections
  confirmSelections: async (billId: string) => {
    // TODO: Implement - update splits based on selectedItems
    console.log('Confirming selections for bill:', billId);
    get().clearSelections();
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
