import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
} from 'react-router-dom';
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
import HomePage from './pages/HomePage';
import ShoppingListPage from './pages/ShoppingListPage';
import { useDispatch } from 'react-redux';
import { fetchItems } from './store/slices/itemsSlice';
import ThemeProvider from './theme/ThemeProvider';
import PWAInstaller from './components/PWAInstaller';

function App() {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider>
      <Router>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
                sx={{ textTransform: 'none', fontSize: '1.25rem' }}
              >
                PantryPilot
              </Button>
            </Typography>
            <PWAInstaller />
            <IconButton
              color="inherit"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose} component={RouterLink} to="/">
                <ListItemIcon>
                  <Home fontSize="small" />
                </ListItemIcon>
                <ListItemText>Home</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={handleClose}
                component={RouterLink}
                to="/list"
              >
                <ListItemIcon>
                  <ListAlt fontSize="small" />
                </ListItemIcon>
                <ListItemText>Shopping List</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Info fontSize="small" />
                </ListItemIcon>
                <ListItemText>About</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/list" element={<ShoppingListPage />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 