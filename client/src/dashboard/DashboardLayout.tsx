// client/src/dashboard/DashboardLayout.tsx - Updated with Working Notifications
import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Menu, 
  X 
} from 'lucide-react';
import type { AuthUser } from '../types';
import { Button } from '../components/ui';
import { NotificationDropdown } from '../components/NotificationDropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: AuthUser | null;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  const navigation = user.role === 'admin' ? [
    { name: 'Home', href: '/', icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { name: 'Overview', href: '#overview', icon: BarChart3 },
    { name: 'Clients', href: '#clients', icon: Users },
    { name: 'Tasks', href: '#tasks', icon: CheckCircle },
    { name: 'Content', href: '#content', icon: FileText },
    { name: 'Performance', href: '#performance', icon: TrendingUp },
    { name: 'Messages', href: '#messages', icon: MessageSquare },
    { name: 'Invoices', href: '#invoices', icon: DollarSign },
    { name: 'Settings', href: '#settings', icon: Settings }
  ] : [
    { name: 'Home', href: '/', icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { name: 'Overview', href: '#overview', icon: BarChart3 },
    { name: 'Content', href: '#content', icon: FileText },
    { name: 'Performance', href: '#performance', icon: TrendingUp },
    { name: 'Messages', href: '#messages', icon: MessageSquare },
    { name: 'Billing', href: '#billing', icon: DollarSign }
  ];

  // Get display name with fallback
  const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

  // Get current active page from hash
  const currentHash = window.location.hash || '#overview';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-purple-600 to-pink-600">
          <h1 className="text-xl font-bold text-white">VISIONBOOST</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-purple-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => {
            const isActive = currentHash === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-gray-700 transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600'
                    : 'hover:bg-purple-50 hover:text-purple-600 hover:border-r-2 hover:border-purple-600'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              {user.company && (
                <p className="text-xs text-gray-400 truncate">{user.company}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1 px-4 lg:px-0">
              <h2 className="text-2xl font-semibold text-gray-900">
                {navigation.find(item => item.href === currentHash)?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Dropdown */}
              <NotificationDropdown />
              
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role} Account</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};