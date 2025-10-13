"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, User, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Correo electrónico inválido").max(255),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // TODO: Implement API call to update user profile
      // await updateUserProfile(data);
      setIsEditing(false);
      reset(data); // Reset with new values to clear isDirty
      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error al actualizar el perfil");
    }
  };

  const handleCancel = () => {
    reset(); // Restore initial values
    setIsEditing(false);
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('es-PE', {
        month: 'long',
        year: 'numeric'
      })
    : "Cargando...";

  return (
    <div className="container mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 space-y-2 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold">Mi Perfil</h1>
        <p className="text-sm md:text-base text-muted-foreground">Administra tu información personal</p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 animate-slide-up">
        {!user ? (
          // Skeleton Loading - Improved Visibility
          <div>
            <div className="mb-8 flex flex-col items-center">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="mt-4 h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <>
            {/* Avatar Section */}
            <div className="mb-8 flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src="" alt={user?.name || ""} />
                  <AvatarFallback className="bg-gradient-primary text-4xl text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="accent"
                  size="icon"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg"
                  aria-label="Cambiar foto"
                  disabled
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <h2 className="mt-4 text-2xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">Miembro desde {joinedDate}</p>
            </div>

            {/* Info Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nombre completo
                  </Label>
                  <Input
                    id="name"
                    disabled={!isEditing}
                    className={`disabled:opacity-100 ${errors.name ? "border-destructive" : ""}`}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    disabled={!isEditing}
                    className={`disabled:opacity-100 ${errors.email ? "border-destructive" : ""}`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Join Date (Read-only) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Miembro desde
                  </Label>
                  <Input value={joinedDate} disabled className="disabled:opacity-100" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <Button type="button" variant="accent" className="flex-1" onClick={() => setIsEditing(true)}>
                    Editar perfil
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="accent" className="flex-1" disabled={isSubmitting || !isDirty}>
                      {isSubmitting ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </>
        )}
      </Card>

      {/* Stats Card */}
      <Card className="mt-6 p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h3 className="mb-4 text-lg font-semibold">Estadísticas</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">-</p>
            <p className="text-sm text-muted-foreground">Colectas creadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">-</p>
            <p className="text-sm text-muted-foreground">Participaciones</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">-</p>
            <p className="text-sm text-muted-foreground">Total aportado</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
