/**
 * Date formatting utility functions
 */

/**
 * Format date as relative time (e.g., "Hace 5 min", "Hace 2h", "Hace 3d")
 * @example formatRelativeDate("2024-01-15T10:00:00Z") => "Hace 5 min"
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

/**
 * Format date as absolute date with time (e.g., "15 de enero de 2024, 10:30")
 * @example formatAbsoluteDate("2024-01-15T10:30:00Z") => "15 de enero de 2024, 10:30"
 */
export function formatAbsoluteDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get days remaining until deadline
 * @example getDaysRemaining("2024-12-31") => "5 días"
 * @example getDaysRemaining("2024-11-17") => "Hoy"
 * @returns String representation or null if no deadline
 */
export function getDaysRemaining(deadline?: string): string | null {
  if (!deadline) return null;
  
  const now = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diff < 0) return "Vencido";
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  return `${diff} días`;
}

/**
 * Format date for display in forms (YYYY-MM-DD)
 * @example formatDateForInput(new Date()) => "2024-11-17"
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
