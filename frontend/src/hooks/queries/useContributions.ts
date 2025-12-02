import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimistic, useTransition } from 'react';
import { contributionsApi } from '@/api';
import { queryKeys } from '@/constants';
import { APP_CONFIG } from '@/constants';
import type {
  Contribution,
  CreateContributionData,
} from '@/types';

export function useContributions(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.contributions.list(collectionId),
    queryFn: () => contributionsApi.list(collectionId),
    staleTime: APP_CONFIG.STALE_TIME.SHORT,
    enabled: !!collectionId,
  });
}

export function useCreateContribution(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['contributions', 'create', collectionId],
    mutationFn: (data: CreateContributionData) => {
      return contributionsApi.create(collectionId, { amount: data.amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contributions.list(collectionId) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.detail(collectionId) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
    },
  });
}

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
