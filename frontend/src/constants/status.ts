/**
 * Status configuration constants for collections and withdrawals
 */

import type { CollectionStatus } from '@/types';

/**
 * Collection status configuration for UI display
 */
export const COLLECTION_STATUS_CONFIG = {
  ACTIVE: {
    label: "En curso",
    variant: "default" as const,
    className: "bg-success text-success-foreground",
  },
  COMPLETED: {
    label: "Completado",
    variant: "secondary" as const,
    className: "bg-primary text-primary-foreground",
  },
} as const;

/**
 * Map API collection status to CollectCard status format
 */
export function mapCollectionStatus(
  status: CollectionStatus
): "active" | "completed" | "closed" {
  if (status === "COMPLETED") return "completed";
  return "active"; // ACTIVE or other statuses default to active
}

/**
 * Withdrawal status configuration for UI display
 */
export const WITHDRAWAL_STATUS_CONFIG = {
  REQUESTED: {
    label: 'Solicitado',
    variant: 'default' as const,
  },
  PAID: {
    label: 'Pagado',
    variant: 'default' as const,
  },
  REJECTED: {
    label: 'Rechazado',
    variant: 'destructive' as const,
  },
} as const;

export type WithdrawalStatus = keyof typeof WITHDRAWAL_STATUS_CONFIG;
