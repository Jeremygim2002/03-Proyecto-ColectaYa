import React from 'react';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, Calendar, User } from 'lucide-react';
import type { Withdrawal } from '@/api/endpoints/withdrawals';

interface WithdrawalsListProps {
  collectionId: string;
}

const statusLabels = {
  REQUESTED: 'Solicitado',
  PAID: 'Pagado',
  REJECTED: 'Rechazado',
};

const statusVariants = {
  REQUESTED: 'default' as const,
  PAID: 'default' as const,
  REJECTED: 'destructive' as const,
};

export const WithdrawalsList: React.FC<WithdrawalsListProps> = ({ collectionId }) => {
  const { data: withdrawals, isLoading, error } = useWithdrawals(collectionId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Error al cargar los retiros
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!withdrawals?.length) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay retiros realizados</p>
          </div>
        </CardContent>
      </Card>
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
              <Badge variant={statusVariants[withdrawal.status]}>
                {statusLabels[withdrawal.status]}
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
                <span>
                  {new Date(withdrawal.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {withdrawal.processedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Procesado: {new Date(withdrawal.processedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};