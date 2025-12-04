const API_BASE = '/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; company?: string; jobTitle?: string }) {
    const result = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: data,
    });
    this.setToken(result.token);
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.setToken(result.token);
    return result;
  }

  async googleAuth(data: { googleId: string; email: string; firstName: string; lastName: string; avatar?: string }) {
    const result = await this.request<{ user: any; token: string }>('/auth/google', {
      method: 'POST',
      body: data,
    });
    this.setToken(result.token);
    return result;
  }

  logout() {
    this.setToken(null);
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(data: { firstName?: string; lastName?: string; company?: string; jobTitle?: string; avatar?: string }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: data,
    });
  }

  async getProjects() {
    return this.request<any[]>('/projects');
  }

  async getProject(id: string) {
    return this.request<any>(`/projects/${id}`);
  }

  async createProject(data: any) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: data,
    });
  }

  async updateProject(id: string, data: any) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteProject(id: string) {
    return this.request<any>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async addProjectMaterial(projectId: string, material: any) {
    return this.request<any>(`/projects/${projectId}/materials`, {
      method: 'POST',
      body: material,
    });
  }

  async getMaterials(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/materials${query ? `?${query}` : ''}`);
  }

  async getMaterial(id: string) {
    return this.request<any>(`/materials/${id}`);
  }

  async getMaterialCategories() {
    return this.request<string[]>('/materials/categories');
  }

  async scanMaterial(formData: FormData) {
    return this.request<any>('/scans/predict', {
      method: 'POST',
      body: formData,
    });
  }

  async getScans(limit?: number) {
    return this.request<any[]>(`/scans${limit ? `?limit=${limit}` : ''}`);
  }

  async getScan(id: string) {
    return this.request<any>(`/scans/${id}`);
  }

  async getScanStats() {
    return this.request<any>('/scans/stats');
  }

  async getReports() {
    return this.request<any[]>('/reports');
  }

  async getReport(id: string) {
    return this.request<any>(`/reports/${id}`);
  }

  async generateReport(data: { projectId?: string; type?: string; title?: string }) {
    return this.request<any>('/reports/generate', {
      method: 'POST',
      body: data,
    });
  }

  async deleteReport(id: string) {
    return this.request<any>(`/reports/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardStats() {
    return this.request<any>('/reports/dashboard/stats');
  }
}

export const api = new ApiClient();
export default api;
