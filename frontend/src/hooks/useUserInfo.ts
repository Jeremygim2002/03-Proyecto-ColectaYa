import { useAuthStore } from '@/stores/authStore';
import { useCurrentUser } from '@/hooks/queries/useAuth';

export const useUserInfo = () => {
  const { user: storeUser, isAuthenticated } = useAuthStore();
  const { data: currentUser } = useCurrentUser();

  const user = currentUser || storeUser;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0,2)
        .toUpperCase()
    : "??";

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