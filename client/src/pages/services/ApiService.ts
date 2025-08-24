// services/ApiService.ts - API Service Layer
import type { 
  AuthUser, 
  Client, 
  Task, 
  ContentPost, 
  PerformanceData, 
  Message, 
  Invoice 
} from '../../types';

export class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  
  private getHeaders(includeAuth = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Auth
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await fetch(`${this.baseUrl}/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data.user;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'client';
    company?: string;
  }): Promise<AuthUser> {
    const response = await fetch(`${this.baseUrl}/auth/register/`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Registration failed');
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data.user;
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/auth/logout/`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await fetch(`${this.baseUrl}/auth/me/`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to get current user');
    return response.json();
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const response = await fetch(`${this.baseUrl}/clients/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const response = await fetch(`${this.baseUrl}/clients/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData)
    });
    return response.json();
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    const response = await fetch(`${this.baseUrl}/clients/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData)
    });
    return response.json();
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/tasks/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData)
    });
    return response.json();
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData)
    });
    return response.json();
  }

  // Content
  async getContent(): Promise<ContentPost[]> {
    const response = await fetch(`${this.baseUrl}/content/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createContent(contentData: Partial<ContentPost>): Promise<ContentPost> {
    const response = await fetch(`${this.baseUrl}/content/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(contentData)
    });
    return response.json();
  }

  async updateContent(id: string, contentData: Partial<ContentPost>): Promise<ContentPost> {
    const response = await fetch(`${this.baseUrl}/content/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(contentData)
    });
    return response.json();
  }

  // Performance
  async getPerformanceData(clientId?: string): Promise<PerformanceData[]> {
    const url = clientId 
      ? `${this.baseUrl}/performance/?client_id=${clientId}`
      : `${this.baseUrl}/performance/`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createPerformanceData(data: Partial<PerformanceData>): Promise<PerformanceData> {
    const response = await fetch(`${this.baseUrl}/performance/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/messages/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async sendMessage(messageData: {
    receiverId: string;
    content: string;
  }): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(messageData)
    });
    return response.json();
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${this.baseUrl}/invoices/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/invoices/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(invoiceData)
    });
    return response.json();
  }
}