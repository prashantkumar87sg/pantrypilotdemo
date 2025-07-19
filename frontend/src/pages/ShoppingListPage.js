import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  ViewList,
  ViewModule,
  Sort,
  Add,
  ShoppingCartCheckout,
} from '@mui/icons-material';

import ItemCard from '../components/items/ItemCard';
import ItemListItem from '../components/items/ItemListItem';
import {
  setSortBy,
  setSortOrder,
  setSearchQuery,
  setViewMode,
  setFilterUrgency,
  openAddItemModal,
} from '../store/slices/uiSlice';
import { markAsRestocked } from '../store/slices/itemsSlice';

const ShoppingListPage = () => {
  const dispatch = useDispatch();
  const { activeItems, loading } = useSelector(state => state.items);
  const { viewMode, sortBy, sortOrder, searchQuery, filterUrgency } = useSelector(state => state.ui);

  const [sortAnchorEl, setSortAnchorEl] = useState(null);

  const handleSortMenuClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(newSortBy));
      dispatch(setSortOrder('desc'));
    }
    handleSortMenuClose();
  };
  
  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      dispatch(setViewMode(newViewMode));
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let items = [...activeItems];

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterUrgency !== 'all') {
      items = items.filter(item => item.urgency === filterUrgency);
    }
    
    const urgencyPriority = { critical: 3, medium: 2, low: 1 };
    
    items.sort((a, b) => {
      let compareA, compareB;
      if (sortBy === 'urgency') {
        compareA = urgencyPriority[a.urgency];
        compareB = urgencyPriority[b.urgency];
      } else if (sortBy === 'name') {
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      } else { // dateAdded
        compareA = new Date(a.dateAdded);
        compareB = new Date(b.dateAdded);
      }
      
      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [activeItems, searchQuery, filterUrgency, sortBy, sortOrder]);

  const handleMarkSelectedAsRestocked = () => {
    // Placeholder for future multi-select functionality
    console.log("Marking selected as restocked");
  };

  if (loading && activeItems.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Shopping List ({filteredAndSortedItems.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => dispatch(openAddItemModal())}
        >
          Add Item
        </Button>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            id="sort-button"
            aria-controls={sortAnchorEl ? 'sort-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={sortAnchorEl ? 'true' : undefined}
            variant="outlined"
            startIcon={<Sort />}
            onClick={handleSortMenuClick}
          >
            Sort
          </Button>
          <Menu
            id="sort-menu"
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortMenuClose}
            MenuListProps={{
              'aria-labelledby': 'sort-button',
            }}
          >
            <MenuItem onClick={() => handleSortChange('urgency')}>By Urgency</MenuItem>
            <MenuItem onClick={() => handleSortChange('dateAdded')}>By Date Added</MenuItem>
            <MenuItem onClick={() => handleSortChange('name')}>By Name (A-Z)</MenuItem>
          </Menu>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewList />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModule />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>
      
      {/* Items List/Grid */}
      {filteredAndSortedItems.length > 0 ? (
        viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredAndSortedItems.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredAndSortedItems.map(item => (
              <ItemListItem key={item._id} item={item} />
            ))}
          </Box>
        )
      ) : (
        <Paper sx={{ textAlign: 'center', p: 4, mt: 4 }}>
          <Typography variant="h6">No items found</Typography>
          <Typography color="text.secondary">
            Try adjusting your search or filters, or add a new item to your list.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ShoppingListPage; 