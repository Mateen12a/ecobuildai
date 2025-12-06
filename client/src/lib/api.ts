const API_BASE = '/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export interface UserPreferences {
  emailAlerts: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
  measurementSystem: 'metric' | 'imperial';
  currency: 'USD' | 'EUR' | 'GBP';
}

export interface UserAppearance {
  darkMode: boolean;
  compactView: boolean;
  reduceMotion: boolean;
}

export interface UserPrivacy {
  publicProfile: boolean;
  showActivity: boolean;
  allowDataCollection: boolean;
}

export interface ScanResult {
  success: boolean;
  scanId: string;
  prediction: { class: string; className: string; confidence: number };
  allPredictions: { class: string; className: string; confidence: number }[];
  material: {
    name: string;
    embodiedEnergy: number;
    embodiedCarbon: number;
    density: number;
    thermalConductivity?: number;
    recyclability?: string;
    alternatives: { key: string; name: string; embodiedCarbon: number; embodiedEnergy: number }[];
  };
  analysis: {
    imagePath: string;
    confidence: number;
    modelName: string;
    boundingBox?: { x: number; y: number; width: number; height: number };
    isSimulation: boolean;
  };
  isGuest: boolean;
  scansRemaining: number | null;
}

class ApiClient {
  private token: string | null = null;
  private guestToken: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    this.guestToken = localStorage.getItem('guestToken');
    if (!this.guestToken) {
      this.guestToken = this.generateGuestToken();
      localStorage.setItem('guestToken', this.guestToken);
    }
  }

  private generateGuestToken(): string {
    return 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
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

  getGuestToken() {
    return this.guestToken || localStorage.getItem('guestToken');
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

  async register(data: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
    company?: string; 
    jobTitle?: string 
  }) {
    const guestToken = this.getGuestToken();
    const result = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: { ...data, guestToken },
    });
    this.setToken(result.token);
    return result;
  }

  async login(email: string, password: string) {
    const guestToken = this.getGuestToken();
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password, guestToken },
    });
    this.setToken(result.token);
    return result;
  }

  async googleAuth(data: { googleId: string; email: string; firstName: string; lastName: string; avatar?: string }) {
    const guestToken = this.getGuestToken();
    const result = await this.request<{ user: any; token: string }>('/auth/google', {
      method: 'POST',
      body: { ...data, guestToken },
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

  async updateProfile(data: { 
    firstName?: string; 
    lastName?: string; 
    bio?: string;
    company?: string; 
    jobTitle?: string; 
    avatar?: string 
  }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: data,
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.request<{ avatar: string; user: any }>('/auth/avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async updatePreferences(data: Partial<UserPreferences>) {
    return this.request<any>('/auth/preferences', {
      method: 'PUT',
      body: data,
    });
  }

  async updateAppearance(data: Partial<UserAppearance>) {
    return this.request<any>('/auth/appearance', {
      method: 'PUT',
      body: data,
    });
  }

  async updatePrivacy(data: Partial<UserPrivacy>) {
    return this.request<any>('/auth/privacy', {
      method: 'PUT',
      body: data,
    });
  }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
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

  async getMaterialsWithImages(limit: number = 10) {
    return this.request<any[]>(`/materials/with-images/list?limit=${limit}`);
  }

  getMaterialImageUrl(imageId: string) {
    return `/api/materials/image/${imageId}`;
  }

  async getMaterialImages(materialKey: string, limit: number = 10) {
    return this.request<{ id: string; filename: string; materialOfficial: string; contentType: string }[]>(
      `/materials/by-key/${materialKey}/images?limit=${limit}`
    );
  }

  async getModelStatus() {
    return this.request<{ available: boolean; model?: any; message?: string }>('/models/active');
  }

  async scanMaterial(formData: FormData): Promise<ScanResult> {
    if (!this.isAuthenticated()) {
      formData.append('guestToken', this.getGuestToken() || '');
    }
    return this.request<ScanResult>('/scans/predict', {
      method: 'POST',
      body: formData,
    });
  }

  async getGuestScans() {
    const guestToken = this.getGuestToken();
    return this.request<{ scans: any[]; count: number; remaining: number }>(`/scans/guest/${guestToken}`);
  }

  async getScans(limit?: number) {
    return this.request<any[]>(`/scans${limit ? `?limit=${limit}` : ''}`);
  }

  async getScan(id: string) {
    return this.request<any>(`/scans/${id}`);
  }

  async deleteScan(id: string) {
    return this.request<any>(`/scans/${id}`, {
      method: 'DELETE',
    });
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

  async getMLModels() {
    return this.request<any[]>('/models');
  }

  async getMLModel(id: string) {
    return this.request<any>(`/models/${id}`);
  }

  async getMLModelStats() {
    return this.request<any>('/models/stats');
  }

  async getLocalModels() {
    return this.request<any[]>('/models/local');
  }

  async testModel(formData: FormData) {
    return this.request<{ prediction: string; confidence: number; allPredictions: { class: string; confidence: number }[] }>('/models/test', {
      method: 'POST',
      body: formData,
    });
  }

  async syncModel(modelId: string) {
    return this.request<any>(`/models/sync/${modelId}`, {
      method: 'POST',
    });
  }

  async activateModel(modelId: string) {
    return this.request<any>(`/models/${modelId}/activate`, {
      method: 'POST',
    });
  }

  async startTraining(config: { epochs: number; batchSize: number; learningRate: number; validationSplit: number; enableSegmentation: boolean }) {
    return this.request<any>('/models/train', {
      method: 'POST',
      body: config,
    });
  }
}

export const api = new ApiClient();
export default api;
