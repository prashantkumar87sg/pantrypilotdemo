import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Box, 
  Snackbar, 
  Alert,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Mic, List, History } from '@mui/icons-material';

import HomePage from './pages/HomePage';
import ShoppingListPage from './pages/ShoppingListPage';
import HistoryPage from './pages/HistoryPage';
import BottomNavigation from './components/navigation/BottomNavigation';
import AudioRecorder from './components/audio/AudioRecorder';
import AddItemModal from './components/modals/AddItemModal';
import EditItemModal from './components/modals/EditItemModal';

import { fetchItems } from './store/slices/itemsSlice';
import { hideNotification, setCurrentTab } from './store/slices/uiSlice';
import { setIsSupported } from './store/slices/audioSlice';

function App() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { notification } = useSelector(state => state.ui);
  const { isRecording } = useSelector(state => state.audio);

  useEffect(() => {
    // Check for audio recording support
    const checkAudioSupport = () => {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasMediaRecorder = !!window.MediaRecorder;
      dispatch(setIsSupported(hasGetUserMedia && hasMediaRecorder));
    };

    checkAudioSupport();
    
    // Fetch initial data
    dispatch(fetchItems());

    // Handle PWA installation
    let deferredPrompt;
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dispatch]);

  const handleCloseNotification = () => {
    dispatch(hideNotification());
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      paddingBottom: isMobile ? '80px' : '20px',
    }}>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Container>

      {/* Bottom Navigation for Mobile */}
      {isMobile && <BottomNavigation />}

      {/* Floating Action Button for Quick Record (on mobile, when not on home page) */}
      {isMobile && window.location.pathname !== '/' && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 16,
            zIndex: 1000,
            ...(isRecording && {
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
            }),
          }}
          onClick={() => dispatch(setCurrentTab('home'))}
        >
          <Mic />
        </Fab>
      )}

      {/* Audio Recorder Component */}
      <AudioRecorder />

      {/* Modals */}
      <AddItemModal />
      <EditItemModal />

      {/* Global Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App; 