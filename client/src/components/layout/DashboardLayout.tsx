// components/layout/DashboardLayout.tsx - Main Layout Component
import React, { useState } from 'react';
import { 
  User, 
  DollarSign, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Bell, 
  Menu, 
  X 
} from 'lucide-react';
import type { AuthUser } from '../../types';
import { Button } from '../ui';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: AuthUser | null;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigation = user?.role === 'admin' ? [
    { name: 'Overview', href: '#overview', icon: BarChart3 },
    { name: 'Clients', href: '#clients', icon: Users },
    { name: 'Tasks', href: '#tasks', icon: CheckCircle },
    { name: 'Content', href: '#content', icon: FileText },
    { name: 'Performance', href: '#performance', icon: TrendingUp },
    { name: 'Messages', href: '#messages', icon: MessageSquare },
    { name: 'Invoices', href: '#invoices', icon: DollarSign },
    { name: 'Settings', href: '#settings', icon: Settings }
  ] : [
    { name: 'Overview', href: '#overview', icon: BarChart3 },
    { name: 'Content', href: '#content', icon: FileText },
    { name: 'Performance', href: '#performance', icon: TrendingUp },
    { name: 'Messages', href: '#messages', icon: MessageSquare },
    { name: 'Billing', href: '#billing', icon: DollarSign }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <h1 className="text-xl font-bold text-white">SMMA Pro</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4" />
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
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
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