import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    useMagicLink,
    useGoogleAuth,
    useFacebookAuth
} from '@/hooks/queries/useAuth';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import logo from '@/assets/logo.png';

export default function Login() {
    const [email, setEmail] = useState('');

    // Hooks de autenticación
    const magicLinkMutation = useMagicLink();
    const googleAuthMutation = useGoogleAuth();
    const facebookAuthMutation = useFacebookAuth();

    // Manejar Magic Link
    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Por favor ingresa tu email');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            toast.error('Por favor ingresa un email válido');
            return;
        }

        try {
            await magicLinkMutation.mutateAsync({ email: email.trim() });
            setEmail('');
        } catch (error) {
            console.error('Error en magic link:', error);
        }
    };

    // Manejar Google Auth
    const handleGoogleAuth = () => {
        googleAuthMutation.mutate();
    };

    // Manejar Facebook Auth
    const handleFacebookAuth = () => {
        facebookAuthMutation.mutate();
    };

    const isLoading = magicLinkMutation.isPending || googleAuthMutation.isPending || facebookAuthMutation.isPending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center space-y-4 pb-8">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden shadow-lg bg-background">
                            <img 
                                src={logo} 
                                alt="ColectaYa Logo" 
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            ColectaYa
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Inicia sesión para continuar
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Magic Link Form */}
                    <form onSubmit={handleMagicLink} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Ingresa tu correo
                            </label>
                            <Input
                                type="email"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full h-11"
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11"
                            variant="hero"
                            disabled={isLoading}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            {magicLinkMutation.isPending ? 'Enviando enlace...' : 'Enviar enlace de acceso'}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground font-medium">O inicia con</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleGoogleAuth}
                            variant="outline"
                            className="w-full h-11 font-medium hover:bg-muted"
                            disabled={isLoading}
                        >
                            <FcGoogle className="w-5 h-5 mr-2" />
                            {googleAuthMutation.isPending ? 'Redirigiendo...' : 'Continuar con Google'}
                        </Button>

                        <Button
                            onClick={handleFacebookAuth}
                            variant="outline"
                            className="w-full h-11 font-medium hover:bg-muted"
                            disabled={isLoading}
                        >
                            <div className="flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-[#1877F2]">
                                <FaFacebookF className="w-3 h-3 text-white" />
                            </div>
                            {facebookAuthMutation.isPending ? 'Redirigiendo...' : 'Continuar con Facebook'}
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex-col text-center space-y-2 pt-6">
                    <p className="text-sm text-muted-foreground">
                        ¿Primera vez aquí? No te preocupes
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                        Elige cualquier método y crearemos tu cuenta automáticamente
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}