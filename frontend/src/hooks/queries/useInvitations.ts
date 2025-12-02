import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsApi } from '@/api';
import { queryKeys } from '@/constants';
import { APP_CONFIG } from '@/constants';
import type {
  Invitation,
  CreateInvitationData,
} from '@/types';

export function useInvitations() {
  return useQuery({
    queryKey: queryKeys.invitations.list(),
    queryFn: () => invitationsApi.list(),
    staleTime: APP_CONFIG.STALE_TIME.SHORT,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['invitations', 'create'],
    mutationFn: (data: CreateInvitationData) => invitationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.invitations.lists() 
      });
    },
  });
}

export function useRespondInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['invitations', 'respond'],
    mutationFn: ({ id, accepted }: { id: string; accepted: boolean }) =>
      invitationsApi.respond(id, accepted),
    onMutate: async ({ id }) => {

      await queryClient.cancelQueries({ 
        queryKey: queryKeys.invitations.list() 
      });


      const previousInvitations = queryClient.getQueryData<Invitation[]>(
        queryKeys.invitations.list()
      );

      if (previousInvitations) {
        queryClient.setQueryData<Invitation[]>(
          queryKeys.invitations.list(),
          previousInvitations.filter((inv) => inv.id !== id)
        );
      }

      return { previousInvitations };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousInvitations) {
        queryClient.setQueryData(
          queryKeys.invitations.list(),
          context.previousInvitations
        );
      }
    },
    onSuccess: (_data, { accepted }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.invitations.lists() 
      });
      
      if (accepted) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.collections.lists() 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.members.lists() 
        });
      }
    },
  });
}
