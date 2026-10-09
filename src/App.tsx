/**
 * AuthShield – Secure Authentication & Brute-Force Detection System
 * Phase 2: Real Authentication System Active
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { MainLayout } from './layouts/MainLayout.tsx';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';

// Public Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';

// Authenticated Pages
import { DashboardPage } from './pages/DashboardPage.tsx';
import { SecurityEventsPage } from './pages/SecurityEventsPage.tsx';
import { LoginActivityPage } from './pages/LoginActivityPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/security-events" element={<SecurityEventsPage />} />
                <Route path="/login-activity" element={<LoginActivityPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

