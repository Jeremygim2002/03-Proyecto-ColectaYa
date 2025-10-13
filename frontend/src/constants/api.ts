// API Base URL 
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth 
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Collections 
  COLLECTIONS: {
    LIST: '/collections',
    CREATE: '/collections',
    GET: (id: string) => `/collections/${id}`,
    UPDATE: (id: string) => `/collections/${id}`,
    DELETE: (id: string) => `/collections/${id}`,
    EXPLORE: '/collections/explore',
  },
  
  // Contributions 
  CONTRIBUTIONS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/contributions`,
    CREATE: '/contributions',
    GET: (id: string) => `/contributions/${id}`,
    STATS: (collectionId: string) => `/collections/${collectionId}/contributions/stats`,
  },
  
  // Invitations 
  INVITATIONS: {
    LIST: '/invitations',
    CREATE: '/invitations',
    RESPOND: (id: string) => `/invitations/${id}/respond`,
    DELETE: (id: string) => `/invitations/${id}`,
  },

  // Members 
  MEMBERS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/members`,
    INVITE: (collectionId: string) => `/collections/${collectionId}/members/invite`,
    ACCEPT: (collectionId: string) => `/collections/${collectionId}/members/accept`,
    REMOVE: (collectionId: string, userId: string) => `/collections/${collectionId}/members/${userId}`,
  },

  // Withdrawals 
  WITHDRAWALS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/withdrawals`,
    CREATE: (collectionId: string) => `/collections/${collectionId}/withdrawals`,
  },
} as const;
