import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { withdrawalsApi } from '@/api/endpoints/withdrawals';
import { queryKeys } from '@/constants';
import { toast } from 'sonner';

export const useWithdrawals = (collectionId: string) => {
  return useQuery({
    queryKey: queryKeys.withdrawals.list(collectionId),
    queryFn: () => withdrawalsApi.list(collectionId),
  });
};

export const useCreateWithdrawal = (collectionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => withdrawalsApi.create(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.withdrawals.list(collectionId)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.detail(collectionId)
      });
      toast.success('Retiro solicitado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Error al solicitar el retiro');
    }
  });
};