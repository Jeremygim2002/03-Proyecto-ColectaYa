/**
 * String utility functions
 */

/**
 * Get initials from a name
 * @example getInitials("Juan Pérez") => "JP"
 * @example getInitials("María") => "MA"
 * @example getInitials(null) => "??"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') {
    return "??";
  }
  
  const trimmedName = name.trim();
  if (!trimmedName) {
    return "??";
  }
  
  const parts = trimmedName.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return trimmedName.slice(0, 2).toUpperCase();
}

/**
 * Truncate a string to a maximum length
 * @example truncate("Hello World", 5) => "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Capitalize first letter of a string
 * @example capitalize("hello") => "Hello"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
