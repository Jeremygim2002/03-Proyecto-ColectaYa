import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/constants';
import type {
  AuthResponse,
  MagicLinkRequest,
  OAuthResponse,
} from '@/types/user';

// ========================= QUERIES =========================

// Obtener usuario actual
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: isAuthenticated && !!user,
    retry: false,
    staleTime: APP_CONFIG.STALE_TIME.LONG,
  });
};

// ========================= MUTATIONS =========================

// Magic Link
export const useMagicLink = () => {
  return useMutation({
    mutationFn: (data: MagicLinkRequest) => authApi.magicLink(data.email),
    onSuccess: () => {
      toast.success('Magic link enviado! Revisa tu email y haz clic en el enlace para ingresar.');
    },
    onError: (error: Error) => {
      console.error('Error en magic link:', error);
      toast.error(error?.message || 'Error al enviar magic link');
    },
  });
};

// Google OAuth
export const useGoogleAuth = () => {
  return useMutation({
    mutationFn: authApi.google,
    onSuccess: (response: OAuthResponse) => {
      // Redirigir a Google OAuth
      window.location.href = response.url;
    },
    onError: (error: Error) => {
      console.error('Error en Google Auth:', error);
      toast.error(error?.message || 'Error al iniciar sesión con Google');
    },
  });
};

// Facebook OAuth  
export const useFacebookAuth = () => {
  return useMutation({
    mutationFn: authApi.facebook,
    onSuccess: (response: OAuthResponse) => {
      // Redirigir a Facebook OAuth
      window.location.href = response.url;
    },
    onError: (error: Error) => {
      console.error('Error en Facebook Auth:', error);
      toast.error(error?.message || 'Error al iniciar sesión con Facebook');
    },
  });
};

// Auth Callback (para Magic Link y OAuth)
export const useAuthCallback = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login, logout } = useAuthStore();

  return useMutation({
    mutationFn: ({ accessToken, refreshToken }: { accessToken: string; refreshToken?: string }) =>
      authApi.callback(accessToken, refreshToken),
    onSuccess: (response: AuthResponse) => {
      // Guardar tokens en localStorage
      localStorage.setItem(APP_CONFIG.TOKEN_KEY, response.tokens.accessToken);
      localStorage.setItem(APP_CONFIG.REFRESH_TOKEN_KEY, response.tokens.refreshToken);
      
      // Guardar en store
      login(response.user, response.tokens.accessToken);
      
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      navigate('/dashboard');
    },
    onError: (error: Error) => {
      console.error('Error en callback de autenticación:', error);
      logout();
      toast.error(error?.message || 'Error al procesar autenticación');
      navigate('/login');
    },
  });
};

// Logout
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Limpiar localStorage
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.USER_KEY);
      
      // Limpiar store
      logout();
      
      // Limpiar cache
      queryClient.clear();
      
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    },
    onError: (error: Error) => {
      console.error('Error en logout:', error);
      // Incluso si falla el logout en el servidor, limpiar localmente
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.USER_KEY);
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
};
