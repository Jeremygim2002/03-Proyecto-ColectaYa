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

// Hook para crear una contribución
export function useCreateContribution(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['contributions', 'create', collectionId],
    mutationFn: (data: CreateContributionData) => {
      // Solo enviar el amount al backend según el DTO
      return contributionsApi.create(collectionId, { amount: data.amount });
    },
    onSuccess: () => {
      // Invalidar queries para actualizar los datos
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.contributions.list(collectionId) 
      });
      
      // Actualizar la colección para reflejar el nuevo currentAmount
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.detail(collectionId) 
      });
      
      // Invalidar la lista de colecciones del usuario
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.lists() 
      });
    },
    onError: (error) => {
      console.error('Error creating contribution:', error);
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
