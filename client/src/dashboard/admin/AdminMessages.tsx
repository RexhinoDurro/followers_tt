// client/src/dashboard/admin/AdminMessages.tsx - Fixed Implementation
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Search, MoreVertical, Paperclip, Phone, Video, ChevronLeft,
  RefreshCw, CheckCircle
} from 'lucide-react';
import { Button, Modal, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  sender: string;
  sender_name: string;
  receiver: string;
  receiver_name: string;
  content: string;
  read: boolean;
  timestamp: string;
}

interface Conversation {
  id: string;
  clientId: string;
  userId: string;
  name: string;
  role: 'client' | 'admin';
  company?: string;
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
  email?: string;
}

interface ClientUser {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  user?: ClientUser;
  // New fields from updated serializer
  user_id?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  user_avatar?: string;
}

const AdminMessages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchData();
    
    // Set up polling for new messages every 5 seconds
    messagePollingRef.current = setInterval(() => {
      if (selectedConversation) {
        fetchConversationMessages(selectedConversation.userId, false);
      }
    }, 5000);
    
    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationMessages(selectedConversation.userId);
    }
  }, [selectedConversation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients data...');
      
      // First try to get conversations from the admin endpoint
      try {
        const conversationsData = await ApiService.getConversations();
        console.log('Conversations from API:', conversationsData);
        
        if (Array.isArray(conversationsData) && conversationsData.length > 0) {
          setConversations(conversationsData);
          
          // Auto-select first conversation if available
          if (!selectedConversation && conversationsData.length > 0) {
            setSelectedConversation(conversationsData[0]);
          }
        }
      } catch (convError) {
        console.log('Using fallback method to build conversations from clients');
        
        // Fallback: Build conversations from clients list
        const clientsDataRaw = await ApiService.getClients();
        console.log('Clients data:', clientsDataRaw);
        
        const clientsData = Array.isArray(clientsDataRaw) ? clientsDataRaw : [];
        
        // Transform clients into conversations format
        const clientConversations: Conversation[] = clientsData
          .filter((client: Client) => client.user_id) // Only include clients with user_id
          .map((client: Client) => ({
            id: client.id,
            clientId: client.id,
            userId: client.user_id || '', // Use the user_id from serializer
            name: client.user_first_name && client.user_last_name 
              ? `${client.user_first_name} ${client.user_last_name}`
              : client.name,
            role: 'client' as const,
            company: client.company,
            email: client.user_email || client.email,
            unreadCount: 0,
            avatar: client.user_avatar
          }));
        
        console.log('Transformed conversations:', clientConversations);
        
        setConversations(clientConversations);
        setClients(clientsData);
        
        // Auto-select first conversation if available
        if (clientConversations.length > 0 && !selectedConversation) {
          setSelectedConversation(clientConversations[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchConversationMessages = async (userId: string, showLoading = true) => {
    if (!userId) {
      console.error('No userId provided for fetching messages');
      return;
    }
    
    try {
      if (showLoading) setLoading(true);
      
      console.log('Fetching messages for user:', userId);
      
      // Use the conversation endpoint to get messages for specific user
      const messagesData = await ApiService.getConversationMessages(userId);
      console.log('Received messages:', messagesData);
      
      const messagesArray: Message[] = Array.isArray(messagesData) ? messagesData : [];
      // Sort messages by timestamp in ascending order (oldest to newest)
      messagesArray.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setMessages(messagesArray);
      
      // Mark unread messages as read
      const unreadMessages = messagesArray.filter((msg: Message) => 
        !msg.read && msg.sender === userId
      );
      
      for (const msg of unreadMessages) {
        try {
          await ApiService.markMessageRead(msg.id);
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      setSending(true);
      
      console.log('Sending message to client:', selectedConversation.clientId);
      console.log('Message content:', newMessage.trim());
      
      // Send message using client ID (the API will handle the user lookup)
      await ApiService.sendMessage(selectedConversation.clientId, newMessage.trim());
      
      setNewMessage('');
      
      // Refresh messages
      await fetchConversationMessages(selectedConversation.userId);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = async () => {
    if (!selectedClient) return;
    
    const client = clients.find(c => c.id === selectedClient);
    if (client && client.user_id) {
      const newConv: Conversation = {
        id: client.id,
        clientId: client.id,
        userId: client.user_id,
        name: client.user_first_name && client.user_last_name 
          ? `${client.user_first_name} ${client.user_last_name}`
          : client.name,
        role: 'client',
        company: client.company,
        email: client.user_email || client.email,
        unreadCount: 0,
        avatar: client.user_avatar
      };
      
      // Check if conversation already exists
      const existingConv = conversations.find(conv => conv.clientId === client.id);
      if (!existingConv) {
        setConversations(prev => [...prev, newConv]);
      }
      
      setSelectedConversation(existingConv || newConv);
      setShowNewConversation(false);
      setSelectedClient('');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    if (selectedConversation) {
      await fetchConversationMessages(selectedConversation.userId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conv.company && conv.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterRead === 'all' || 
                         (filterRead === 'unread' && conv.unreadCount > 0) ||
                         (filterRead === 'read' && conv.unreadCount === 0);
    
    return matchesSearch && matchesFilter;
  });

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="flex h-full">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button size="sm" onClick={() => setShowNewConversation(true)}>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  New
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-purple-50 border-purple-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {conversation.avatar ? (
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {getInitials(conversation.name)}
                      </div>
                    )}
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 truncate">{conversation.name}</p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.company && (
                      <p className="text-sm text-gray-600 truncate">{conversation.company}</p>
                    )}
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">No conversations found</p>
                <Button size="sm" onClick={() => setShowNewConversation(true)}>
                  Start a conversation
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {selectedConversation.avatar ? (
                      <img
                        src={selectedConversation.avatar}
                        alt={selectedConversation.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {getInitials(selectedConversation.name)}
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="primary">{selectedConversation.role}</Badge>
                        {selectedConversation.company && (
                          <span className="text-sm text-gray-600">{selectedConversation.company}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => {
                  const isOwnMessage = message.sender === user?.id;
                  
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!isOwnMessage && (
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {getInitials(message.sender_name)}
                            </div>
                          )}
                          <div>
                            <div className={`px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-900 shadow-sm'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-right text-gray-600' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                              {isOwnMessage && message.read && (
                                <CheckCircle className="w-3 h-3 inline ml-1 text-green-500" />
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Start a conversation with {selectedConversation.name}
                    </h3>
                    <p className="text-gray-600">
                      Send a message to begin your conversation.
                    </p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e as any);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" type="button">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sending}
                      size="sm"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose a conversation from the sidebar to start messaging.
                </p>
                <Button onClick={() => setShowNewConversation(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* New Conversation Modal */}
      <Modal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        title="Start New Conversation"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose a client...</option>
              {clients
                .filter(client => client.user_id) // Only show clients with user accounts
                .map((client: Client) => (
                  <option key={client.id} value={client.id}>
                    {client.user_first_name && client.user_last_name 
                      ? `${client.user_first_name} ${client.user_last_name}`
                      : client.name} - {client.company}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowNewConversation(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStartNewConversation}
              disabled={!selectedClient}
            >
              Start Conversation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMessages;