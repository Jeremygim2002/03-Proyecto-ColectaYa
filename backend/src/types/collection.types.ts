import { CollectionStatus, RuleType } from '@prisma/client';
import { BasicUser } from './user.types';

export interface CollectionWithStats {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isPrivate: boolean;
  goalAmount: number;
  currency: 'PEN';
  ruleType: RuleType;
  ruleValue?: number;
  status: CollectionStatus;
  deadlineAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  owner: BasicUser;

  // Estadísticas calculadas
  currentAmount: number;
  contributorsCount: number;
  progress: number; // Porcentaje de progreso
}

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
    currency: 'PEN';
    message?: string;
    user: BasicUser;
    createdAt: Date;
  }>;
}

// Respuesta de colectas públicas con paginación
export interface PublicCollectionsResponse {
  collections: CollectionWithStats[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

//  Filtros para colectas públicas
export enum PublicCollectionFilter {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TODOS = 'TODOS',
}

// Colección básica para listas
export interface BasicCollection {
  id: string;
  title: string;
  imageUrl?: string;
  goalAmount: number;
  currency: 'PEN';
  currentAmount: number;
  progress: number;
  status: CollectionStatus;
  owner: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

// Estadísticas de una colección
export interface CollectionStats {
  id: string;
  collectionId: string;
  currentAmount: number;
  contributorsCount: number;
  contributionsCount: number;
  lastContribution?: Date;
  lastUpdated: Date;
}

// Respuesta de creación/actualización de colección
export interface CollectionResponse {
  collection: CollectionWithStats;
  message: string;
}

//  Dashboard de colecciones del usuario
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
