import type { User, LoginCredentials, InsertUser } from "@shared/schema";
import { apiRequest } from "./queryClient";

export interface AuthResponse {
  user: Omit<User, 'password'>;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    return response.json();
  },

  register: async (userData: InsertUser): Promise<AuthResponse> => {
    const response = await apiRequest('POST', '/api/auth/register', userData);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest('POST', '/api/auth/logout');
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  },
};
