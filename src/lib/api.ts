const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  refreshToken?: string;
  user?: any;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('truckflow_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('truckflow_refresh_token');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('truckflow_token', token);
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.success && data.token) {
        this.setToken(data.token);
        return data.token;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add language preference header
    if (typeof window !== 'undefined') {
      const locale = localStorage.getItem('truck-flow-locale') || 'en';
      headers['Accept-Language'] = locale;
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(options.headers !== undefined ? false : true),
        ...options.headers,
      },
    };

    try {
      let response = await fetch(url, config);

      // If 401 Unauthorized, try to refresh token (but not for login/auth endpoints)
      const isAuthEndpoint = endpoint.includes('/auth/login') || 
                            endpoint.includes('/auth/refresh-token') ||
                            endpoint.includes('/auth/setup-password') ||
                            endpoint.includes('/auth/reset-password');
      
      if (response.status === 401 && !isAuthEndpoint) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          // Retry request with new token
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${newToken}`,
          };
          response = await fetch(url, config);
        } else {
          // Refresh failed, clear tokens and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.href = '/auth/signin';
          }
          throw new Error('Session expired. Please login again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        // Prefer detailed error if message is generic 'Server error'
        const errorMessage = (data.message === 'Server error' && data.error) 
          ? `${data.message}: ${data.error}` 
          : (data.message || data.error || 'API request failed');
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // User endpoints (Manager only)
  async createDriver(driverData: {
    name: string;
    email: string;
    phone: string;
    preferredLanguage?: string;
  }) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async getAllDrivers() {
    return this.request('/users');
  }

  async getDriver(id: string) {
    return this.request(`/users/${id}`);
  }

  async toggleDriverStatus(id: string) {
    return this.request(`/users/${id}/status`, { method: 'PATCH' });
  }

  async getDriverStats(id: string) {
    return this.request(`/users/${id}/stats`);
  }

  // Load endpoints
  async createLoad(loadData: {
    pickupLocation: string;
    dropoffLocation: string;
    clientName: string;
    clientPrice: number;
    driverPrice?: number;
    shippingType?: string;
    loadWeight?: number;
    pallets?: number;
    loadingDate: Date;
    loadingTime: string;
    paymentTerms: number;
    fuel?: number;
    tolls?: number;
    otherExpenses?: number;
    notes?: string;
    driverId?: string;
    fuelConsumption?: number;
    fuelPricePerLiter?: number;
    driverDailyCost?: number;
    truckCostPerKm?: number;
  }) {
    return this.request('/loads/', {
      method: 'POST',
      body: JSON.stringify(loadData),
    });
  }

  async getAllLoads(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/loads${query}`);
  }

  async getLoad(id: string) {
    return this.request(`/loads/${id}`);
  }

  async updateLoad(id: string, loadData: Partial<{
    pickupLocation: string;
    dropoffLocation: string;
    clientName: string;
    clientPrice: number;
    driverPrice?: number;
    shippingType?: string;
    loadWeight?: number;
    pallets?: number;
    loadingDate: Date;
    loadingTime: string;
    paymentTerms: number;
    fuel?: number;
    tolls?: number;
    otherExpenses?: number;
    notes?: string;
  }>) {
    return this.request(`/loads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(loadData),
    });
  }

  async deleteLoad(id: string) {
    return this.request(`/loads/${id}`, { method: 'DELETE' });
  }

  async assignDriver(loadId: string, driverId: string) {
    return this.request(`/loads/${loadId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ driverId }),
    });
  }

  async calculateDistance(pickupLocation: string, dropoffLocation: string) {
    return this.request('/loads/calculate-distance', {
      method: 'POST',
      body: JSON.stringify({ pickupLocation, dropoffLocation }),
    });
  }

  async calculateCosts(costData: {
    distance: number;
    clientPrice: number;
    fuelConsumption?: number;
    fuelPricePerLiter?: number;
    driverDailyCost?: number;
    truckCostPerKm?: number;
    tolls?: number;
    otherExpenses?: number;
  }) {
    return this.request('/loads/calculate-costs', {
      method: 'POST',
      body: JSON.stringify(costData),
    });
  }

  async acceptLoad(loadId: string) {
    return this.request(`/loads/${loadId}/accept`, { method: 'PATCH' });
  }

  async declineLoad(loadId: string) {
    return this.request(`/loads/${loadId}/decline`, { method: 'PATCH' });
  }

  async startLoad(loadId: string) {
    return this.request(`/loads/${loadId}/start`, { method: 'PATCH' });
  }

  // Dashboard endpoints
  async getManagerDashboard() {
    return this.request('/dashboard/manager');
  }

  async getDriverDashboard() {
    return this.request('/dashboard/driver');
  }

  // Export endpoint
  async exportLoads(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const url = `${this.baseUrl}/exports/loads${query ? `?${query}` : ''}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Update user profile
  async updateProfile(profileData: {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    avatar?: string;
    password?: string;
  }) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Get all drivers (manager only)
  async getDrivers() {
    return this.request('/users');
  }

  // Upload file (invoice or document)
  async uploadFile(file: File, type: 'invoice' | 'documents') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });
  }

  // Notification endpoints
  async getNotifications(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/notifications${query}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }

  // Route endpoints
  async createRoute(routeData: {
    routeName: string;
    assignedDriverId: string;
    assignedTruck?: {
      truckNumber?: string;
      truckType?: string;
      capacity?: number;
    };
    startDate: Date;
    endDate?: Date;
    fuelConsumption?: number;
    fuelPricePerLiter?: number;
    driverDailyCost?: number;
    truckCostPerKm?: number;
    tolls?: number;
    otherExpenses?: number;
    notes?: string;
    loadIds?: string[];
  }) {
    return this.request('/routes/', {
      method: 'POST',
      body: JSON.stringify(routeData),
    });
  }

  async getAllRoutes(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/routes${query}`);
  }

  async getRoute(id: string) {
    return this.request(`/routes/${id}`);
  }

  async updateRoute(id: string, routeData: any) {
    return this.request(`/routes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(routeData),
    });
  }

  async deleteRoute(id: string) {
    return this.request(`/routes/${id}`, { method: 'DELETE' });
  }

  async addLoadsToRoute(routeId: string, loadIds: string[]) {
    return this.request(`/routes/${routeId}/loads`, {
      method: 'POST',
      body: JSON.stringify({ loadIds }),
    });
  }

  async removeLoadFromRoute(routeId: string, loadId: string) {
    return this.request(`/routes/${routeId}/loads/${loadId}`, {
      method: 'DELETE',
    });
  }

  async acceptRoute(routeId: string) {
    return this.request(`/routes/${routeId}/accept`, {
      method: 'PATCH',
    });
  }

  async rejectRoute(routeId: string) {
    return this.request(`/routes/${routeId}/reject`, {
      method: 'PATCH',
    });
  }
}

export const api = new ApiClient(API_URL);
export default api;
