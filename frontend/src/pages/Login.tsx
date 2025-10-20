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
import { Mail, Chrome, Facebook } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-900">
                        olectaYa
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Inicia sesión en tu cuenta
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Magic Link Form */}
                    <form onSubmit={handleMagicLink} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="xyz@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full"
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            variant="hero"
                            disabled={isLoading}

                        >
                            <Mail className="w-4 h-4 mr-2" />
                            {magicLinkMutation.isPending ? 'Enviando...' : 'Continuar con Email'}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">O continúa con</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleGoogleAuth}
                            variant="outline"
                            className="w-full"
                            disabled={isLoading}
                        >
                            <Chrome className="w-4 h-4 mr-2" />
                            {googleAuthMutation.isPending ? 'Redirigiendo...' : 'Continuar con Google'}
                        </Button>

                        <Button
                            onClick={handleFacebookAuth}
                            variant="outline"
                            className="w-full"
                            disabled={isLoading}
                        >
                            <Facebook className="w-4 h-4 mr-2" />
                            {facebookAuthMutation.isPending ? 'Redirigiendo...' : 'Continuar con Facebook'}
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="text-center">
                    <p className="text-sm text-gray-600">
                        ¿Primera vez en ColectaYa?{' '}
                        <span className="text-blue-600">
                            Usa cualquier método de login
                        </span>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}