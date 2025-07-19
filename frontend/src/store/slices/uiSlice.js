import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTab: 'home',
  isAddItemModalOpen: false,
  isEditItemModalOpen: false,
  editingItem: null,
  notification: {
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
  },
  isLoading: false,
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  filterUrgency: 'all', // 'all', 'critical', 'medium', 'low'
  searchQuery: '',
  viewMode: 'grid', // 'grid', 'list'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
    openAddItemModal: (state) => {
      state.isAddItemModalOpen = true;
    },
    closeAddItemModal: (state) => {
      state.isAddItemModalOpen = false;
    },
    openEditItemModal: (state, action) => {
      state.isEditItemModalOpen = true;
      state.editingItem = action.payload;
    },
    closeEditItemModal: (state) => {
      state.isEditItemModalOpen = false;
      state.editingItem = null;
    },
    showNotification: (state, action) => {
      state.notification = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setFilterUrgency: (state, action) => {
      state.filterUrgency = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    resetFilters: (state) => {
      state.sortBy = 'dateAdded';
      state.sortOrder = 'desc';
      state.filterUrgency = 'all';
      state.searchQuery = '';
    },
  },
});

export const {
  setCurrentTab,
  openAddItemModal,
  closeAddItemModal,
  openEditItemModal,
  closeEditItemModal,
  showNotification,
  hideNotification,
  setIsLoading,
  setSortBy,
  setSortOrder,
  setFilterUrgency,
  setSearchQuery,
  setViewMode,
  resetFilters,
} = uiSlice.actions;

export default uiSlice.reducer; 