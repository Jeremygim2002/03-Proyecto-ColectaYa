import { useAuthStore } from '@/stores/authStore';
import { useCurrentUser } from '@/hooks/queries/useAuth';

export const useUserInfo = () => {
  const { user: storeUser, isAuthenticated } = useAuthStore();
  const { data: currentUser } = useCurrentUser();

  // Usar datos del servidor si están disponibles, sino del store
  const user = currentUser || storeUser;

  // Generar iniciales del nombre
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0,2)
        .toUpperCase()
    : "??";

  // Datos del usuario
  const userName = user?.name || "Usuario";
  const userEmail = user?.email || "usuario@ejemplo.com";
  const userAvatar = user?.avatar || "";

  return {
    user,
    isAuthenticated,
    userInitials,
    userName,
    userEmail,
    userAvatar,
    isLoading: !user && isAuthenticated,
  };
};