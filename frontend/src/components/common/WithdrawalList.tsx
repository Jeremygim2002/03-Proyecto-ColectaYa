import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, CheckCircle, XCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWithdrawals } from "@/hooks/queries/useWithdrawals";
import type { Withdrawal } from "@/api/endpoints/withdrawals";

interface WithdrawalListProps {
  collectionId: string;
}

const statusIcons = {
  REQUESTED: Clock,
  PAID: CheckCircle,
  REJECTED: XCircle,
} as const;

const statusLabels = {
  REQUESTED: 'Solicitado',
  PAID: 'Pagado',
  REJECTED: 'Rechazado',
} as const;

const statusColors = {
  REQUESTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PAID: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
} as const;

function WithdrawalCard({ withdrawal }: { withdrawal: Withdrawal }) {
  const StatusIcon = statusIcons[withdrawal.status];
  
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {withdrawal.requester.name || withdrawal.requester.email}
              </span>
            </div>
            <Badge className={statusColors[withdrawal.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusLabels[withdrawal.status]}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">
              S/ {withdrawal.amount.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(withdrawal.createdAt), { 
                addSuffix: true, 
                locale: es 
              })}
            </div>
          </div>

          {withdrawal.processedAt && (
            <div className="text-xs text-muted-foreground mt-1">
              Procesado {formatDistanceToNow(new Date(withdrawal.processedAt), { 
                addSuffix: true, 
                locale: es 
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function WithdrawalSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  );
}

export function WithdrawalList({ collectionId }: WithdrawalListProps) {
  const { data: withdrawals, isLoading, isError } = useWithdrawals(collectionId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <WithdrawalSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Error al cargar retiros</h3>
        <p className="text-sm text-muted-foreground">
          No pudimos cargar la información de retiros
        </p>
      </div>
    );
  }

  if (!withdrawals || withdrawals.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Sin retiros</h3>
        <p className="text-sm text-muted-foreground">
          Aún no se han solicitado retiros para esta colecta
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {withdrawals.map((withdrawal) => (
        <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
      ))}
    </div>
  );
}