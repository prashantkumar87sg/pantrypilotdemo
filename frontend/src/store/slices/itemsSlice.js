import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { itemsService } from '../../services/itemsService';
import { transcribeAudio, extractItemsFromText } from '../../lib/gemini';

// Async thunk for fetching all items
export const fetchItems = createAsyncThunk(
  'items/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const [activeItems, restockedItems] = await Promise.all([
        itemsService.getActiveItems(),
        itemsService.getRestockedItems(),
      ]);
      
      return { activeItems, restockedItems };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating an item
export const createItem = createAsyncThunk(
  'items/createItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const newItem = await itemsService.createItem(itemData);
      return newItem;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating an item
export const updateItem = createAsyncThunk(
  'items/updateItem',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const updatedItem = await itemsService.updateItem(id, updates);
      return updatedItem;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for marking item as restocked
export const markAsRestocked = createAsyncThunk(
  'items/markAsRestocked',
  async (id, { rejectWithValue }) => {
    try {
      const updatedItem = await itemsService.markAsRestocked(id);
      return updatedItem;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting an item
export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      await itemsService.deleteItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for processing audio with AI
export const processAudio = createAsyncThunk(
  'items/processAudio',
  async (audioBlob, { rejectWithValue, dispatch }) => {
    try {
      // Step 1: Transcribe the audio
      const transcription = await transcribeAudio(audioBlob);
      
      // Step 2: Extract items from transcription
      const extractedItems = await extractItemsFromText(transcription);
      
      // Step 3: Save each item to the database
      const savedItems = [];
      for (const itemData of extractedItems) {
        const item = await itemsService.createItem({
          ...itemData,
          transcription,
          aiExtracted: true,
        });
        savedItems.push(item);
      }
      
      return {
        extractedItems: savedItems,
        originalTranscription: transcription,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for searching items
export const searchItems = createAsyncThunk(
  'items/searchItems',
  async (searchTerm, { rejectWithValue }) => {
    try {
      const results = await itemsService.searchItems(searchTerm);
      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  activeItems: [],
  restockedItems: [],
  searchResults: [],
  isLoading: false,
  isProcessing: false,
  error: null,
  searchTerm: '',
  filters: {
    urgency: '',
    category: '',
  },
  sortBy: 'urgency',
  viewMode: 'grid', // 'grid' or 'list'
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchTerm = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeItems = action.payload.activeItems;
        state.restockedItems = action.payload.restockedItems;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create item
      .addCase(createItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeItems.unshift(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update item
      .addCase(updateItem.fulfilled, (state, action) => {
        const index = state.activeItems.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.activeItems[index] = action.payload;
        }
      })
      
      // Mark as restocked
      .addCase(markAsRestocked.fulfilled, (state, action) => {
        state.activeItems = state.activeItems.filter(item => item.id !== action.payload.id);
        state.restockedItems.unshift(action.payload);
      })
      
      // Delete item
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.activeItems = state.activeItems.filter(item => item.id !== action.payload);
      })
      
      // Process audio
      .addCase(processAudio.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processAudio.fulfilled, (state, action) => {
        state.isProcessing = false;
        // Add the new items to the beginning of activeItems
        state.activeItems.unshift(...action.payload.extractedItems);
      })
      .addCase(processAudio.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })
      
      // Search items
      .addCase(searchItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSearchTerm,
  setFilters,
  setSortBy,
  setViewMode,
  clearSearchResults,
} = itemsSlice.actions;

export default itemsSlice.reducer; 