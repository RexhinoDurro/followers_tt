// App.tsx - Main Router Component
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthForm } from './pages/auth/AuthForm';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Admin Pages (Create placeholder components for now)
const AdminOverview = React.lazy(() => import('./pages/admin/AdminOverview'));
const ClientManagement = () => <div>Client Management Page</div>;
const TaskManagement = () => <div>Task Management Page</div>;
const ContentManagement = () => <div>Content Management Page</div>;
const PerformanceManagement = () => <div>Performance Management Page</div>;
const MessageCenter = () => <div>Message Center Page</div>;
const InvoiceManagement = () => <div>Invoice Management Page</div>;
const Settings = () => <div>Settings Page</div>;

// Client Pages (Create placeholder components for now)
const ClientOverview = React.lazy(() => import('./pages/client/ClientOverview'));
const ClientContent = () => <div>Client Content Page</div>;
const ClientPerformance = () => <div>Client Performance Page</div>;
const ClientMessages = () => <div>Client Messages Page</div>;
const ClientBilling = () => <div>Client Billing Page</div>;

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
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <AdminOverview />
          </React.Suspense>
        );
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
        return (
          <React.Suspense fallback={<LoadingSpinner />}>
            <ClientOverview />
          </React.Suspense>
        );
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