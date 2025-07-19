import React, { useState, useRef } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { Mic, Stop, Send } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { processAudio } from '../../store/slices/itemsSlice';

const PushToRecordButton = () => {
  const dispatch = useDispatch();
  const { isProcessing, error } = useSelector((state) => state.items);

  const [localIsRecording, setLocalIsRecording] = useState(false);
  const [localAudioBlob, setLocalAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, {
          type: 'audio/webm',
        });
        setLocalAudioBlob(audioBlob);
        audioChunks.current = [];
      };
      mediaRecorder.current.start();
      setLocalIsRecording(true);
      setLocalAudioBlob(null);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorder.current &&
      mediaRecorder.current.state === 'recording'
    ) {
      mediaRecorder.current.stop();
      setLocalIsRecording(false);
      // Stop all media tracks
      mediaRecorder.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const handleToggleRecording = () => {
    if (localIsRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = () => {
    if (localAudioBlob) {
      dispatch(processAudio(localAudioBlob));
      setLocalAudioBlob(null); // Clear blob after dispatch
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      p={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
        Quick Voice Note
      </Typography>
      
      <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
        Record what you're running low on
      </Typography>

      <Button
        variant="contained"
        size="large"
        color={localIsRecording ? 'secondary' : 'primary'}
        onClick={handleToggleRecording}
        startIcon={localIsRecording ? <Stop /> : <Mic />}
        sx={{ 
          minWidth: 180,
          py: 1.5,
          fontSize: '1.1rem',
          background: localIsRecording 
            ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
            : 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
          '&:hover': {
            background: localIsRecording
              ? 'linear-gradient(135deg, #ff5252 0%, #d63031 100%)'
              : 'linear-gradient(135deg, #26d0ce 0%, #2d8587 100%)',
          },
        }}
      >
        {localIsRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>

      {localAudioBlob && !isProcessing && (
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          startIcon={<Send />}
          sx={{ mt: 1 }}
        >
          Process Recording
        </Button>
      )}

      {isProcessing && (
        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
          <CircularProgress size={20} color="inherit" />
          <Typography variant="body2">Processing audio...</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {`Error: ${error}`}
        </Typography>
      )}
    </Box>
  );
};

export default PushToRecordButton; 