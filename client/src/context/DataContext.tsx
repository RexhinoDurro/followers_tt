// contexts/DataContext.tsx - Data Management Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Client, 
  Task, 
  ContentPost, 
  PerformanceData, 
  Message, 
  Invoice 
} from '../types';
import { ApiService } from '../pages/services/ApiService';

interface DataContextType {
  clients: Client[];
  tasks: Task[];
  content: ContentPost[];
  performance: PerformanceData[];
  messages: Message[];
  invoices: Invoice[];
  refreshData: () => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  clients: [],
  tasks: [],
  content: [],
  performance: [],
  messages: [],
  invoices: [],
  refreshData: () => {},
  loading: true
});

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const api = new ApiService();

  const refreshData = async () => {
    setLoading(true);
    try {
      const [
        clientsData,
        tasksData,
        contentData,
        performanceData,
        messagesData,
        invoicesData
      ] = await Promise.all([
        api.getClients(),
        api.getTasks(),
        api.getContent(),
        api.getPerformanceData(),
        api.getMessages(),
        api.getInvoices()
      ]);

      setClients(clientsData);
      setTasks(tasksData);
      setContent(contentData);
      setPerformance(performanceData);
      setMessages(messagesData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{
      clients,
      tasks,
      content,
      performance,
      messages,
      invoices,
      refreshData,
      loading
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