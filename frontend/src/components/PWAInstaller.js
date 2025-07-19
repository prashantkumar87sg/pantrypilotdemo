import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { GetApp } from '@mui/icons-material';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  // Don't show the install button if the app is already installed
  // or if the browser doesn't support PWA installation
  if (!showInstall) {
    return null;
  }

  return (
    <Button
      color="inherit"
      onClick={handleInstallClick}
      startIcon={<GetApp />}
      sx={{ ml: 1 }}
    >
      Install
    </Button>
  );
};

export default PWAInstaller; 