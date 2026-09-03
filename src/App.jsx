import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminGuard } from './components/AdminGuard';
import { AdminLayout } from './components/Layout/AdminLayout';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

import { ProvisionPage } from './pages/ProvisionPage';
import { TagsPage } from './pages/TagsPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { CardTapPage } from './pages/CardTapPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Customer Routes */}
            <Route path="/card/:cardUid" element={<CardTapPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />

            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Navigate to="/admin/provision" replace />} />
              <Route path="provision" element={<ProvisionPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="waitlist" element={<Navigate to="/admin/customers" replace />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Root & Catch-all Fallback */}
            <Route path="/" element={<Navigate to="/admin/provision" replace />} />
            <Route path="*" element={<Navigate to="/admin/provision" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
