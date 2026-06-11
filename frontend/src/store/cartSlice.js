import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    cartSuccess: (state, action) => {
      const cart = action.payload; // expects { items: [...] } or direct items array
      state.loading = false;
      state.items = cart?.items || [];
      
      // Calculate totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => {
        const itemPrice = item.product?.price || 0;
        return sum + (itemPrice * item.quantity);
      }, 0);
      state.error = null;
    },
    cartFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.loading = false;
      state.error = null;
    }
  }
});

export const { cartStart, cartSuccess, cartFailure, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
