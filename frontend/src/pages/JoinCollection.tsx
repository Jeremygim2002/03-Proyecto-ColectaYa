"use client";

import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCollectionPreview, useJoinCollectionViaLink } from "@/hooks/queries/useCollections";
import { useAuthStore } from "@/stores/authStore";

export default function JoinCollection() {
  const { id: collectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  // Usar preview - permite ver colectas privadas vía link de compartir
  const { data: collection, isLoading, error } = useCollectionPreview(collectionId!);
  // Usar joinViaLink - permite unirse a colectas privadas desde link compartido
  const joinMutation = useJoinCollectionViaLink();

  // DEBUG: Ver qué está pasando
  console.log('🔍 JoinCollection - collectionId:', collectionId);
  console.log('🔍 JoinCollection - isLoading:', isLoading);
  console.log('🔍 JoinCollection - error:', error);
  console.log('🔍 JoinCollection - error details:', error ? JSON.stringify(error, null, 2) : 'no error');
  console.log('🔍 JoinCollection - collection:', collection);
  console.log('🔍 JoinCollection - user:', user);

  // NO redirigir automáticamente - permitir ver la colecta primero
  // Solo redirigir al intentar unirse sin estar autenticado

  const handleJoinCollection = async () => {
    if (!collection) return;
    
    // Si no está autenticado, guardar URL y redirigir a login
    if (!user) {
      sessionStorage.setItem('returnTo', `/join/${collectionId}`);
      navigate('/login');
      return;
    }
    
    try {
      await joinMutation.mutateAsync(collection.id);
      toast.success(`Te has unido a la colecta "${collection.title}"`);
      navigate(`/collections/${collection.id}`);
    } catch (error) {
      console.error('Error joining collection:', error);
      toast.error('Error al unirse a la colecta');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card className="p-6 text-center space-y-4">
          <h1 className="text-xl font-semibold text-destructive">
            Colecta no encontrada
          </h1>
          <p className="text-muted-foreground">
            La colecta que buscas no existe o ha sido eliminada.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Ir al inicio
          </Button>
        </Card>
      </div>
    );
  }

  // Check if user is already the owner (solo si está autenticado)
  const isOwner = user && collection.ownerId === user.id;
  
  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <Card className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{collection.title}</h1>
          {collection.description && (
            <p className="text-muted-foreground">{collection.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Meta de la colecta</p>
            <p className="text-2xl font-bold text-primary">
              S/ {collection.goalAmount.toLocaleString("es-PE")}
            </p>
            <p className="text-sm text-muted-foreground">
              Recaudado: S/ {Math.min(collection.currentAmount, collection.goalAmount).toLocaleString("es-PE")}
            </p>
          </div>

          {!user ? (
            // Usuario NO autenticado - mostrar botón de login
            <div className="space-y-2">
              <p className="text-center text-muted-foreground">
                Inicia sesión para unirte a esta colecta
              </p>
              <Button 
                onClick={handleJoinCollection}
                className="w-full"
              >
                Iniciar sesión y unirme
              </Button>
            </div>
          ) : isOwner ? (
            // Usuario ES el owner
            <div className="space-y-2">
              <p className="text-center text-muted-foreground">
                Esta es tu colecta
              </p>
              <Button 
                onClick={() => navigate(`/collections/${collection.id}`)}
                className="w-full"
              >
                Ver mi colecta
              </Button>
            </div>
          ) : (
            // Usuario autenticado pero NO es owner
            <div className="space-y-2">
              <p className="text-center text-muted-foreground">
                ¿Te gustaría unirte a esta colecta?
              </p>
              <Button 
                onClick={handleJoinCollection}
                className="w-full"
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? "Uniéndose..." : "Unirse a la colecta"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}