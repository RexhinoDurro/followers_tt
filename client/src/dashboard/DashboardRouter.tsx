// client/src/dashboard/DashboardRouter.tsx - UPDATED WITH NOTIFICATIONS
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { useAuth } from '../context/AuthContext';

// Admin Pages
import AdminOverview from './admin/AdminOverview';
import AdminClients from './admin/AdminClients';
import AdminTasks from './admin/AdminTasks';
import AdminContent from './admin/AdminContent.tsx';
import { AdminPerformance } from './admin/AdminPerformance';
import AdminMessages from './admin/AdminMessages.tsx';
import AdminInvoices from './admin/AdminInvoices.tsx';
import AdminSettings from './admin/AdminSettings.tsx';

// Client Pages
import ClientOverview from './client/ClientOverview';
import ClientContent from './client/ClientContent.tsx';
import ClientPerformance from './client/ClientPerformance.tsx';
import ClientMessages from './client/ClientMessages.tsx';
import ClientBilling from './client/ClientBilling.tsx';
import ClientSettings from './client/ClientSettings';

// Shared Pages
import NotificationsPage from './NotificationsPage'; // NEW

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
    settings: <AdminSettings />,
    notifications: <NotificationsPage /> // NEW
  };

  // Client pages mapping
  const clientPages: Record<string, React.ReactNode> = {
    overview: <ClientOverview />,
    content: <ClientContent />,
    performance: <ClientPerformance />,
    messages: <ClientMessages />,
    billing: <ClientBilling />,
    settings: <ClientSettings />,
    notifications: <NotificationsPage /> // NEW
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