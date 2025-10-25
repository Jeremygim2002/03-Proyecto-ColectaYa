"use client";

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCollection, useJoinCollection } from "@/hooks/queries/useCollections";
import { useAuthStore } from "@/stores/authStore";

export default function JoinCollection() {
  const { id: collectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const { data: collection, isLoading, error } = useCollection(collectionId!);
  const joinMutation = useJoinCollection();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      // Guardar la URL de retorno en sessionStorage
      sessionStorage.setItem('returnTo', `/join/${collectionId}`);
      navigate('/login');
    }
  }, [user, navigate, collectionId]);

  const handleJoinCollection = async () => {
    if (!collection || !user) return;
    
    try {
      await joinMutation.mutateAsync(collection.id);
      toast.success(`Te has unido a la colecta "${collection.title}"`);
      navigate(`/collections/${collection.id}`);
    } catch (error) {
      console.error('Error joining collection:', error);
      toast.error('Error al unirse a la colecta');
    }
  };

  const handleViewCollection = () => {
    if (collection) {
      navigate(`/collections/${collection.id}`);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

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

  // Check if user is already the owner
  const isOwner = collection.ownerId === user.id;
  
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

          {isOwner ? (
            <div className="space-y-2">
              <p className="text-center text-muted-foreground">
                Esta es tu colecta
              </p>
              <Button 
                onClick={handleViewCollection}
                className="w-full"
              >
                Ver colecta
              </Button>
            </div>
          ) : (
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
              <Button 
                variant="outline"
                onClick={handleViewCollection}
                className="w-full"
              >
                Solo ver colecta
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}