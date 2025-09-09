// client/src/context/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import type { ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: 'task_assigned' | 'payment_due' | 'content_approved' | 'message_received' | 'performance_update';
  read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  addNotification: () => {},
  clearNotifications: () => {},
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // For demo purposes, add mock notifications if API fails
      setNotifications([
        {
          id: '1',
          title: 'New Task Assigned',
          message: 'You have been assigned a new task for Instagram content',
          notification_type: 'task_assigned',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Payment Due',
          message: 'Monthly payment of $1,500 is due on Dec 15',
          notification_type: 'payment_due',
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          title: 'Content Approved',
          message: 'Your TikTok content has been approved',
          notification_type: 'content_approved',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await ApiService.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Still update locally for demo
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Still update locally for demo
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      addNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};