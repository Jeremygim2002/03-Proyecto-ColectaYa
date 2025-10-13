import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import { queryKeys } from '@/constants';
import { APP_CONFIG } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '@/types';


//  Hook para obtener el usuario autenticado actual
//  Integrado con Zustand authStore
export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await authApi.me();
      setUser(user); // Sincroniza con Zustand
      return user;
    },
    staleTime: APP_CONFIG.STALE_TIME.LONG,
    retry: false,
  });
}


//  Hook para iniciar sesión como usuario
//  Stores  tokens y sincroniza con Zustand
export function useLogin() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response: AuthResponse) => {
      // Store tokens en almacenamiento local
      localStorage.setItem(APP_CONFIG.TOKEN_KEY, response.tokens.accessToken);
      localStorage.setItem(APP_CONFIG.REFRESH_TOKEN_KEY, response.tokens.refreshToken);

      login(response.user, response.tokens.accessToken);
      
      queryClient.setQueryData<User>(queryKeys.auth.me(), response.user);
      
      // Invalidar todas las consultas para volver a obtenerlas con la nueva autorización
      queryClient.invalidateQueries();
    },
  });
}


//  Hook para registrar un nuevo usuario
//  Inicia sesión automáticamente después de un registro exitoso
export function useRegister() {
  const queryClient = useQueryClient();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response: AuthResponse) => {

      localStorage.setItem(APP_CONFIG.TOKEN_KEY, response.tokens.accessToken);
      localStorage.setItem(APP_CONFIG.REFRESH_TOKEN_KEY, response.tokens.refreshToken);
      
      login(response.user, response.tokens.accessToken);
      
      queryClient.setQueryData<User>(queryKeys.auth.me(), response.user);
      
      // Invalidar todas las consultas
      queryClient.invalidateQueries();
    },
  });
}


// Hook para cerrar sesión de usuario
// Limpia todos los datos de autenticación y caché
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.USER_KEY);
      
      // Update Zustand 
      logout();
      
      // Clear todas las solicitudes
      queryClient.clear();
    },
    onError: () => {
      // Incluso si falla la llamada a la API, borre los datos locales
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.USER_KEY);
      
      logout();
      queryClient.clear();
    },
  });
}
