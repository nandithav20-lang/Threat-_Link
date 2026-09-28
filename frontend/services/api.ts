const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('threatlink_token');
  }

  const customHeaders = (options?.headers as Record<string, string>) || {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && !customHeaders['Authorization'] ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return errorData as T;
      } catch {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    throw new Error(error.message || 'Network error: Unable to connect to backend server.');
  }
}
