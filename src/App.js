import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home,
  ListAlt,
  Menu as MenuIcon,
  Settings,
  Info,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      // setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      // console.log('Install prompt stashed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    // Check if deferredPrompt is not null
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null); // Clear the prompt after it's used
      });
    }
  };

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My App
          </Typography>
          <Button color="inherit" onClick={handleInstallClick}>
            Install
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to My App
        </Typography>
        <Typography variant="body1">
          This is a Progressive Web App (PWA) built with React and Material-UI.
          It includes features like offline access, push notifications, and
          installation.
        </Typography>
      </Box>
    </Container>
  );
}

export default App; 