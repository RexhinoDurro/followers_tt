// client/src/dashboard/DashboardRouter.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { useAuth } from '../context/AuthContext';

// Admin Pages
import AdminOverview from './admin/AdminOverview';
import AdminClients from './admin/AdminClients';
import AdminTasks from './admin/AdminTasks';
import AdminContent from './admin/AdminContent';
import AdminPerformance from './admin/AdminPerformance';
import AdminMessages from './admin/AdminMessages';
import AdminInvoices from './admin/AdminInvoices';
import AdminSettings from './admin/AdminSettings';

// Client Pages
import ClientOverview from './client/ClientOverview';
import ClientContent from './client/ClientContent';
import ClientPerformance from './client/ClientPerformance';
import ClientMessages from './client/ClientMessages';
import ClientBilling from './client/ClientBilling';

export const DashboardRouter: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('overview');

  // Handle hash-based navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '') || 'overview';
    setCurrentView(hash);
  }, [location]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  // Admin pages mapping
  const adminPages: Record<string, React.ReactNode> = {
    overview: <AdminOverview />,
    clients: <AdminClients />,
    tasks: <AdminTasks />,
    content: <AdminContent />,
    performance: <AdminPerformance />,
    messages: <AdminMessages />,
    invoices: <AdminInvoices />,
    settings: <AdminSettings />
  };

  // Client pages mapping
  const clientPages: Record<string, React.ReactNode> = {
    overview: <ClientOverview />,
    content: <ClientContent />,
    performance: <ClientPerformance />,
    messages: <ClientMessages />,
    billing: <ClientBilling />
  };

  const pages = user.role === 'admin' ? adminPages : clientPages;
  const currentPage = pages[currentView] || pages.overview;

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="animate-fadeIn">
        {currentPage}
      </div>
    </DashboardLayout>
  );
};