// Use relative URL to backend server so it works in any environment
const API_URL = '';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepare request with userEmail for dev token authentication
  let body = options.body;
  let url = `${API_URL}${endpoint}`;
  
  if (userEmail && token && token.startsWith('dev-token-')) {
    // For dev tokens, send userEmail in the request
    if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      // For mutating requests, add userEmail to the request body
      const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
      parsedBody.userEmail = userEmail;
      body = JSON.stringify(parsedBody);
    } else if (!options.method || ['GET', 'DELETE'].includes(options.method)) {
      // For GET/DELETE requests, add userEmail as a query parameter
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}userEmail=${encodeURIComponent(userEmail)}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
