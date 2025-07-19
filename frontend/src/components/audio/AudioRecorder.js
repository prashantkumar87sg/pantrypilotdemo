import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const AudioRecorder = () => {
  const { isRecording, audioBlob, transcription } = useSelector(state => state.audio);

  useEffect(() => {
    // Handle any global audio recording logic here
    // This component acts as a coordinator for audio functionality
    
    // Cleanup function to stop any ongoing recordings when component unmounts
    return () => {
      // Add cleanup logic if needed
    };
  }, []);

  // This component doesn't render anything visible
  // It's used for managing global audio state and side effects
  return null;
};

export default AudioRecorder; 