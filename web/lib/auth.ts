/**
 * Authentication Service
 * Handles user registration, login, and token management
 */

import apiRequest from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AuthRole;
}

export type AuthRole = 'CUSTOMER' | 'SHOP_OWNER' | 'ADMIN';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'SHOP_OWNER';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginData {
  idToken: string;
}

export function getDashboardPath(role: AuthRole | string | null | undefined): string {
  switch (role) {
    case 'SHOP_OWNER':
      return '/shop-owner/dashboard';
    case 'ADMIN':
      return '/admin';
    case 'CUSTOMER':
    default:
      return '/customer/dashboard';
  }
}

function storeAuthSession(response: AuthResponse): void {
  if (response.accessToken) {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  storeAuthSession(response);

  return response;
}

/**
 * Login an existing user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  storeAuthSession(response);

  return response;
}

/**
 * Login with Google ID token
 */
export async function loginWithGoogle(data: GoogleLoginData): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  storeAuthSession(response);

  return response;
}

/**
 * Logout current user
 */
export function logout(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken');
}
