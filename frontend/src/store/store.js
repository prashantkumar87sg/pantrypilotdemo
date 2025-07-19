import { configureStore } from '@reduxjs/toolkit';
import itemsSlice from './slices/itemsSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    items: itemsSlice,
    ui: uiSlice,
  },
});

export default store; 