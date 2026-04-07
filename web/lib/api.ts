/**
 * API Client Configuration
 * Base URL and standard fetch wrapper for LaundryLink backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptionsDecorator {
  decorate(options: RequestInit): RequestInit
}

class JsonContentTypeDecorator implements RequestOptionsDecorator {
  decorate(options: RequestInit): RequestInit {
    const headers = normalizeHeaders(options.headers)
    return {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  }
}

class AuthorizationHeaderDecorator implements RequestOptionsDecorator {
  constructor(private readonly token: string | null) {}

  decorate(options: RequestInit): RequestInit {
    if (!this.token) {
      return options
    }

    const headers = normalizeHeaders(options.headers)
    return {
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${this.token}`,
      },
    }
  }
}

function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) {
    return {}
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }

  return headers as Record<string, string>
}

function applyDecorators(options: RequestInit, decorators: RequestOptionsDecorator[]): RequestInit {
  return decorators.reduce((currentOptions, decorator) => decorator.decorate(currentOptions), options)
}

/**
 * Generic fetch wrapper with standard error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const decoratedOptions = applyDecorators(options, [
    new JsonContentTypeDecorator(),
    new AuthorizationHeaderDecorator(token),
  ])

  try {
    const response = await fetch(url, {
      ...decoratedOptions,
    });

    const data = (await response.json()) as ApiResponse<T> & {
      message?: string;
      error?: { code?: string; message?: string } | string | null;
    };

    const extractedMessage =
      (typeof data.error === 'object' && data.error?.message) ||
      (typeof data.error === 'string' ? data.error : undefined) ||
      data.message ||
      'Request failed';

    const extractedCode =
      (typeof data.error === 'object' && data.error?.code) ||
      'UNKNOWN_ERROR';

    if (!response.ok || !data.success) {
      throw new ApiError(
        `${extractedMessage} (${(options.method || 'GET').toUpperCase()} ${endpoint})`,
        extractedCode,
        response.status
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR',
      0
    );
  }
}

export default apiRequest;
