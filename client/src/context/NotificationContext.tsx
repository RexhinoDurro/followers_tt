// client/src/context/NotificationContext.tsx - COMPLETE VERSION
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiService from '../services/ApiService';
import type { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    // Only fetch if we have an auth token
    const token = ApiService.getToken();
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await ApiService.getNotifications();
      
      // Ensure we have an array
      const notificationArray = Array.isArray(data) ? data : [];
      
      // Sort by created_at descending (newest first)
      const sortedNotifications = notificationArray.sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp).getTime();
        const dateB = new Date(b.created_at || b.timestamp).getTime();
        return dateB - dateA;
      });
      
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user has a token before fetching
    const token = ApiService.getToken();
    if (!token) {
      return; // Don't fetch or set up polling if not authenticated
    }

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds (only if authenticated)
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await ApiService.markNotificationRead(id);
      
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Refresh to get correct state
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsRead();
      
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Refresh to get correct state
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};