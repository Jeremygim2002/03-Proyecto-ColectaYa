import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawalsApi } from '@/api/endpoints';
import { queryKeys } from '@/constants';


//  Hook para obtener todos los retiros de una colecta
export function useWithdrawals(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.withdrawals.list(collectionId),
    queryFn: () => withdrawalsApi.list(collectionId),
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 5, 
  });
}


//  Hook para solicitar un retiro total de una colecta
export function useCreateWithdrawal(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['withdrawals', 'create'],
    mutationFn: () => withdrawalsApi.create(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.withdrawals.list(collectionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.collections.detail(collectionId) 
      });
    },
  });
}
