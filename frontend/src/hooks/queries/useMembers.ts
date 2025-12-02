import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '@/api/endpoints';
import { queryKeys } from '@/constants';

export function useMembers(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.members.list(collectionId),
    queryFn: () => membersApi.list(collectionId),
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRemoveMember(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['members', 'remove'],
    mutationFn: (userId: string) => membersApi.remove(collectionId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.members.list(collectionId) 
      });
    },
  });
}

export function useLeaveMember(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['members', 'leave'],
    mutationFn: () => membersApi.leave(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.members.list(collectionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
    },
  });
}
