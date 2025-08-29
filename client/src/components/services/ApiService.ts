// client/src/services/ApiService.ts - Fixed with proper types

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Token ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return null as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    company?: string;
  }) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.token = response.token;
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    if (this.token) {
      await this.request('/auth/logout/', {
        method: 'POST',
      });
    }
    
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser() {
    return await this.request('/auth/me/');
  }

  // Dashboard stats methods
  async getDashboardStats() {
    return await this.request('/dashboard/stats/');
  }

  async getClientDashboardStats() {
    return await this.request('/dashboard/client-stats/');
  }

  // Client methods
  async getClients() {
    return await this.request('/clients/');
  }

  async getClient(id: string) {
    return await this.request(`/clients/${id}/`);
  }

  async updateClient(id: string, data: any) {
    return await this.request(`/clients/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Task methods
  async getTasks() {
    return await this.request('/tasks/');
  }

  async createTask(taskData: any) {
    return await this.request('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, data: any) {
    return await this.request(`/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return await this.request(`/tasks/${id}/`, {
      method: 'DELETE',
    });
  }

  // Content methods
  async getContent() {
    return await this.request('/content/');
  }

  async createContent(contentData: any) {
    return await this.request('/content/', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async approveContent(id: string) {
    return await this.request(`/content/${id}/approve/`, {
      method: 'POST',
    });
  }

  async rejectContent(id: string) {
    return await this.request(`/content/${id}/reject/`, {
      method: 'POST',
    });
  }

  // Performance data methods
  async getPerformanceData(clientId?: string) {
    const endpoint = clientId ? `/performance/?client_id=${clientId}` : '/performance/';
    return await this.request(endpoint);
  }

  async getMonthlyReport(month?: string) {
    const endpoint = month ? `/performance/monthly_report/?month=${month}` : '/performance/monthly_report/';
    return await this.request(endpoint);
  }

  // Message methods
  async getMessages() {
    return await this.request('/messages/');
  }

  async sendMessage(receiverId: string, content: string) {
    return await this.request('/messages/', {
      method: 'POST',
      body: JSON.stringify({ receiver: receiverId, content }),
    });
  }

  async markMessageRead(messageId: string) {
    return await this.request(`/messages/${messageId}/mark_read/`, {
      method: 'POST',
    });
  }

  async getConversations() {
    return await this.request('/messages/conversations/');
  }

  // Invoice methods
  async getInvoices() {
    return await this.request('/invoices/');
  }

  async markInvoicePaid(id: string) {
    return await this.request(`/invoices/${id}/mark_paid/`, {
      method: 'POST',
    });
  }

  // Notification methods
  async getNotifications() {
    return await this.request('/notifications/');
  }

  async markNotificationRead(id: string) {
    return await this.request(`/notifications/${id}/mark_read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return await this.request('/notifications/mark_all_read/', {
      method: 'POST',
    });
  }

  // Analytics methods
  async getAnalyticsOverview() {
    return await this.request('/analytics/overview/');
  }

  async getClientPerformanceReport(clientId: string) {
    return await this.request(`/analytics/client/${clientId}/`);
  }

  // Social Media Account methods
  async getConnectedAccounts() {
    return await this.request('/social-accounts/');
  }

  async initiateOAuth(platform: string) {
    return await this.request(`/oauth/${platform}/initiate/`);
  }

  async handleOAuthCallback(platform: string, code: string, state: string) {
    return await this.request(`/oauth/${platform}/callback/`, {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  async disconnectAccount(accountId: string) {
    return await this.request(`/social-accounts/${accountId}/disconnect/`, {
      method: 'POST',
    });
  }

  async triggerManualSync(accountId: string) {
    return await this.request(`/social-accounts/${accountId}/sync/`, {
      method: 'POST',
    });
  }

  async getSyncStatus(accountId: string) {
    return await this.request(`/social-accounts/${accountId}/status/`);
  }

  // Real-time metrics
  async getRealTimeMetrics() {
    return await this.request('/metrics/realtime/');
  }

  // File upload methods
  async uploadFile(file: File, clientId: string, fileType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('client', clientId);
    formData.append('file_type', fileType);

    return await this.request('/files/', {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Token ${this.token}` }),
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });
  }

  // Health check
  async healthCheck() {
    return await this.request('/health/');
  }

  // Utility methods
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export a singleton instance
export default new ApiService();