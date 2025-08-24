// App.tsx - Main Router Component
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthForm } from './pages/auth/AuthForm';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import ClientManagement from './pages/admin/ClientManagement';
import TaskManagement from './pages/admin/TaskManagement';
import ContentManagement from './pages/admin/ContentManagement';
import PerformanceManagement from './pages/admin/PerformanceManagement';
import MessageCenter from './pages/admin/MessageCenter';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import Settings from './pages/admin/Settings';

// Client Pages
import ClientOverview from './pages/client/ClientOverview';
import ClientContent from './pages/client/ClientContent';
import ClientPerformance from './pages/client/ClientPerformance';
import ClientMessages from './pages/client/ClientMessages';
import ClientBilling from './pages/client/ClientBilling';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      setCurrentView(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <AuthForm
        isLogin={isLogin}
        onToggle={() => setIsLogin(!isLogin)}
        onSuccess={() => window.location.reload()}
      />
    );
  }

  const renderAdminView = () => {
    switch (currentView) {
      case 'clients':
        return <ClientManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'content':
        return <ContentManagement />;
      case 'performance':
        return <PerformanceManagement />;
      case 'messages':
        return <MessageCenter />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <AdminOverview />;
    }
  };

  const renderClientView = () => {
    switch (currentView) {
      case 'content':
        return <ClientContent />;
      case 'performance':
        return <ClientPerformance />;
      case 'messages':
        return <ClientMessages />;
      case 'billing':
        return <ClientBilling />;
      default:
        return <ClientOverview />;
    }
  };

  return (
    <DataProvider>
      <DashboardLayout user={user} onLogout={logout}>
        {user.role === 'admin' ? renderAdminView() : renderClientView()}
      </DashboardLayout>
    </DataProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;