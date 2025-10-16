export interface Collection {
  id: string;
  title: string;
  description?: string;
  ownerId: string; 
  goalAmount: number;
  currentAmount: number;
  progress: number; 
  imageUrl?: string;
  deadlineAt?: string;
  isPrivate: boolean;
  ruleType: CollectionRuleType;
  ruleValue?: number;
  status: CollectionStatus;
  createdAt: string;
  updatedAt: string;
  contributorsCount?: number;
  averageContribution?: number;
}

export type CollectionRuleType = 
  | 'GOAL_ONLY'   // Solo retiro al 100% de meta  
  | 'THRESHOLD'   // Retiro al alcanzar % umbral
  | 'ANYTIME';    // Retiro en cualquier momento

export type CollectionStatus = 
  | 'ACTIVE' 
  | 'COMPLETED';

export interface CreateCollectionData {
  title: string;
  description?: string;
  goalAmount: number;
  deadlineAt?: string;
  isPrivate?: boolean;
  ruleType: CollectionRuleType;
  ruleValue?: number;
  imageUrl?: string;
}

export interface UpdateCollectionData {
  title?: string;
  description?: string;
  goalAmount?: number;
  deadlineAt?: string;
  status?: CollectionStatus;
}

export interface CollectionFilters {
  search?: string;
  status?: CollectionStatus;
  minGoal?: number;
  maxGoal?: number;
  sortBy?: 'recent' | 'goal' | 'progress' | 'deadline';
  sortOrder?: 'asc' | 'desc';
}

export interface CollectionListResponse {
  collections: Collection[];
  total: number;
  page: number;
  pageSize: number;
}
