import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminRoutes from './routes/AdminRoutes';


function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#121212',
          color: '#e2a750',
          border: '1px solid rgba(226, 167, 80, 0.2)',
          fontSize: '12px',
          fontWeight: 'black',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }
      }} />
      <Routes>

        {/* Unified Admin Management Panel */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        {/* Redirect root to admin panel */}
        <Route path="/" element={<Navigate to="/admin" replace />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
