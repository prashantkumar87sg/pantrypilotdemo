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

import { closeAddItemModal } from '../../store/slices/uiSlice';

const AddItemModal = () => {
  const dispatch = useDispatch();
  const { isAddItemModalOpen } = useSelector(state => state.ui);

  const handleClose = () => {
    dispatch(closeAddItemModal());
  };

  return (
    <Dialog open={isAddItemModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Item Manually</DialogTitle>
      <DialogContent>
        <Typography>
          Manual item addition form will be implemented here.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained">Add Item</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemModal; 