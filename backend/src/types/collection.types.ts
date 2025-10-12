import { CollectionStatus, RuleType } from '@prisma/client';
import { BasicUser } from './user.types';

export interface CollectionWithStats {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isPrivate: boolean;
  goalAmount: number;
  currency: 'PEN'; // 🏦 Siempre soles peruanos
  ruleType: RuleType;
  ruleValue?: number;
  status: CollectionStatus;
  deadlineAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Dueño de la colecta
  owner: BasicUser;

  // Estadísticas calculadas
  currentAmount: number;
  contributorsCount: number;
  progress: number; // Porcentaje de progreso
}

/**
 * Colección con detalles completos
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface CollectionWithDetails extends CollectionWithStats {
  // Miembros y contribuciones para vista detallada
  members: Array<{
    id: string;
    user: BasicUser;
    role: string;
    acceptedAt?: Date;
    joinedAt: Date;
  }>;

  contributions: Array<{
    id: string;
    amount: number;
    currency: 'PEN'; // 🏦 Siempre soles peruanos
    message?: string;
    user: BasicUser;
    createdAt: Date;
  }>;
}

/**
 * Respuesta de colectas públicas con paginación
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface PublicCollectionsResponse {
  collections: CollectionWithStats[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

/**
 * Filtros para colectas públicas
 * 🎯 DEBE coincidir exactamente con frontend
 */
export enum PublicCollectionFilter {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TODOS = 'TODOS',
}

/**
 * Colección básica para listas
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface BasicCollection {
  id: string;
  title: string;
  imageUrl?: string;
  goalAmount: number;
  currency: 'PEN'; // 🏦 Siempre soles peruanos
  currentAmount: number;
  progress: number;
  status: CollectionStatus;
  owner: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

/**
 * Estadísticas de una colección
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface CollectionStats {
  id: string;
  collectionId: string;
  currentAmount: number;
  contributorsCount: number;
  contributionsCount: number;
  lastContribution?: Date;
  lastUpdated: Date;
}

/**
 * Respuesta de creación/actualización de colección
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface CollectionResponse {
  collection: CollectionWithStats;
  message: string;
}

/**
 * Dashboard de colecciones del usuario
 * 🎯 DEBE coincidir exactamente con frontend
 */
export interface UserCollectionsDashboard {
  owned: CollectionWithStats[];
  participating: CollectionWithStats[];
  summary: {
    totalOwned: number;
    totalParticipating: number;
    totalRaised: number;
    totalContributed: number;
  };
}
