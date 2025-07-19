import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { markAsRestocked, deleteItem } from '../../store/slices/itemsSlice';
import { openEditItemModal } from '../../store/slices/uiSlice';

const ItemListItem = ({ item }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    dispatch(openEditItemModal(item));
    handleClose();
  };

  const handleDelete = () => {
    dispatch(deleteItem(item._id));
    handleClose();
  };

  const handleMarkAsRestocked = () => {
    dispatch(markAsRestocked(item._id));
    handleClose();
  };
  
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      {item.photoUrl ? (
        <Avatar src={item.photoUrl} sx={{ width: 48, height: 48, mr: 2 }} />
      ) : (
        <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.light' }}>
          {item.name.charAt(0).toUpperCase()}
        </Avatar>
      )}

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.name}</Typography>
        <Typography variant="body2" color="text.secondary">{item.notes || 'No additional notes'}</Typography>
        <Typography variant="caption" color="text.secondary">
          Added: {format(new Date(item.dateAdded), 'MMM d, yyyy')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 1 }}>
        <Chip
          label={item.urgency}
          color={getUrgencyColor(item.urgency)}
          size="small"
          sx={{ textTransform: 'capitalize', fontWeight: 500 }}
        />
      </Box>

      <IconButton
        id="item-menu-button-list"
        aria-controls={open ? 'item-menu-list' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="item-menu-list"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'item-menu-button-list' }}
      >
        <MenuItem onClick={handleMarkAsRestocked}>
          <ListItemIcon><CheckCircle fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Mark as Restocked</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Item</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ItemListItem; 