import { Request } from 'express';

/**
 * Extract token from HTTP-only cookie
 * @param cookieName - Name of the cookie to extract
 */
export const fromCookie = (cookieName: string) => {
  return (request: Request): string | null => {
    const cookies = request?.cookies as Record<string, string> | undefined;
    return cookies?.[cookieName] ?? null;
  };
};

/**
 * Extract token from custom header
 * @param headerName - Name of the header (case-insensitive)
 */
export const fromCustomHeader = (headerName: string) => {
  return (request: Request): string | null => {
    const header = request?.headers?.[headerName.toLowerCase()];
    return typeof header === 'string' ? header : null;
  };
};

/**
 * Extract token from query parameter
 * @param paramName - Name of the query parameter
 */
export const fromQueryParam = (paramName: string) => {
  return (request: Request): string | null => {
    const param = request?.query?.[paramName];
    return typeof param === 'string' ? param : null;
  };
};
