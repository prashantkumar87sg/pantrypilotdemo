import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Fab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';

import { 
  startRecording, 
  stopRecording,
  setAudioBlob,
  setTranscription,
  setIsTranscribing,
  setTranscriptionError,
  clearRecording,
} from '../../store/slices/audioSlice';
import { processAudioTranscription, clearLastExtractedItems } from '../../store/slices/itemsSlice';
import { showNotification } from '../../store/slices/uiSlice';

const PushToRecordButton = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { isRecording, isSupported } = useSelector(state => state.audio);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const startAudioRecording = useCallback(async () => {
    if (!isSupported) {
      dispatch(showNotification({
        message: 'Audio recording is not supported in this browser',
        severity: 'error'
      }));
      return;
    }

    dispatch(clearRecording());
    dispatch(clearLastExtractedItems());
    finalTranscriptRef.current = '';
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const finalTranscription = finalTranscriptRef.current;

        if (finalTranscription.trim() && audioBlob.size > 0) {
          dispatch(setAudioBlob(audioBlob));
          dispatch(processAudioTranscription({
            transcription: finalTranscription.trim(),
            audioBlob: audioBlob,
          }));
        } else if (!finalTranscription.trim()) {
           dispatch(showNotification({
            message: "Sorry, I couldn't hear you clearly. Please try again.",
            severity: 'warning'
          }));
        }
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start();
      dispatch(startRecording());
      startSpeechRecognition();

    } catch (error) {
      console.error('Error starting recording:', error);
      dispatch(showNotification({
        message: 'Failed to access microphone. Please check permissions.',
        severity: 'error'
      }));
    }
  }, [dispatch, isSupported]);

  const stopAudioRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    dispatch(stopRecording());
  }, [dispatch]);
  
  const handleToggleRecording = () => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

  const startSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      dispatch(setIsTranscribing(true));
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        finalTranscriptRef.current += finalTranscript.trim() + ' ';
      }

      const fullTranscript = (finalTranscriptRef.current + interimTranscript).trim();
      dispatch(setTranscription(fullTranscript));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      dispatch(setTranscriptionError(event.error));
      dispatch(showNotification({ message: 'Speech recognition error. Please try again.', severity: 'error' }));
    };

    recognition.onend = () => {
      dispatch(setIsTranscribing(false));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [dispatch]);


  if (!isSupported) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body1" color="error">
          Audio recording is not supported in this browser
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
      <Fab
        size={isMobile ? 'large' : 'large'}
        onClick={handleToggleRecording}
        sx={{
          width: { xs: 120, sm: 150 },
          height: { xs: 120, sm: 150 },
          backgroundColor: isRecording ? 'error.main' : 'rgba(255,255,255,0.2)',
          color: 'white',
          border: '4px solid rgba(255,255,255,0.3)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: isRecording ? 'error.dark' : 'rgba(255,255,255,0.3)',
            transform: 'scale(1.05)',
          },
        }}
        disableRipple
      >
        {isRecording ? (
          <Stop sx={{ fontSize: { xs: 40, sm: 50 } }} />
        ) : (
          <Mic sx={{ fontSize: { xs: 40, sm: 50 } }} />
        )}
      </Fab>

      <Typography 
        variant="body2" 
        sx={{ 
          opacity: 0.9,
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        {isRecording ? 'Click to Stop Recording' : 'Click to Record'}
      </Typography>

      {isRecording && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            mt: '-36px',
            pointerEvents: 'none',
            width: { xs: 140, sm: 170 },
            height: { xs: 140, sm: 170 },
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.5)',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 1,
              },
              '50%': {
                transform: 'scale(1.1)',
                opacity: 0.7,
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        />
      )}
    </Box>
  );
};

export default PushToRecordButton; 