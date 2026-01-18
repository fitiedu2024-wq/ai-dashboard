/**
 * Unified API Client
 * Centralizes all API calls with proper error handling and authentication
 */

import {
  AuthResponse,
  User,
  AnalysisResult,
  AdsAnalysisResult,
  SEOComparisonResult,
  KeywordAnalysisResult,
  SentimentResult,
  VisionAIResult,
  AdminStats,
  AdminUsersResponse,
  ActivityLogsResponse,
  APIResponse,
} from './types';

// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-marketing-backend-527790332290.europe-west1.run.app';

// Token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// HTTP request wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - Token expired or invalid
    if (response.status === 401) {
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return { error: 'Session expired. Please login again.', status: 401 };
    }

    // Handle 429 - Rate limited
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      return {
        error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        status: 429
      };
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.detail || `Request failed with status ${response.status}`,
        status: response.status
      };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
      status: 0
    };
  }
}

// ==================== AUTH API ====================

export const authAPI = {
  async login(email: string, password: string): Promise<APIResponse<AuthResponse>> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          error: error.detail || 'Invalid credentials',
          status: response.status
        };
      }

      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
      }
      return { data, status: response.status };
    } catch (error) {
      return {
        error: 'Network error. Please try again.',
        status: 0
      };
    }
  },

  async getUser(): Promise<APIResponse<User>> {
    return request<User>('/api/user');
  },

  async getMe(): Promise<APIResponse<User>> {
    return request<User>('/api/me');
  },

  logout(): void {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};

// ==================== ANALYSIS API ====================

export const analysisAPI = {
  async deepAnalysis(
    domain: string,
    competitors: string[] = [],
    maxPages: number = 50
  ): Promise<APIResponse<AnalysisResult>> {
    return request<AnalysisResult>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ domain, competitors, max_pages: maxPages }),
    });
  },

  async adsAnalysis(domain: string, brandName?: string): Promise<APIResponse<AdsAnalysisResult>> {
    return request<AdsAnalysisResult>('/api/analyze-ads', {
      method: 'POST',
      body: JSON.stringify({ domain, brand_name: brandName }),
    });
  },

  async seoComparison(
    yourDomain: string,
    competitors: string[]
  ): Promise<APIResponse<SEOComparisonResult>> {
    return request<SEOComparisonResult>('/api/seo-comparison', {
      method: 'POST',
      body: JSON.stringify({ your_domain: yourDomain, competitors }),
    });
  },

  async keywordAnalysis(domain: string): Promise<APIResponse<KeywordAnalysisResult>> {
    return request<KeywordAnalysisResult>('/api/keyword-analysis', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  },

  async sentimentAnalysis(text: string): Promise<APIResponse<SentimentResult>> {
    return request<SentimentResult>('/api/language/sentiment', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async visionAI(imageUrl: string): Promise<APIResponse<VisionAIResult>> {
    return request<VisionAIResult>('/api/vision/detect-brands', {
      method: 'POST',
      body: JSON.stringify({ image_url: imageUrl }),
    });
  },
};

// ==================== ADMIN API ====================

export const adminAPI = {
  async getStats(): Promise<APIResponse<AdminStats>> {
    return request<AdminStats>('/api/admin/stats');
  },

  async getUsers(): Promise<APIResponse<AdminUsersResponse>> {
    return request<AdminUsersResponse>('/api/admin/users');
  },

  async createUser(
    email: string,
    password: string,
    quota: number = 15
  ): Promise<APIResponse<{ success: boolean; message: string }>> {
    return request('/api/admin/users/create', {
      method: 'POST',
      body: JSON.stringify({ email, password, quota }),
    });
  },

  async updateUser(
    userId: number,
    updates: { quota?: number; is_active?: boolean; password?: string }
  ): Promise<APIResponse<{ success: boolean; message: string }>> {
    return request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteUser(userId: number): Promise<APIResponse<{ success: boolean; message: string }>> {
    return request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getActivityLogs(limit: number = 50): Promise<APIResponse<ActivityLogsResponse>> {
    return request<ActivityLogsResponse>(`/api/admin/activity?limit=${limit}`);
  },
};

// ==================== ANALYTICS API ====================

export const analyticsAPI = {
  async getDashboard(): Promise<APIResponse<{ daily: any[] }>> {
    return request<{ daily: any[] }>('/api/analytics/dashboard');
  },
};

// ==================== HEALTH API ====================

export const healthAPI = {
  async check(): Promise<APIResponse<{
    status: string;
    database: string;
    cache_size: number;
    version: string;
  }>> {
    return request('/health');
  },

  async stats(): Promise<APIResponse<{
    cache_entries: number;
    uptime: string;
    version: string;
  }>> {
    return request('/api/stats');
  },
};

// Export default client
const api = {
  auth: authAPI,
  analysis: analysisAPI,
  analytics: analyticsAPI,
  admin: adminAPI,
  health: healthAPI,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
};

export default api;
