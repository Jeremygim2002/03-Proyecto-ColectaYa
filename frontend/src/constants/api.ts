// API Base URL 
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth 
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/users/me', // ✅ CORREGIDO: Era /auth/me
  },
  
  // Collections 
  COLLECTIONS: {
    LIST: '/collections',
    CREATE: '/collections',
    GET: (id: string) => `/collections/${id}`,
    UPDATE: (id: string) => `/collections/${id}`,
    DELETE: (id: string) => `/collections/${id}`,
    PUBLIC: '/collections/public', // ✅ CORREGIDO: Era /collections/explore
    // ✅ NUEVOS endpoints de members en collections
    JOIN: (id: string) => `/collections/${id}/members/join`,
    LEAVE: (id: string) => `/collections/${id}/members/leave`,
  },
  
  // Contributions 
  CONTRIBUTIONS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/contributions`,
    CREATE: (collectionId: string) => `/collections/${collectionId}/contributions`, // ✅ CORREGIDO
    MY_CONTRIBUTIONS: '/contributions', // ✅ NUEVO: Mis contribuciones globales
    // ✅ ELIMINADO: GET /contributions/{id} no existe en backend
    // ✅ ELIMINADO: STATS no existe en backend
  },
  
  // Invitations 
  INVITATIONS: {
    LIST: '/invitations',
    CREATE: '/invitations',
    ACCEPT: (id: string) => `/invitations/${id}/accept`, // ✅ CORREGIDO: Era respond
    REJECT: (id: string) => `/invitations/${id}/reject`, // ✅ CORREGIDO: Era respond
    // ✅ ELIMINADO: DELETE no existe más en backend
  },

  // Members 
  MEMBERS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/members`,
    // ✅ ELIMINADO: INVITE ya no existe, ahora se usa INVITATIONS.CREATE
    // ✅ ELIMINADO: ACCEPT ya no existe, ahora es COLLECTIONS.JOIN
    REMOVE: (collectionId: string, userId: string) => `/collections/${collectionId}/members/${userId}`,
  },

  // Withdrawals 
  WITHDRAWALS: {
    LIST: (collectionId: string) => `/collections/${collectionId}/withdrawals`,
    INTELLIGENT_WITHDRAW: (collectionId: string) => `/collections/${collectionId}/withdrawals`, // ✅ CORREGIDO: Sin body
  },
} as const;
