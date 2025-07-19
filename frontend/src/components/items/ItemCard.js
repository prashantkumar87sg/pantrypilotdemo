import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  CardActions,
  Button,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  PhotoCamera,
  Notes,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

import { markAsRestocked, deleteItem } from '../../store/slices/itemsSlice';
import { openEditItemModal } from '../../store/slices/uiSlice';

const ItemCard = ({ item }) => {
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
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Chip
            label={item.urgency}
            color={getUrgencyColor(item.urgency)}
            size="small"
            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
          />
          <IconButton
            id="item-menu-button"
            aria-controls={open ? 'item-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            size="small"
          >
            <MoreVert />
          </IconButton>
          <Menu
            id="item-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{ 'aria-labelledby': 'item-menu-button' }}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <ListItemText>Edit Item</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
        
        <Box sx={{ textAlign: 'center', my: 2 }}>
          {item.photoUrl ? (
            <Avatar src={item.photoUrl} sx={{ width: 80, height: 80, mx: 'auto' }} />
          ) : (
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', bgcolor: 'primary.main' }}>
              {item.name.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </Box>

        <Typography variant="h6" component="h3" sx={{ textAlign: 'center', fontWeight: 600, mb: 1 }}>
          {item.name}
        </Typography>

        {item.notes && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
            {item.notes}
          </Typography>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          Added {formatDistanceToNow(new Date(item.dateAdded), { addSuffix: true })}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          startIcon={<CheckCircle />}
          onClick={handleMarkAsRestocked}
        >
          Mark as Restocked
        </Button>
      </CardActions>
    </Card>
  );
};

export default ItemCard; 