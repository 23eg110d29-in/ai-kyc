import React from 'react';
import AppRouter from './router/AppRouter';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <AppRouter />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
