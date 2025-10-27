// Base URL 
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth 
  AUTH: {
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me', 
    MAGIC_LINK: '/auth/magic-link',
    GOOGLE: '/auth/google', 
    FACEBOOK: '/auth/facebook', 
    CALLBACK: '/auth/callback', 
  },
  
  // Collections 
  COLLECTIONS: {
    LIST: '/collections',
    CREATE: '/collections',
    GET: (id: string) => `/collections/${id}`,
    UPDATE: (id: string) => `/collections/${id}`,
    DELETE: (id: string) => `/collections/${id}`,
    PUBLIC: '/collections/public',
    JOIN: (id: string) => `/collections/${id}/members/join`,
    LEAVE: (id: string) => `/collections/${id}/members/leave`,
  },
  
  // Contributions 
  CONTRIBUTIONS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/contributions`,
    CREATE: (collectionId: string) => `/collections/${collectionId}/contributions`,
    MY_CONTRIBUTIONS: '/contributions',
  },
  
  // Invitations 
  INVITATIONS: {
    LIST: '/invitations',
    CREATE: '/invitations',
    ACCEPT: (id: string) => `/invitations/${id}/accept`, 
    REJECT: (id: string) => `/invitations/${id}/reject`,
  },

  // Members 
  MEMBERS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/members`,
    REMOVE: (collectionId: string, userId: string) => `/collections/${collectionId}/members/${userId}`,
  },

  // Withdrawals 
  WITHDRAWALS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/withdrawals`,
    CREATE: (collectionId: string) => `/collections/${collectionId}/withdrawals`,
  },
} as const;
