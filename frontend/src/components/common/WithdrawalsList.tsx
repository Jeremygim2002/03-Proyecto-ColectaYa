import React from 'react';
import { useWithdrawals } from '@/hooks/queries/useWithdrawals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Calendar, User } from 'lucide-react';
import type { Withdrawal } from '@/api/endpoints/withdrawals';
import { WITHDRAWAL_STATUS_CONFIG } from '@/constants/status';
import { formatAbsoluteDate } from '@/utils/date';
import { ListSkeleton } from './skeletons';
import { EmptyState, ErrorState } from './EmptyState';

interface WithdrawalsListProps {
  collectionId: string;
}

export const WithdrawalsList: React.FC<WithdrawalsListProps> = ({ collectionId }) => {
  const { data: withdrawals, isLoading, error } = useWithdrawals(collectionId);

  if (isLoading) {
    return <ListSkeleton count={3} />;
  }

  if (error) {
    return (
      <ErrorState
        icon={<Wallet className="h-12 w-12" />}
        title="Error al cargar los retiros"
        description="Intenta recargar la página"
      />
    );
  }

  if (!withdrawals?.length) {
    return (
      <EmptyState
        icon={<Wallet className="h-12 w-12" />}
        title="No hay retiros realizados"
        description="Los retiros aparecerán aquí cuando sean solicitados"
      />
    );
  }

  return (
    <div className="space-y-4">
      {withdrawals.map((withdrawal: Withdrawal) => (
        <Card key={withdrawal.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                ${withdrawal.amount.toLocaleString()}
              </CardTitle>
              <Badge variant={WITHDRAWAL_STATUS_CONFIG[withdrawal.status].variant}>
                {WITHDRAWAL_STATUS_CONFIG[withdrawal.status].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  Solicitado por: {withdrawal.requester.name || withdrawal.requester.email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatAbsoluteDate(withdrawal.createdAt)}</span>
              </div>
              {withdrawal.processedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Procesado: {formatAbsoluteDate(withdrawal.processedAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};