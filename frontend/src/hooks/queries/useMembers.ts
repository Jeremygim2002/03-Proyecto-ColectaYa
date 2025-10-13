import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '@/api/endpoints';
import { queryKeys } from '@/constants';
import type { InviteMemberData } from '@/types';


//  Hook para obtener todos los miembros de una colección
export function useMembers(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.members.list(collectionId),
    queryFn: () => membersApi.list(collectionId),
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

//  Hook para invitar a un miembro a una colección
export function useInviteMember(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['members', 'invite'],
    mutationFn: (data: InviteMemberData) => membersApi.invite(collectionId, data),
    onSuccess: () => {
      // Invalidate members list to refetch
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.members.list(collectionId) 
      });
    },
  });
}

// Hook para aceptar una invitación a unirse a una colección
export function useAcceptInvitation(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['members', 'accept'],
    mutationFn: () => membersApi.accept(collectionId),
    onSuccess: () => {
      // Invalidate members list and user's collections
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.members.list(collectionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
    },
  });
}

  // Hook para remover a un miembro de una colección
export function useRemoveMember(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['members', 'remove'],
    mutationFn: (userId: string) => membersApi.remove(collectionId, userId),
    onSuccess: () => {
      // Invalidate members list to refetch
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.members.list(collectionId) 
      });
    },
  });
}
