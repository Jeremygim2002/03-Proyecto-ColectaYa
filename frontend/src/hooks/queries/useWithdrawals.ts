import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawalsApi } from '@/api/endpoints';
import { queryKeys } from '@/constants';
import type { CreateWithdrawalData } from '@/types';


//  Hook para obtener todos los retiros de una colecta
export function useWithdrawals(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.withdrawals.list(collectionId),
    queryFn: () => withdrawalsApi.list(collectionId),
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 5, 
  });
}


//  Hook para solicitar un retiro de una colecta
export function useCreateWithdrawal(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['withdrawals', 'create'],
    mutationFn: (data: CreateWithdrawalData) => withdrawalsApi.create(collectionId, data),
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
