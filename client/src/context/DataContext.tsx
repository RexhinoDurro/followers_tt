// File: client/src/context/DataContext.tsx - Fixed data context with better error handling
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  Client, 
  Task, 
  ContentPost, 
  PerformanceData, 
  Message, 
  Invoice 
} from '../types';

interface DataContextType {
  clients: Client[];
  tasks: Task[];
  content: ContentPost[];
  performance: PerformanceData[];
  messages: Message[];
  invoices: Invoice[];
  refreshData: () => void;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType>({
  clients: [],
  tasks: [],
  content: [],
  performance: [],
  messages: [],
  invoices: [],
  refreshData: () => {},
  loading: true,
  error: null
});

interface DataProviderProps {
  children: ReactNode;
}

// ✅ Create API service with proper error handling
class DataApiService {
  private baseUrl = 'http://localhost:8000/api';
  
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    return headers;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Authentication failed');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getClients(): Promise<Client[]> {
    return this.makeRequest<Client[]>('/clients/');
  }

  async getTasks(): Promise<Task[]> {
    return this.makeRequest<Task[]>('/tasks/');
  }

  async getContent(): Promise<ContentPost[]> {
    return this.makeRequest<ContentPost[]>('/content/');
  }

  async getPerformanceData(): Promise<PerformanceData[]> {
    return this.makeRequest<PerformanceData[]>('/performance/');
  }

  async getMessages(): Promise<Message[]> {
    return this.makeRequest<Message[]>('/messages/');
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.makeRequest<Invoice[]>('/invoices/');
  }
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const api = new DataApiService();

  const refreshData = async () => {
    // ✅ Only fetch data if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // ✅ Fetch data in parallel with error handling for each request
      const results = await Promise.allSettled([
        api.getClients().catch(() => []),
        api.getTasks().catch(() => []),
        api.getContent().catch(() => []),
        api.getPerformanceData().catch(() => []),
        api.getMessages().catch(() => []),
        api.getInvoices().catch(() => [])
      ]);

      // ✅ Set data from successful requests
      if (results[0].status === 'fulfilled') setClients(results[0].value);
      if (results[1].status === 'fulfilled') setTasks(results[1].value);
      if (results[2].status === 'fulfilled') setContent(results[2].value);
      if (results[3].status === 'fulfilled') setPerformance(results[3].value);
      if (results[4].status === 'fulfilled') setMessages(results[4].value);
      if (results[5].status === 'fulfilled') setInvoices(results[5].value);

      // ✅ Check for authentication errors
      const authErrors = results.filter(result => 
        result.status === 'rejected' && 
        result.reason?.message === 'Authentication failed'
      );

      if (authErrors.length > 0) {
        throw new Error('Authentication failed');
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      
      // ✅ If authentication failed, redirect to login
      if (error instanceof Error && error.message === 'Authentication failed') {
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []); // Only run on mount

  return (
    <DataContext.Provider value={{
      clients,
      tasks,
      content,
      performance,
      messages,
      invoices,
      refreshData,
      loading,
      error
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};