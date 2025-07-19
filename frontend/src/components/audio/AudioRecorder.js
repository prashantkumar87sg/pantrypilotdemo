import { useState, useRef } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import { Mic, Stop, Send } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { processAudio } from '../../store/slices/itemsSlice';

const AudioRecorder = () => {
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
      p={2}
      border={1}
      borderRadius={2}
      borderColor="grey.300"
    >
      <Typography variant="h6">Record Audio Note</Typography>

      <Button
        variant="contained"
        color={localIsRecording ? 'secondary' : 'primary'}
        onClick={handleToggleRecording}
        startIcon={localIsRecording ? <Stop /> : <Mic />}
        sx={{ minWidth: 150 }}
      >
        {localIsRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>

      {localAudioBlob && !isProcessing && (
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          startIcon={<Send />}
        >
          Process Recording
        </Button>
      )}

      {isProcessing && (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={20} />
          <Typography variant="body2">Processing audio...</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" variant="body2">
          {`Error: ${error}`}
        </Typography>
      )}
    </Box>
  );
};

export default AudioRecorder; 