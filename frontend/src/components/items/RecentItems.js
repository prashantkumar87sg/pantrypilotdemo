import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import {
  Delete,
  Edit,
  CheckCircle,
  ShoppingCart,
} from '@mui/icons-material';
import { format } from 'date-fns';

import { markAsRestocked, deleteItem } from '../../store/slices/itemsSlice';
import { openEditItemModal } from '../../store/slices/uiSlice';

const RecentItems = () => {
  const dispatch = useDispatch();
  const { activeItems } = useSelector(state => state.items);

  // Show only the 5 most recent items
  const recentItems = activeItems
    .slice()
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 5);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const handleMarkAsRestocked = (itemId) => {
    dispatch(markAsRestocked(itemId));
  };

  const handleEditItem = (item) => {
    dispatch(openEditItemModal(item));
  };

  const handleDeleteItem = (itemId) => {
    dispatch(deleteItem(itemId));
  };

  if (activeItems.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No items in your list yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use the voice recorder above to quickly add items to your pantry list
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            Recent Items
          </Typography>
          <Button
            variant="outlined"
            size="small"
            href="/shopping-list"
            sx={{ borderRadius: 20 }}
          >
            View All
          </Button>
        </Box>

        <List sx={{ p: 0 }}>
          {recentItems.map((item, index) => (
            <ListItem
              key={item._id || index}
              sx={{
                px: 0,
                py: 1,
                borderBottom: index < recentItems.length - 1 ? '1px solid' : 'none',
                borderBottomColor: 'divider',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'background.default',
                  color: 'text.primary',
                  mr: 2,
                  width: 40,
                  height: 40,
                }}
              >
                {getUrgencyIcon(item.urgency)}
              </Avatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {item.name}
                    </Typography>
                    <Chip
                      label={item.urgency}
                      size="small"
                      color={getUrgencyColor(item.urgency)}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    {item.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {item.notes}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Added {format(new Date(item.dateAdded || Date.now()), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleMarkAsRestocked(item._id)}
                    title="Mark as restocked"
                  >
                    <CheckCircle fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditItem(item)}
                    title="Edit item"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteItem(item._id)}
                    title="Delete item"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentItems; 