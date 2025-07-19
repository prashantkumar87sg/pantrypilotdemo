import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { transformItems, transformItem } from '../../utils/dataTransform';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Async thunks for API calls
export const fetchItems = createAsyncThunk('items/fetchItems', async () => {
  const response = await axios.get(`${API_URL}/items`);
  return response.data;
});

export const addItem = createAsyncThunk('items/addItem', async (itemData) => {
  const response = await axios.post(`${API_URL}/items`, itemData);
  return response.data;
});

export const updateItem = createAsyncThunk('items/updateItem', async ({ id, updates }) => {
  const response = await axios.put(`${API_URL}/items/${id}`, updates);
  return response.data;
});

export const deleteItem = createAsyncThunk('items/deleteItem', async (id) => {
  await axios.delete(`${API_URL}/items/${id}`);
  return id;
});

export const markAsRestocked = createAsyncThunk('items/markAsRestocked', async (id) => {
  const response = await axios.put(`${API_URL}/items/${id}/restock`);
  return response.data;
});

export const processAudioTranscription = createAsyncThunk(
  'items/processAudioTranscription',
  async ({ transcription, audioBlob }) => {
    const formData = new FormData();
    formData.append('transcription', transcription);
    if (audioBlob) {
      formData.append('audio', audioBlob, 'recording.webm');
    }
    
    const response = await axios.post(`${API_URL}/items/process-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

const initialState = {
  activeItems: [],
  restockedItems: [],
  loading: false,
  error: null,
  processingAudio: false,
  lastExtractedItems: [],
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateItemLocally: (state, action) => {
      const { id, updates } = action.payload;
      const item = state.activeItems.find(item => item._id === id);
      if (item) {
        Object.assign(item, updates);
      }
    },
    clearLastExtractedItems: (state) => {
      state.lastExtractedItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.activeItems = transformItems(action.payload.activeItems || []);
        state.restockedItems = transformItems(action.payload.restockedItems || []);
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add item
      .addCase(addItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false;
        state.activeItems.unshift(transformItem(action.payload));
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update item
      .addCase(updateItem.fulfilled, (state, action) => {
        const transformedItem = transformItem(action.payload);
        const index = state.activeItems.findIndex(item => item._id === transformedItem._id);
        if (index !== -1) {
          state.activeItems[index] = transformedItem;
        }
      })
      
      // Delete item
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.activeItems = state.activeItems.filter(item => item._id !== action.payload);
      })
      
      // Mark as restocked
      .addCase(markAsRestocked.fulfilled, (state, action) => {
        const transformedItem = transformItem(action.payload);
        state.activeItems = state.activeItems.filter(activeItem => activeItem._id !== transformedItem._id);
        state.restockedItems.unshift(transformedItem);
      })
      
      // Process audio transcription
      .addCase(processAudioTranscription.pending, (state) => {
        state.processingAudio = true;
        state.error = null;
      })
      .addCase(processAudioTranscription.fulfilled, (state, action) => {
        state.processingAudio = false;
        const extractedItems = transformItems(action.payload.extractedItems || []);
        state.lastExtractedItems = extractedItems;
        // Add extracted items to active items
        state.activeItems = [...extractedItems, ...state.activeItems];
      })
      .addCase(processAudioTranscription.rejected, (state, action) => {
        state.processingAudio = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, updateItemLocally, clearLastExtractedItems } = itemsSlice.actions;
export default itemsSlice.reducer; 