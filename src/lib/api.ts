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
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
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

      // If 401 Unauthorized, try to refresh token
      if (response.status === 401 && endpoint !== '/auth/refresh-token') {
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
        throw new Error(data.message || 'API request failed');
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
    password: string;
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

  // Load endpoints
  async createLoad(loadData: {
    origin: { city: string; postalCode: string };
    destination: { city: string; postalCode: string };
    loadAmount: number;
    paymentTerms: number;
  }) {
    return this.request('/loads', {
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

  async deleteLoad(id: string) {
    return this.request(`/loads/${id}`, { method: 'DELETE' });
  }

  async assignDriver(loadId: string, driverId: string) {
    return this.request(`/loads/${loadId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ driverId }),
    });
  }

  async acceptLoad(loadId: string) {
    return this.request(`/loads/${loadId}/accept`, { method: 'PATCH' });
  }

  async declineLoad(loadId: string) {
    return this.request(`/loads/${loadId}/decline`, { method: 'PATCH' });
  }

  async uploadPOD(loadId: string, imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request(`/loads/${loadId}/pod`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
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
}

export const api = new ApiClient(API_URL);
export default api;
