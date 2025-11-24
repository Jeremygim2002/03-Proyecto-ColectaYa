/**
 * Empty state component for consistent empty UI across the app
 */

import { motion } from "framer-motion";
import React from "react";

interface EmptyStateProps {
  /** Icon to display (Lucide icon component or any ReactNode) */
  icon: React.ReactNode;
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button or content */
  action?: React.ReactNode;
  /** Optional custom className for the container */
  className?: string;
}

/**
 * Reusable empty state component with animation
 * @example
 * <EmptyState
 *   icon={<Filter className="h-12 w-12" />}
 *   title="No se encontraron colectas"
 *   description="Intenta con otros términos de búsqueda"
 * />
 */
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 md:p-12 text-center ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 text-muted-foreground/50">
        {icon}
      </div>
      <h3 className="mb-2 text-lg md:text-xl font-semibold">{title}</h3>
      {description && (
        <p className="text-xs md:text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

/**
 * Error state variant with destructive styling
 */
export function ErrorState({
  icon,
  title,
  description,
  action,
}: Omit<EmptyStateProps, 'className'>) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
      className="border-destructive/50 bg-destructive/5"
    />
  );
}
