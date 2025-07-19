import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

import { closeEditItemModal } from '../../store/slices/uiSlice';

const EditItemModal = () => {
  const dispatch = useDispatch();
  const { isEditItemModalOpen, editingItem } = useSelector(state => state.ui);

  const handleClose = () => {
    dispatch(closeEditItemModal());
  };

  return (
    <Dialog open={isEditItemModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
        <Typography>
          Item editing form will be implemented here.
          {editingItem && ` Editing: ${editingItem.name}`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditItemModal; 