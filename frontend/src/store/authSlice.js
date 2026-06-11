import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial user details from localStorage
const storedUser = localStorage.getItem('userInfo');
let initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
};

if (storedUser) {
  try {
    const parsed = JSON.parse(storedUser);
    if (parsed && parsed.token) {
      initialState = {
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: true,
        isAdmin: parsed.user?.role === 'admin',
        loading: false,
        error: null,
      };
    }
  } catch (err) {
    console.error('Failed to parse stored user info:', err);
    localStorage.removeItem('userInfo');
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isAdmin = user?.role === 'admin';
      state.error = null;
      // Persist in localStorage
      localStorage.setItem('userInfo', JSON.stringify({ user, token }));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('userInfo');
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { authStart, authSuccess, authFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
