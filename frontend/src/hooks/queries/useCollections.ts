import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi } from '@/api';
import { queryKeys } from '@/constants';
import { APP_CONFIG } from '@/constants';
import type {
  Collection,
  CollectionFilters,
  CreateCollectionData,
  UpdateCollectionData,
} from '@/types';


//  Hook para obtener las colectas del usuario con filtros
//  Uses TanStack Query para almacenamiento en caché y recuperación
export function useCollections(filters?: CollectionFilters) {
  return useQuery({
    queryKey: queryKeys.collections.list(filters as Record<string, unknown>),
    queryFn: () => collectionsApi.list(filters),
    staleTime: APP_CONFIG.STALE_TIME.MEDIUM,
    refetchOnWindowFocus: true,
  });
}


//  Hook para obtener las colectas públicas para la página de exploración
export function useExploreCollections(filters?: CollectionFilters) {
  return useQuery({
    queryKey: queryKeys.collections.explore(filters as Record<string, unknown>),
    queryFn: () => collectionsApi.public(filters),
    staleTime: APP_CONFIG.STALE_TIME.SHORT,
  });
}


// Hook para obtener una colección individual por ID
// Si requireAuth es false, la petición no incluirá el token de autenticación
export function useCollection(id: string, options?: { requireAuth?: boolean }) {
  const requireAuth = options?.requireAuth !== false; // Por defecto requiere auth
  
  return useQuery({
    queryKey: queryKeys.collections.detail(id),
    queryFn: () => collectionsApi.get(id, { requiresAuth: requireAuth }),
    staleTime: APP_CONFIG.STALE_TIME.MEDIUM,
    enabled: !!id,
  });
}

// Hook para obtener preview de colecta (para compartir link)
// Permite ver colectas privadas vía link de compartir
export function useCollectionPreview(id: string) {
  return useQuery({
    queryKey: ['collections', 'preview', id],
    queryFn: () => collectionsApi.getPreview(id),
    staleTime: APP_CONFIG.STALE_TIME.MEDIUM,
    enabled: !!id,
  });
}


//  Hook para crear una nueva colecta
//  Invalida automáticamente la lista de colectas
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['collections', 'create'],
    mutationFn: (data: CreateCollectionData) => collectionsApi.create(data),
    onSuccess: (newCollection) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
      
      queryClient.setQueryData<Collection>(
        queryKeys.collections.detail(newCollection.id),
        newCollection
      );
    },
  });
}


//  Hook par aa actualizar una colecta
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['collections', 'update'],
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionData }) =>
      collectionsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.collections.detail(id) 
      });

      const previousCollection = queryClient.getQueryData<Collection>(
        queryKeys.collections.detail(id)
      );

      if (previousCollection) {
        queryClient.setQueryData<Collection>(
          queryKeys.collections.detail(id),
          { ...previousCollection, ...data }
        );
      }

      return { previousCollection };
    },
    onError: (_error, { id }, context) => {
      if (context?.previousCollection) {
        queryClient.setQueryData(
          queryKeys.collections.detail(id),
          context.previousCollection
        );
      }
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.detail(id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
    },
  });
}


//  Hook to delete a collection
//  Remover de la cache y actualizar la lista
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['collections', 'delete'],
    mutationFn: (id: string) => collectionsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ 
        queryKey: queryKeys.collections.detail(id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
    },
  });
}

// Hook to join a collection
export function useJoinCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['collections', 'join'],
    mutationFn: (id: string) => collectionsApi.join(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.detail(id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.members.list(id) 
      });
    },
  });
}

// Hook to join a collection via shared link (allows private collections)
export function useJoinCollectionViaLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['collections', 'join-via-link'],
    mutationFn: (id: string) => collectionsApi.joinViaLink(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.detail(id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['collections', 'preview', id]
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.members.list(id) 
      });
    },
  });
}

// Hook to leave a collection  
export function useLeaveCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['collections', 'leave'],
    mutationFn: (id: string) => collectionsApi.leave(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.detail(id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.members.list(id) 
      });
    },
  });
}
