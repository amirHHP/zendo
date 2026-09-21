/**
 * Centralized API URL helper supporting Next.js basePath
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}
