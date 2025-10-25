// client/src/services/ApiService.ts - Updated for PayPal integration
class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://montrose.agency/api';
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
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/auth';
          throw new Error('Authentication failed');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return null as T;
      }

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

  // Helper method to handle paginated responses from Django REST Framework
  private handlePaginatedResponse<T>(response: any): T {
    // Check if response is paginated (has 'results' field)
    if (response && typeof response === 'object' && 'results' in response) {
      // Return just the results array for backward compatibility
      return response.results as T;
    }
    // If not paginated, return as-is
    return response as T;
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
    
    this.clearToken();
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

  // Client methods - FIXED with pagination handling
  async getClients() {
    const response = await this.request('/clients/');
    return this.handlePaginatedResponse(response);
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

  async updatePaymentStatus(id: string, paymentStatus: string) {
    return await this.request(`/clients/${id}/update_payment_status/`, {
      method: 'POST',
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
  }

  // Task methods - FIXED with pagination handling
  async getTasks() {
    const response = await this.request('/tasks/');
    return this.handlePaginatedResponse(response);
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

  async bulkUpdateTasks(data: {
    task_ids: string[];
    status?: string;
    assigned_to?: string;
    priority?: string;
  }) {
    return await this.request('/tasks/bulk_update/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Content methods - UPDATED with FormData handling and new methods
  async getContent() {
    const response = await this.request('/content/');
    return this.handlePaginatedResponse(response);
  }

  async createContent(contentData: any) {
    // If contentData is FormData, send it directly
    if (contentData instanceof FormData) {
      const url = `${this.baseURL}/content/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(this.token && { Authorization: `Token ${this.token}` }),
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: contentData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }

    // Otherwise use the regular request method
    return await this.request('/content/', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async updateContent(id: string, contentData: any) {
  // Support both FormData and regular JSON updates
  if (contentData instanceof FormData) {
    const url = `${this.baseURL}/content/${id}/`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...(this.token && { Authorization: `Token ${this.token}` }),
      },
      body: contentData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

    return await this.request(`/content/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(contentData),
    });
  }

  async deleteContent(id: string) {
    return await this.request(`/content/${id}/`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteContent(data: { content_ids: string[] }) {
  return await this.request('/content/bulk_delete/', {
    method: 'POST',
    body: JSON.stringify(data),
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

  async markContentPosted(id: string, data: { 
    post_url: string; 
    likes?: number; 
    comments?: number; 
    shares?: number; 
    views?: number; 
  }) {
    return await this.request(`/content/${id}/mark_posted/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkApproveContent(data: {
    content_ids: string[];
    action: 'approve' | 'reject';
    feedback?: string;
  }) {
    return await this.request('/content/bulk_approve/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkMarkContentPosted(data: { content_ids: string[] }) {
    return await this.request('/content/bulk_mark_posted/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async setContentDraft(id: string) {
    return await this.request(`/content/${id}/set_draft/`, {
      method: 'POST',
    });
  }

  async getContentByPlatform(platform: 'instagram' | 'youtube' | 'tiktok') {
    return await this.request(`/content/by_platform/?platform=${platform}`);
  }

  async getContentCalendarView(startDate?: string, endDate?: string) {
    let url = '/content/calendar_view/';
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return await this.request(url);
  }

  // Performance data methods - FIXED with pagination handling
  async getPerformanceData(clientId?: string) {
    const endpoint = clientId ? `/performance/?client_id=${clientId}` : '/performance/';
    const response = await this.request(endpoint);
    return this.handlePaginatedResponse(response);
  }

  async getMonthlyReport(month?: string) {
    const endpoint = month ? `/performance/monthly_report/?month=${month}` : '/performance/monthly_report/';
    return await this.request(endpoint);
  }

  // Message methods - FIXED with pagination handling
  async getMessages() {
    const response = await this.request('/messages/');
    return this.handlePaginatedResponse(response);
  }

  async sendMessage(receiverId: string, content: string) {
    // Handle special case for sending to admin
    if (receiverId === 'admin') {
      return await this.request('/messages/send-to-admin/', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    }
    
    // For admin sending to client
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      return await this.request('/messages/send-to-client/', {
        method: 'POST',
        body: JSON.stringify({ client_id: receiverId, content }),
      });
    }
    
    // Default behavior for direct user-to-user messages
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      const response = await this.request('/messages/admin-conversations/');
      // Admin conversations endpoint returns a custom format
      if (response && typeof response === 'object' && 'conversations' in response) {
        return (response as any).conversations;
      }
      return response;
    }
    const response = await this.request('/messages/conversations/');
    return this.handlePaginatedResponse(response);
  }
  
  async getConversationMessages(userId: string) {
    const response = await this.request(`/messages/conversation/${userId}/`);
    return this.handlePaginatedResponse(response);
  }

  // Invoice methods - FIXED with pagination handling
  async getInvoices() {
    const response = await this.request('/invoices/');
    return this.handlePaginatedResponse(response);
  }

  async markInvoicePaid(id: string) {
    return await this.request(`/invoices/${id}/mark_paid/`, {
      method: 'POST',
    });
  }

  async createInvoice(invoiceData: any) {
    return await this.request('/invoices/', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  // Notification methods - FIXED with pagination handling
  async getNotifications() {
    const response = await this.request('/notifications/');
    return this.handlePaginatedResponse(response);
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

  // Social Media Account methods - FIXED with pagination handling
  async getConnectedAccounts() {
    const response = await this.request('/social-accounts/');
    // Check if this is the OAuth view response format
    if (response && typeof response === 'object' && 'accounts' in response) {
      return (response as any).accounts;
    }
    return this.handlePaginatedResponse(response);
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
    const response = await this.request('/metrics/realtime/');
    // Real-time metrics has a custom response format
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as any).data;
    }
    return response;
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

  
  // ============ PAYPAL BILLING METHODS (replacing Stripe methods) ============
  
  // Get available subscription plans
  async getAvailablePlans() {
    return await this.request('/billing/plans/');
  }

  // Get current subscription
  async getCurrentSubscription() {
    return await this.request('/billing/subscription/');
  }

  // Create PayPal subscription
  async createSubscription(data: { price_id: string; plan_name: string }) {
    return await this.request('/billing/create-subscription/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Approve PayPal subscription after user approval
  async approveSubscription(data: { subscription_id: string }) {
    return await this.request('/billing/approve-subscription/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cancel subscription
  async cancelSubscription(data?: { reason?: string }) {
    return await this.request('/billing/cancel-subscription/', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // Pay specific invoice with PayPal
  async payInvoice(invoiceId: string) {
    return await this.request(`/billing/invoices/${invoiceId}/pay/`, {
      method: 'POST',
    });
  }

  // Capture PayPal payment after approval
  async capturePayment(data: { order_id: string }) {
    return await this.request('/billing/capture-payment/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get saved payment methods (PayPal doesn't support this)
  async getPaymentMethods() {
    return await this.request('/billing/payment-methods/');
  }

  // Create setup intent for saving payment methods (PayPal doesn't support this)
  async createSetupIntent() {
    return await this.request('/billing/create-setup-intent/', {
      method: 'POST',
    });
  }

  // Set default payment method (PayPal doesn't support this)
  async setDefaultPaymentMethod(paymentMethodId: string) {
    return await this.request(`/billing/payment-methods/${paymentMethodId}/set-default/`, {
      method: 'POST',
    });
  }

  // Delete payment method (PayPal doesn't support this)
  async deletePaymentMethod(paymentMethodId: string) {
    return await this.request(`/billing/payment-methods/${paymentMethodId}/delete/`, {
      method: 'DELETE',
    });
  }

      // ============ EMAIL VERIFICATION METHODS ============

    async sendVerificationCode(data: {
      email: string;
      name: string;
      purpose?: 'registration' | 'password_reset';
    }) {
      return await this.request('/auth/send-verification-code/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    async verifyAndRegister(data: {
      email: string;
      password: string;
      name: string;
      role: string;
      company?: string;
      verification_code: string;
    }) {
      const response = await this.request<{
        user: any;
        token: string;
      }>('/auth/verify-and-register/', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    }

    async resendVerificationCode(data: {
      email: string;
      name: string;
      purpose?: 'registration' | 'password_reset';
    }) {
      return await this.request('/auth/resend-verification-code/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  // ============ ADMIN METHODS ============
  
  // Get admin billing settings
  async getAdminBillingSettings() {
    return await this.request('/admin/billing-settings/');
  }

  // Update profile
  async updateProfile(profileData: any) {
    return await this.request('/auth/me/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Update profile with avatar
  async updateProfileWithAvatar(profileData: any, avatarFile?: File) {
    const formData = new FormData();
    
    // Add profile fields
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });
    
    // Add avatar if provided
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const url = `${this.baseURL}/auth/me/`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${this.token}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return await response.json();
  }

  // Change password
  async changePassword(data: { current_password: string; new_password: string }) {
    return await this.request('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Delete admin account
  async deleteAdminAccount() {
    return await this.request('/admin/delete-account/', {
      method: 'POST',
    });
  }

  // ============ ADMIN BANK SETTINGS METHODS ============
  
  /**
   * Get admin bank account settings for displaying to clients
   */
  async getAdminBankSettings() {
    return await this.request('/admin/bank-settings/');
  }

  /**
   * Update admin bank account settings (admin only)
   */
  async updateAdminBankSettings(data: {
    admin_full_name: string;
    iban: string;
    bank_name?: string;
    swift_code?: string;
    additional_info?: string;
  }) {
    return await this.request('/admin/bank-settings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Submit payment verification for bank transfer (client)
   */
  async submitPaymentVerification(data: {
    plan: string;
    amount: number;
    client_full_name: string;
  }) {
    return await this.request('/billing/submit-verification/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get pending payment verifications (admin only)
   */
  async getPendingVerifications() {
    return await this.request('/admin/pending-verifications/');
  }

  /**
   * Approve payment verification (admin only)
   */
  async approvePaymentVerification(verificationId: string, planId: string) {
    return await this.request(`/admin/approve-verification/${verificationId}/`, {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    });
  }

  // New method to get all pages of paginated data if needed
  async getAllPaginatedData<T>(endpoint: string, maxPages: number = 10): Promise<T[]> {
    let allData: T[] = [];
    let nextUrl: string | null = endpoint;
    let pageCount = 0;

    while (nextUrl && pageCount < maxPages) {
      const response: any = await this.request<any>(nextUrl.replace(this.baseURL, ''));
      
      if (response && typeof response === 'object' && 'results' in response) {
        allData = allData.concat(response.results as T[]);
        nextUrl = response.next;
      } else {
        allData = allData.concat(response as T[]);
        nextUrl = null;
      }
      
      pageCount++;
    }

    return allData;
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