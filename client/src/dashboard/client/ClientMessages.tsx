// client/src/dashboard/client/ClientMessages.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Search, Users, 
  CheckCircle, Paperclip, FileText, 
  Phone, Video, MoreVertical, Smile, 
  AlertCircle, RefreshCw, Calendar, Download
} from 'lucide-react';
import { Card, Button, Modal, Badge } from '../../components/ui';
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

const ClientMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchMessages();
    fetchTeamMembers();
    
    // Set up polling for new messages every 30 seconds
    messagePollingRef.current = setInterval(fetchMessages, 30000);
    
    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await ApiService.getMessages();
      let messagesArray: Message[] = [];
      if (Array.isArray(data)) {
        messagesArray = data;
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
        messagesArray = (data as { results: Message[] }).results;
      }
      // Sort messages by timestamp in ascending order (oldest to newest)
      messagesArray.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setMessages(messagesArray);
      
      // Mark unread messages as read
      const unreadMessages = messagesArray.filter((msg: Message) => 
        !msg.read && msg.receiver === user?.id
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
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Mock team members - in a real app, this would come from an API
      setTeamMembers([
        {
          id: 'admin-1',
          name: 'Sarah Johnson',
          role: 'Account Manager',
          status: 'online'
        },
        {
          id: 'admin-2', 
          name: 'Mike Wilson',
          role: 'Content Strategist',
          status: 'away'
        },
        {
          id: 'admin-3',
          name: 'Emma Davis',
          role: 'Social Media Specialist',
          status: 'online'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedFile) return;
    
    try {
      setSending(true);
      
      let messageContent = newMessage.trim();
      
      // Handle file upload
      if (selectedFile) {
        // In a real app, upload the file first and get the URL
        messageContent += selectedFile ? ` [File: ${selectedFile.name}]` : '';
      }
      
      // Send to admin (you might want to specify which team member)
      await ApiService.sendMessage('admin', messageContent);
      
      setNewMessage('');
      setSelectedFile(null);
      await fetchMessages();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communicate with your account management team</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchMessages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowTeamInfo(true)}>
            <Users className="w-4 h-4 mr-2" />
            Team Info
          </Button>
        </div>
      </div>

      {/* Team Status Bar */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Your Team:</span>
            </div>
            <div className="flex items-center space-x-3">
              {teamMembers.slice(0, 3).map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(member.name)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">{member.name}</p>
                    <p className="text-xs text-purple-700">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="success">
              {teamMembers.filter(m => m.status === 'online').length} online
            </Badge>
          </div>
        </div>
      </Card>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 400px)' }}>
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Team Chat</h3>
                  <p className="text-sm text-gray-600">
                    {teamMembers.filter(m => m.status === 'online').length} team members online
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm w-64"
                  />
                </div>
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
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-600 mb-6">
                  Send a message to your account management team. They're here to help!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Account Support</h4>
                    <p className="text-sm text-gray-600">Questions about your account</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Content Planning</h4>
                    <p className="text-sm text-gray-600">Discuss content strategy</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <AlertCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">General Help</h4>
                    <p className="text-sm text-gray-600">Any questions or concerns</p>
                  </div>
                </div>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const isOwnMessage = message.sender === user?.id;
                
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!isOwnMessage && (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {getInitials(message.sender_name)}
                          </div>
                        )}
                        <div className={`px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {!isOwnMessage && (
                            <p className="text-xs font-medium mb-1 text-gray-600">
                              {message.sender_name}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-purple-200' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                            {isOwnMessage && message.read && (
                              <CheckCircle className="w-3 h-3 inline ml-1" />
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            {selectedFile && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            )}
            
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
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  type="button"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={(!newMessage.trim() && !selectedFile) || sending}
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
        </div>
      </div>

      {/* Team Info Modal */}
      <Modal
        isOpen={showTeamInfo}
        onClose={() => setShowTeamInfo(false)}
        title="Your Account Management Team"
        size="md"
      >
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(member.name)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <p className="text-xs text-gray-500 capitalize">{member.status}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Response Time</p>
                <p className="text-sm text-blue-700 mt-1">
                  Our team typically responds within 2-4 hours during business hours (9 AM - 6 PM EST).
                  For urgent matters, please mark your message as priority.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Quick Help Section */}
      <Card title="Quick Help" className="bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Content Calendar</h4>
            <p className="text-sm text-gray-600">Schedule and plan your posts</p>
            <Button size="sm" variant="outline" className="mt-2">View Calendar</Button>
          </div>
          
          <div className="text-center p-4">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Account Review</h4>
            <p className="text-sm text-gray-600">Monthly performance review</p>
            <Button size="sm" variant="outline" className="mt-2">Schedule Review</Button>
          </div>
          
          <div className="text-center p-4">
            <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Reports</h4>
            <p className="text-sm text-gray-600">Download performance reports</p>
            <Button size="sm" variant="outline" className="mt-2">Download</Button>
          </div>
          
          <div className="text-center p-4">
            <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Support</h4>
            <p className="text-sm text-gray-600">Get help and support</p>
            <Button size="sm" variant="outline" className="mt-2">Contact Support</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClientMessages;