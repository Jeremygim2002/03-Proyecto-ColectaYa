import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimistic, useTransition } from 'react';
import { contributionsApi } from '@/api';
import { queryKeys } from '@/constants';
import { APP_CONFIG } from '@/constants';
import type {
  Contribution,
  CreateContributionData,
} from '@/types';


//  Hook para obtener contribuciones para una colección
export function useContributions(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.contributions.list(collectionId),
    queryFn: () => contributionsApi.list(collectionId),
    staleTime: APP_CONFIG.STALE_TIME.SHORT,
    enabled: !!collectionId,
  });
}

//  Hook para obtener estadísticas de contribuciones para una colección
export function useContributionStats(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.contributions.stats(collectionId),
    queryFn: () => contributionsApi.stats(collectionId),
    staleTime: APP_CONFIG.STALE_TIME.SHORT,
    enabled: !!collectionId,
  });
}


  // Hook para crear una contribución con actualizaciones optimistas
export function useCreateContribution(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['contributions', 'create'],
    mutationFn: (data: CreateContributionData) => contributionsApi.create(collectionId, data),
    onMutate: async (newContribution) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.contributions.list(collectionId) 
      });

      const previousContributions = queryClient.getQueryData<Contribution[]>(
        queryKeys.contributions.list(collectionId)
      );

      if (previousContributions) {
        const optimisticContribution: Contribution = {
          id: `temp-${Date.now()}`,
          collectionId: newContribution.collectionId,
          userId: 'current-user',
          userName: 'You',
          amount: newContribution.amount,
          message: newContribution.message,
          isAnonymous: newContribution.isAnonymous,
          createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Contribution[]>(
          queryKeys.contributions.list(collectionId),
          [...previousContributions, optimisticContribution]
        );
      }

      return { previousContributions };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousContributions) {
        queryClient.setQueryData(
          queryKeys.contributions.list(collectionId),
          context.previousContributions
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contributions.list(collectionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contributions.stats(collectionId) 
      });
      // Also invalidate collection to update currentAmount
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.detail(collectionId) 
      });
    },
  });
}


// Hook para la lista de contribuciones optimistas
export function useOptimisticContributions(collectionId: string) {
  const { data: contributions = [] } = useContributions(collectionId);
  const [isPending, startTransition] = useTransition();
  
  const [optimisticContributions, addOptimisticContribution] = useOptimistic(
    contributions,
    (state, newContribution: Contribution) => [...state, newContribution]
  );

  const addContribution = (contribution: Contribution) => {
    startTransition(() => {
      addOptimisticContribution(contribution);
    });
  };

  return {
    contributions: optimisticContributions,
    addContribution,
    isPending,
  };
}
