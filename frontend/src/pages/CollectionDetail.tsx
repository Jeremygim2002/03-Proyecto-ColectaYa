"use client";

import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, MoreVertical, DollarSign, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import CreateCollectionModal from "@/components/common/CreateCollectionModal";
import { ContributeModal } from "@/components/common/ContributeModal";
import { ShareModal } from "@/components/common/ShareModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { WithdrawalsList } from "@/components/common/WithdrawalsList";
import { useCollection, useLeaveCollection } from "@/hooks/queries/useCollections";
import { useContributions } from "@/hooks/queries/useContributions";
import { useMembers } from "@/hooks/queries/useMembers";
import { useCreateWithdrawal } from "@/hooks/queries/useWithdrawals";
import { useAuthStore } from "@/stores/authStore";
import { getCollectionMetadata } from "@/lib/utils";
import { getInitials } from "@/utils/string";
import { formatRelativeDate } from "@/utils/date";
import { ListSkeleton } from "@/components/common/skeletons";
import { EmptyState } from "@/components/common/EmptyState";

export default function CollectionDetail() {
  const { id: collectionId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  // Fetch collection data
  const {
    data: collection, 
    isLoading: isLoadingCollection, 
    error: collectionError 
  } = useCollection(collectionId || "");

  // Fetch members for this collection
  const {
    data: members = [],
    isLoading: isLoadingMembers,
  } = useMembers(collectionId || "");

  // Leave collection mutation
  const leaveMutation = useLeaveCollection();

  // Withdrawal mutation
  const withdrawMutation = useCreateWithdrawal(collectionId || "");
  
  // DEBUG: Verificar los datos de la colección
  console.log('Collection data:', collection);
  console.log('Current amount:', collection?.currentAmount);
  console.log('Goal amount:', collection?.goalAmount);
  console.log('Contributors count:', collection?.contributorsCount);
  
  // Fetch contributions for this collection
  const {
    data: contributionsData,
    isLoading: isLoadingContributions,
  } = useContributions(collectionId || "");  const [activeTab, setActiveTab] = useState("contributions");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  // Error state
  if (collectionError && !isLoadingCollection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-destructive">Error al cargar la colecta</p>
          <p className="text-muted-foreground">
            {collectionError?.message || "No se encontró la colecta"}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Volver a mis colectas
          </Button>
        </div>
      </div>
    );
  }

  // Extract data when available
  const contributions = contributionsData || [];
  
  // DEBUG: Verificar los datos de contribuciones
  console.log('Contributions data:', contributionsData);
  console.log('Contributions array:', contributions);
  
  // DEBUG: Verificar datos específicos de cada contribución
  contributions.forEach((contribution, index) => {
    console.log(`Contribution ${index}:`, {
      userName: contribution.userName,
      userAvatar: contribution.userAvatar,
      userId: contribution.userId,
    });
  });

  // Calculate values only when collection is available
  const percentage = collection ? Math.min(100, Math.round((collection.currentAmount / collection.goalAmount) * 100)) : 0;
  const isOwner = collection ? collection.ownerId === user?.id : false;
  
  // Check if current user is a member (but not owner)
  const isMember = members && 'members' in members && user ? 
    members.members.some(member => member.userId === user.id && member.acceptedAt) : false;
  const canLeave = isMember && !isOwner;

  // Owner info from collection data (usar misma lógica que en pestaña de miembros)
  const ownerName = collection?.owner?.name || "Usuario sin nombre";
  const ownerAvatar = collection?.owner?.avatar || "";
  
  // Calcular memberCount desde la lista real de miembros aceptados
  const memberCount = members && 'members' in members 
    ? members.members.filter(m => m.acceptedAt).length 
    : collection?.contributorsCount || 0;

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleLeaveCollection = async () => {
    if (!collection) return;
    
    try {
      await leaveMutation.mutateAsync(collection.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error leaving collection:', error);
    }
  };

  const handleLeaveClick = () => {
    setIsLeaveDialogOpen(true);
  };

  const handleWithdrawFunds = async () => {
    if (!collection) return;
    
    try {
      await withdrawMutation.mutateAsync();
      toast.success('Retiro solicitado exitosamente');
      setIsWithdrawDialogOpen(false);
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al solicitar retiro';
      toast.error(errorMessage);
    }
  };

  const handleWithdrawClick = () => {
    setIsWithdrawDialogOpen(true);
  };

  return (
    <>
      {collection && getCollectionMetadata(collection)}

      <div className="container mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-8">
          {/* Loading Skeleton */}
          {isLoadingCollection ? (
            <div className="space-y-6">
              {/* Breadcrumbs skeleton */}
              <Skeleton className="h-5 w-48" />
              
              {/* Header Card skeleton */}
              <Card className="p-4 md:p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>

              {/* Progress Card skeleton */}
              <Card className="p-4 md:p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-2 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </Card>

              {/* Tabs skeleton */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              </div>
            </div>
          ) : collection ? (
            <>
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center text-xs md:text-sm text-muted-foreground">
            <Link to="/dashboard" className="flex items-center hover:text-foreground transition-smooth">
              <ChevronLeft className="h-4 w-4" />
              <span>Mis colectas</span>
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{collection.title}</span>
          </nav>

          {/* Header Card */}
          <Card className="mb-6 p-4 md:p-6 animate-fade-in">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              {/* Left: Info */}
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Badge className="bg-success text-success-foreground text-xs">En curso</Badge>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={ownerAvatar} alt={ownerName} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(ownerName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{ownerName}</span>
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    • Creada el {new Date(collection.createdAt).toLocaleDateString("es-PE")}
                  </span>
                </div>
                <h1 className="mb-3 text-2xl lg:text-3xl font-bold">{collection.title}</h1>
                <p className="text-sm md:text-base text-muted-foreground">{collection.description}</p>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleShare} aria-label="Compartir">
                  <Share2 className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Más opciones">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => toast.info("Función en desarrollo: Ver estadísticas detalladas de la colecta")}>
                      📊 Ver estadísticas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Función en desarrollo: Descargar reporte en PDF")}>
                      📥 Descargar reporte
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-6 space-y-3 rounded-lg bg-muted/30 p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-foreground">
                    S/ {Math.min(collection.currentAmount, collection.goalAmount).toLocaleString("es-PE")}
                  </span>
                  <span className="text-muted-foreground"> / S/ {collection.goalAmount.toLocaleString("es-PE")}</span>
                </div>
                <span className="text-xl font-semibold text-primary">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" aria-label={`Progreso: ${percentage}%`} />
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button 
                variant="accent" 
                size="lg" 
                className="flex-1 sm:flex-initial text-base py-3 sm:py-3 sm:text-sm"
                onClick={() => setIsContributeModalOpen(true)}
              >
                Aportar ahora
              </Button>
              
              {canLeave && (
                <Button 
                  variant="destructive" 
                  size="lg" 
                  className="flex-1 sm:flex-initial text-base py-3 sm:py-3 sm:text-sm"
                  onClick={handleLeaveClick}
                  disabled={leaveMutation.isPending}
                >
                  {leaveMutation.isPending ? "Saliendo..." : "Dejar colecta"}
                </Button>
              )}
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contributions">Aportes</TabsTrigger>
              <TabsTrigger value="members">Miembros</TabsTrigger>
              <TabsTrigger value="withdrawals">Retiros</TabsTrigger>
            </TabsList>

            {/* Contributions Tab */}
            <TabsContent value="contributions" className="mt-6 space-y-4">
              {isLoadingContributions ? (
                <ListSkeleton count={4} />
              ) : contributions.length > 0 ? (
                contributions.map((contribution) => (
                  <Card key={contribution.id} className="p-4 hover-lift transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={contribution.userAvatar} alt={contribution.userName} />
                          <AvatarFallback>{getInitials(contribution.userName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{contribution.userName || "Usuario Anónimo"}</p>
                          <p className="text-sm text-muted-foreground">{formatRelativeDate(contribution.createdAt)}</p>
                          {contribution.message && (
                            <p className="text-sm text-muted-foreground mt-1">{contribution.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">
                          +S/ {contribution.amount.toLocaleString("es-PE")}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={<DollarSign className="h-12 w-12" />}
                  title="No hay aportes registrados"
                  description="Sé el primero en contribuir a esta colecta"
                />
              )}
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-6 space-y-4">
              {isLoadingMembers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (!members || 'members' in members && members.members.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay miembros en esta colecta
                </div>
              ) : (
                ('members' in members ? members.members : []).map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(member.user?.name || member.user?.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{member.user?.name || "Usuario sin nombre"}</p>
                            {collection?.ownerId === member.userId && (
                              <Badge variant="outline" className="text-xs">
                                Organizador
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                      <Badge
                        variant={member.acceptedAt ? "default" : "secondary"}
                        className={
                          member.acceptedAt
                            ? "bg-success text-success-foreground"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {member.acceptedAt ? "Activo" : "Pendiente"}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Withdrawals Tab */}
            <TabsContent value="withdrawals" className="mt-6 space-y-4">
              {isOwner && (
                <div className="mb-4">
                  <Button 
                    variant="accent" 
                    className="w-full md:w-auto"
                    onClick={handleWithdrawClick}
                  >
                    <CreditCard className="h-4 w-4" />
                    Retirar fondos
                  </Button>
                </div>
              )}
              <WithdrawalsList collectionId={collectionId || ""} />
            </TabsContent>
          </Tabs>
            </>
          ) : null}
      </div>
      
      {/* Modals */}
      {collection && (
        <>
          <CreateCollectionModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)}
          />
          
          <CreateCollectionModal 
            isOpen={isAddMemberModalOpen} 
            onClose={() => setIsAddMemberModalOpen(false)}
          />
          
          <ContributeModal
            open={isContributeModalOpen}
            onOpenChange={setIsContributeModalOpen}
            collectionTitle={collection.title}
            collectionId={collection.id}
            suggestedAmount={collection.goalAmount / (memberCount || 1)}
            currentAmount={collection.currentAmount}
            goalAmount={collection.goalAmount}
          />
          
          <ShareModal
            open={isShareModalOpen}
            onOpenChange={setIsShareModalOpen}
            title={collection.title}
            url={`${window.location.origin}/join/${collection.id}`}
          />

          <ConfirmDialog
            open={isLeaveDialogOpen}
            onOpenChange={setIsLeaveDialogOpen}
            title="Dejar colecta"
            description={`¿Deseas dejar la colecta "${collection.title}"?\n\nEsta acción no se puede deshacer.`}
            confirmText="Sí, dejar colecta"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleLeaveCollection}
            isLoading={leaveMutation.isPending}
          />

          <ConfirmDialog
            open={isWithdrawDialogOpen}
            onOpenChange={setIsWithdrawDialogOpen}
            title="Retirar fondos"
            description={`¿Estás seguro de que deseas retirar todos los fondos disponibles?\n\nMonto a retirar: S/ ${collection.currentAmount}\n\nEsta acción no se puede deshacer.`}
            confirmText="Sí, retirar fondos"
            cancelText="Cancelar"
            variant="destructive"
            onConfirm={handleWithdrawFunds}
            isLoading={withdrawMutation.isPending}
          />
        </>
      )}
    </>
  );
}
