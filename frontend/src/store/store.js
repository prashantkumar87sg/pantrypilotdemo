import { configureStore } from '@reduxjs/toolkit';
import itemsSlice from './slices/itemsSlice';
import audioSlice from './slices/audioSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    items: itemsSlice,
    audio: audioSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['audio/setMediaRecorder', 'audio/setAudioBlob'],
        ignoredPaths: ['audio.mediaRecorder', 'audio.audioBlob'],
      },
    }),
});

export default store; 