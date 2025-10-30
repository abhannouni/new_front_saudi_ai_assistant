import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { setTheme } from './store/slices/uiSlice.js';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import Dashboard from './pages/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  // Apply theme changes whenever theme state updates
  useEffect(() => {
    console.log('App: theme changed to', theme);

    const applyTheme = (currentTheme) => {
      // Remove all theme classes
      document.documentElement.classList.remove('dark', 'light');

      // Apply the current theme
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        console.log('App: Applied dark class');
      } else {
        document.documentElement.classList.add('light');
        console.log('App: Applied light class');
      }

      console.log('App: HTML classes now:', document.documentElement.className);
    };

    applyTheme(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes with Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

