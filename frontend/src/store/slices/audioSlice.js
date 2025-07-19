import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isRecording: false,
  isPaused: false,
  mediaRecorder: null,
  audioBlob: null,
  audioUrl: null,
  transcription: '',
  isTranscribing: false,
  transcriptionError: null,
  duration: 0,
  volume: 0,
  isSupported: false,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setIsSupported: (state, action) => {
      state.isSupported = action.payload;
    },
    setMediaRecorder: (state, action) => {
      state.mediaRecorder = action.payload;
    },
    startRecording: (state) => {
      state.isRecording = true;
      state.isPaused = false;
      state.transcription = '';
      state.transcriptionError = null;
      state.duration = 0;
    },
    stopRecording: (state) => {
      state.isRecording = false;
      state.isPaused = false;
      state.duration = 0;
    },
    pauseRecording: (state) => {
      state.isPaused = true;
    },
    resumeRecording: (state) => {
      state.isPaused = false;
    },
    setAudioBlob: (state, action) => {
      state.audioBlob = action.payload;
      if (action.payload) {
        state.audioUrl = URL.createObjectURL(action.payload);
      }
    },
    setTranscription: (state, action) => {
      state.transcription = action.payload;
    },
    setIsTranscribing: (state, action) => {
      state.isTranscribing = action.payload;
    },
    setTranscriptionError: (state, action) => {
      state.transcriptionError = action.payload;
    },
    updateDuration: (state, action) => {
      state.duration = action.payload;
    },
    updateVolume: (state, action) => {
      state.volume = action.payload;
    },
    clearRecording: (state) => {
      state.audioBlob = null;
      state.audioUrl = null;
      state.transcription = '';
      state.transcriptionError = null;
      state.duration = 0;
      state.volume = 0;
    },
    resetAudioState: () => initialState,
  },
});

export const {
  setIsSupported,
  setMediaRecorder,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  setAudioBlob,
  setTranscription,
  setIsTranscribing,
  setTranscriptionError,
  updateDuration,
  updateVolume,
  clearRecording,
  resetAudioState,
} = audioSlice.actions;

export default audioSlice.reducer; 