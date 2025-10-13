// Application configuration
export const APP_CONFIG = {
  // App metadata
  APP_NAME: 'ColectaYa',
  APP_DESCRIPTION: 'Plataforma colaborativa para colectas de dinero',
  
  // Paginacion
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  
  // Limites de subida
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Validacion
  MIN_GOAL_AMOUNT: 10,
  MAX_GOAL_AMOUNT: 1000000,
  MIN_CONTRIBUTION_AMOUNT: 1,
  
  // Cache duracion 
  CACHE_TIME: {
    SHORT: 1 * 60 * 1000,      
    MEDIUM: 5 * 60 * 1000,     
    LONG: 15 * 60 * 1000,      
    VERY_LONG: 60 * 60 * 1000, 
  },

  // TanStack query stale time
  STALE_TIME: {
    IMMEDIATE: 0,
    SHORT: 30 * 1000,         
    MEDIUM: 2 * 60 * 1000,    
    LONG: 5 * 60 * 1000,      
  },
  
  // Auth
  TOKEN_KEY: 'colectaya_token',
  REFRESH_TOKEN_KEY: 'colectaya_refresh_token',
  USER_KEY: 'colectaya_user',
  
  // Retrasos en la eliminación de rebotes
  SEARCH_DEBOUNCE: 300,
  INPUT_DEBOUNCE: 500,
} as const;


// Metodos de pago
export const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'debit_card', label: 'Tarjeta de Débito' },
  { value: 'paypal', label: 'PayPal' },
] as const;
