// TanStack Query keys factory

export const queryKeys = {
  // Auth 
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  
  // Collections 
  collections: {
    all: ['collections'] as const,
    lists: () => [...queryKeys.collections.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.collections.lists(), { filters }] as const,
    details: () => [...queryKeys.collections.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.collections.details(), id] as const,
    explore: (filters?: Record<string, unknown>) => 
      [...queryKeys.collections.all, 'explore', { filters }] as const,
  },
  
  // Contributions 
  contributions: {
    all: ['contributions'] as const,
    lists: () => [...queryKeys.contributions.all, 'list'] as const,
    list: (collectionId: string) => 
      [...queryKeys.contributions.lists(), collectionId] as const,
    stats: (collectionId: string) => 
      [...queryKeys.contributions.all, 'stats', collectionId] as const,
  },
  
  // Invitations 
  invitations: {
    all: ['invitations'] as const,
    lists: () => [...queryKeys.invitations.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.invitations.lists(), { filters }] as const,
  },

  // Members 
  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (collectionId: string) => 
      [...queryKeys.members.lists(), collectionId] as const,
  },

  // Withdrawals 
  withdrawals: {
    all: ['withdrawals'] as const,
    lists: () => [...queryKeys.withdrawals.all, 'list'] as const,
    list: (collectionId: string) => 
      [...queryKeys.withdrawals.lists(), collectionId] as const,
  },
} as const;

// Mutation keys 
export const mutationKeys = {
  auth: {
    login: ['auth', 'login'] as const,
    register: ['auth', 'register'] as const,
    logout: ['auth', 'logout'] as const,
  },
  collections: {
    create: ['collections', 'create'] as const,
    update: ['collections', 'update'] as const,
    delete: ['collections', 'delete'] as const,
  },
  contributions: {
    create: ['contributions', 'create'] as const,
  },
  invitations: {
    create: ['invitations', 'create'] as const,
    respond: ['invitations', 'respond'] as const,
  },
  members: {
    invite: ['members', 'invite'] as const,
    accept: ['members', 'accept'] as const,
    remove: ['members', 'remove'] as const,
  },
  withdrawals: {
    create: ['withdrawals', 'create'] as const,
  },
} as const;
