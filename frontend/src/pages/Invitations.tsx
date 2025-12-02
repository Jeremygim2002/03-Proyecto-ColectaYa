"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Target, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";
import { useInvitations, useRespondInvitation } from "@/hooks/queries";

export default function Invitations() {
  const { data: invitations = [], isLoading } = useInvitations();
  const respondMutation = useRespondInvitation();

  const handleAccept = async (id: string, collectionTitle: string) => {
    try {
      await respondMutation.mutateAsync({ id, accepted: true });
      toast.success(`Te has unido a "${collectionTitle}"`);
    } catch {
      toast.error("Error al aceptar la invitación");
    }
  };

  const handleReject = async (id: string, collectionTitle: string) => {
    try {
      await respondMutation.mutateAsync({ id, accepted: false });
      toast.error(`Has rechazado la invitación a "${collectionTitle}"`);
    } catch {
      toast.error("Error al rechazar la invitación");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6 md:mb-8 space-y-2 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold">Invitaciones</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {isLoading 
            ? "Cargando invitaciones..."
            : invitations.length > 0
            ? `Tienes ${invitations.length} invitación${invitations.length > 1 ? "es" : ""} pendiente${invitations.length > 1 ? "s" : ""}`
            : "No tienes invitaciones pendientes"}
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
            {isLoading ? (
              // Skeleton Loading - Improved Visibility
              <>
                {[1, 2].map((i) => (
                  <Card key={i} className="p-6">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-4 border-y">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) :
            invitations.length > 0 ? (
              invitations.map((invitation, index) => (
                <Card
                  key={invitation.id}
                  className="p-6 animate-slide-up hover-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col gap-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12 border-2 border-border">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {invitation.inviter?.name ? 
                              invitation.inviter.name.split(" ").map((n: string) => n[0]).join("") :
                              invitation.inviter?.email?.charAt(0).toUpperCase() || "?"
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            <span className="font-semibold text-foreground">
                              {invitation.inviter?.name || invitation.inviter?.email || "Usuario"}
                            </span> te invita a
                          </p>
                          <h3 className="text-xl font-bold mb-2">{invitation.collection?.title}</h3>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {invitation.status === 'PENDING' ? 'Pendiente' : invitation.status}
                      </Badge>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-border">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Colecta</p>
                          <p className="font-semibold">{invitation.collection?.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                          <Calendar className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Invitado</p>
                          <p className="font-semibold">
                            {new Date(invitation.createdAt).toLocaleDateString('es-PE', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReject(invitation.id, invitation.collection?.title || '')}
                        disabled={respondMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Rechazar
                      </Button>
                      <Button
                        variant="accent"
                        className="flex-1"
                        onClick={() => handleAccept(invitation.id, invitation.collection?.title || '')}
                        disabled={respondMutation.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Aceptar invitación
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center animate-fade-in">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Mail className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No hay invitaciones</h3>
                    <p className="text-sm text-muted-foreground">
                      Cuando alguien te invite a una colecta, aparecerá aquí
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
      </div>
    );
  }
