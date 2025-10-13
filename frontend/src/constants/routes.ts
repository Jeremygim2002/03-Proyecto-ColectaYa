
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EXPLORE: '/explore',
  COLLECTION: '/collection/:id',
  PROFILE: '/profile',
  INVITATIONS: '/invitations',
  ONBOARDING: '/onboarding',
  NOT_FOUND: '/404',
} as const;

// Constructores de rutas con parámetros
export const buildCollectionRoute = (id: string): string => `/collection/${id}`;

export const buildProfileRoute = (userId?: string): string => 
  userId ? `/profile/${userId}` : '/profile';
