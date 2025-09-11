// client/src/dashboard/admin/AdminMessages.tsx - Complete Implementation
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Search, MoreVertical, Paperclip, Phone, Video, ChevronLeft
} from 'lucide-react';
import { Button, Modal, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';

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
  name: string;
  role: 'client' | 'admin';
  company?: string;
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
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
}

const AdminMessages: React.FC = () => {
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [conversationsData, clientsDataRaw] = await Promise.all([
        ApiService.getConversations(),
        ApiService.getClients()
      ]);
      
      const clientsData = Array.isArray(clientsDataRaw) ? clientsDataRaw : [];
      
      // Transform clients into conversations format
      const clientConversations: Conversation[] = clientsData.map((client: Client) => ({
        id: client.id,
        name: client.user ? `${client.user.first_name} ${client.user.last_name}` : client.name,
        role: 'client' as const,
        company: client.company,
        unreadCount: 0,
        avatar: client.user?.avatar
      })).filter((conv: Conversation) => conv.name.trim() !== '');  // Filter out any clients without names
      
      setConversations(clientConversations);
      setClients(clientsData);
      
      // Auto-select first conversation if available
      if (clientConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(clientConversations[0]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (userId: string) => {
    try {
      const messagesDataRaw = await ApiService.getMessages();
      const messagesData: Message[] = Array.isArray(messagesDataRaw) ? messagesDataRaw : [];
      // Filter messages for this conversation
      const conversationMessages = messagesData.filter((msg: Message) => 
        msg.sender === userId || msg.receiver === userId
      );
      setMessages(conversationMessages);
      // Mark messages as read
      const unreadMessages = conversationMessages.filter((msg: Message) => 
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
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      setSending(true);
      
      await ApiService.sendMessage(selectedConversation.id, newMessage.trim());
      
      setNewMessage('');
      await fetchConversationMessages(selectedConversation.id);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = async () => {
    if (!selectedClient) return;
    
    const client = clients.find(c => c.id === selectedClient);
    if (client) {
      const newConv: Conversation = {
        id: client.id,
        name: client.user ? `${client.user.first_name} ${client.user.last_name}` : client.name,
        role: 'client',
        company: client.company,
        unreadCount: 0,
        avatar: client.user?.avatar
      };
      
      // Check if conversation already exists
      const existingConv = conversations.find(conv => conv.id === client.id);
      if (!existingConv) {
        setConversations(prev => [...prev, newConv]);
      }
      
      setSelectedConversation(newConv);
      setShowNewConversation(false);
      setSelectedClient('');
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

  if (loading) {
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
              <Button size="sm" onClick={() => setShowNewConversation(true)}>
                <MessageSquare className="w-4 h-4 mr-1" />
                New
              </Button>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender !== selectedConversation.id;
                  
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
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
              <div className="p-4 border-t border-gray-200">
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
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center">
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
              {clients.map((client: Client) => (
                <option key={client.id} value={client.id}>
                  {client.user ? `${client.user.first_name} ${client.user.last_name}` : client.name} - {client.company}
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