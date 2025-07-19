import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import { Home, ShoppingCart, History } from '@mui/icons-material';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentValue = () => {
    switch (location.pathname) {
      case '/':
        return 'home';
      case '/shopping-list':
        return 'shopping-list';
      case '/history':
        return 'history';
      default:
        return 'home';
    }
  };

  const handleChange = (event, newValue) => {
    switch (newValue) {
      case 'home':
        navigate('/');
        break;
      case 'shopping-list':
        navigate('/shopping-list');
        break;
      case 'history':
        navigate('/history');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: '1px solid',
        borderTopColor: 'divider',
      }} 
      elevation={8}
    >
      <MuiBottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        sx={{ 
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          value="home"
          icon={<Home />}
        />
        <BottomNavigationAction
          label="Shopping List"
          value="shopping-list"
          icon={<ShoppingCart />}
        />
        <BottomNavigationAction
          label="History"
          value="history"
          icon={<History />}
        />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation; 