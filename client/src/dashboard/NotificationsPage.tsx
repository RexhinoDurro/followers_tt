// client/src/dashboard/NotificationsPage.tsx - NEW FILE
import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  TrendingUp, 
  FileText,
  Check,
  Clock,
  Filter
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'content_approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'task_assigned':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'payment_due':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'message_received':
        return <MessageSquare className="w-6 h-6 text-purple-500" />;
      case 'performance_update':
        return <TrendingUp className="w-6 h-6 text-indigo-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'content_approved':
        return 'bg-green-50 border-green-200';
      case 'task_assigned':
        return 'bg-blue-50 border-blue-200';
      case 'payment_due':
        return 'bg-yellow-50 border-yellow-200';
      case 'message_received':
        return 'bg-purple-50 border-purple-200';
      case 'performance_update':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'content_approved':
        return 'Content Updates';
      case 'task_assigned':
        return 'Tasks';
      case 'payment_due':
        return 'Payments';
      case 'message_received':
        return 'Messages';
      case 'performance_update':
        return 'Performance';
      default:
        return 'Other';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) !== 1 ? 's' : ''} ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) !== 1 ? 's' : ''} ago`;
    
    // Show full date for older notifications
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    const notifType = notification.notification_type;
    switch (notifType) {
      case 'content_approved':
        window.location.hash = 'content';
        break;
      case 'message_received':
        window.location.hash = 'messages';
        break;
      case 'payment_due':
        window.location.hash = user?.role === 'admin' ? 'invoices' : 'billing';
        break;
      case 'task_assigned':
        window.location.hash = 'tasks';
        break;
      case 'performance_update':
        window.location.hash = 'performance';
        break;
      default:
        window.location.hash = 'overview';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    
    // Filter by type
    if (typeFilter !== 'all') {
      const notifType = notification.notification_type;
      if (notifType !== typeFilter) return false;
    }
    
    return true;
  });

  // Get unique notification types
  const notificationTypes = Array.from(
    new Set(notifications.map(n => n.notification_type))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-7 h-7 mr-3 text-purple-600" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Check className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Read/Unread Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'unread', 'read'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filter === filterType
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 bg-purple-100 text-purple-600 text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              {notificationTypes.map((type) => (
                <option key={type} value={type}>
                  {getTypeName(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up! Check back later for updates."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const notifType = notification.notification_type;
            const typeColor = getTypeColor(notifType);
            
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-purple-500 bg-purple-50/30' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-3 rounded-xl ${typeColor} border`}>
                    {getIcon(notifType)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className={`text-base ${!notification.read ? 'font-bold' : 'font-semibold'} text-gray-900`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <div className="ml-3 flex-shrink-0">
                          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(notification.created_at)}
                      </div>
                      
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {getTypeName(notifType)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Footer */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{notifications.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{notifications.filter(n => n.read).length}</div>
              <div className="text-sm text-gray-600 mt-1">Read</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
              <div className="text-sm text-gray-600 mt-1">Unread</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;