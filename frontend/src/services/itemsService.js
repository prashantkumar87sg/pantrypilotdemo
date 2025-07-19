import { supabase, ITEMS_TABLE } from '../lib/supabase';

export const itemsService = {
  // Get all active items
  async getActiveItems() {
    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .select('*')
      .eq('status', 'active')
      .order('urgency', { ascending: false })
      .order('date_added', { ascending: false });

    if (error) {
      console.error('Error fetching active items:', error);
      throw error;
    }

    return data || [];
  },

  // Get restocked items
  async getRestockedItems(limit = 20) {
    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .select('*')
      .eq('status', 'restocked')
      .order('date_restocked', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching restocked items:', error);
      throw error;
    }

    return data || [];
  },

  // Create a new item
  async createItem(itemData) {
    const item = {
      name: itemData.name,
      urgency: itemData.urgency || 'medium',
      notes: itemData.notes || '',
      quantity: itemData.quantity || '',
      estimated_time_to_run_out: itemData.estimatedTimeToRunOut || '',
      category: itemData.category || '',
      transcription: itemData.transcription || '',
      status: 'active',
      ai_extracted: itemData.aiExtracted || false,
      ai_confidence: itemData.aiConfidence || null,
      tags: itemData.tags || [],
      date_added: new Date().toISOString(),
      date_last_modified: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      throw error;
    }

    return data;
  },

  // Update an item
  async updateItem(id, updates) {
    const updateData = {
      ...updates,
      date_last_modified: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }

    return data;
  },

  // Mark item as restocked
  async markAsRestocked(id) {
    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .update({
        status: 'restocked',
        date_restocked: new Date().toISOString(),
        date_last_modified: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error marking item as restocked:', error);
      throw error;
    }

    return data;
  },

  // Delete an item
  async deleteItem(id) {
    const { error } = await supabase
      .from(ITEMS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      throw error;
    }

    return true;
  },

  // Search items
  async searchItems(searchTerm) {
    const { data, error } = await supabase
      .from(ITEMS_TABLE)
      .select('*')
      .or(`name.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .eq('status', 'active')
      .order('urgency', { ascending: false })
      .order('date_added', { ascending: false });

    if (error) {
      console.error('Error searching items:', error);
      throw error;
    }

    return data || [];
  },
}; 