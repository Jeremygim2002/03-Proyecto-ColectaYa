// ======================================================
// TYPES COMUNES - BACKEND
// ======================================================

/**
 * Respuesta estándar con paginación
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Metadatos de paginación
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
}

/**
 * Respuesta estándar de API
 * 📝 Solo para backend - estructura interna
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

/**
 * Respuesta de error estándar
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Filtros base para búsquedas
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Respuesta de operación exitosa
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface SuccessResponse {
  success: true;
  message: string;
}
