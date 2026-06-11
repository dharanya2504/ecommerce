import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import App from './App';
import './index.css';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Avoid excessive refetches on tab changes
      retry: 1, // Retry failed requests once
      staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FFFFFF',
                color: '#1E293B',
                borderRadius: '12px',
                border: '1px solid rgba(84, 99, 128, 0.15)',
                boxShadow: '0 8px 30px rgba(84, 99, 128, 0.08)',
                fontSize: '14px',
                fontFamily: 'Outfit, sans-serif',
              },
              success: {
                iconTheme: {
                  primary: '#546380',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
