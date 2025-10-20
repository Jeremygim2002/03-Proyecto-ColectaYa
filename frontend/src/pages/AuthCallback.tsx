import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthCallback } from "@/hooks/queries/useAuth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const authCallbackMutation = useAuthCallback();
  const hasProcessed = useRef(false);

  const handleCallback = useCallback(async () => {
    // Evitar ejecuciones múltiples
    if (hasProcessed.current) {
      return;
    }

    try {
      hasProcessed.current = true;

      // Obtener tokens de la URL (para OAuth) o de fragmentos (para Magic Link)
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = new URLSearchParams(window.location.hash.slice(1));
      
      const accessToken = urlParams.get('access_token') || urlHash.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || urlHash.get('refresh_token');

      if (!accessToken) {
        throw new Error('No se encontró el token de acceso');
      }

      // Procesar el callback
      await authCallbackMutation.mutateAsync({
        accessToken,
        refreshToken: refreshToken || undefined,
      });

      toast.success("¡Autenticación exitosa!", {
        description: "Redirigiendo al dashboard...",
      });

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);

    } catch (error) {
      console.error('Error en callback de autenticación:', error);
      toast.error("Error en la autenticación", {
        description: "Redirigiendo al login...",
      });
      
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    }
  }, [navigate, authCallbackMutation]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h2 className="text-xl font-semibold">Completando autenticación...</h2>
        <p className="text-muted-foreground">Por favor espera mientras te autenticamos</p>
      </div>
    </div>
  );
}