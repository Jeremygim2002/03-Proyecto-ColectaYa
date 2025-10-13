"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Importar las imágenes 
import heroCollaborationImg from "@/assets/hero-collaboration.webp";
import onboardingPaymentsImg from "@/assets/onboarding-payments.webp";
import onboardingSuccessImg from "@/assets/onboarding-success.webp";

const slides = [
  {
    title: "Organiza colectas con tus amigos",
    subtitle: "Crea y gestiona vaquitas grupales de forma fácil y transparente",
    image: heroCollaborationImg,
  },
  {
    title: "Pagos seguros y directos",
    subtitle: "Acepta aportes con Yape, Plin y MercadoPago sin complicaciones",
    image: onboardingPaymentsImg,
  },
  {
    title: "Alcanza tus metas juntos",
    subtitle: "Sigue el progreso en tiempo real y celebra cada logro",
    image: onboardingSuccessImg,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-6xl">
        {/* Hero Image Section */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="relative h-[40vh] min-h-[300px] md:h-[50vh]">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-center">
                  <h1 className="mb-3 animate-fade-in text-2xl lg:text-4xl font-bold text-foreground">
                    {slide.title}
                  </h1>
                  <p className="animate-fade-in text-sm md:text-lg text-muted-foreground">{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {currentSlide > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={prevSlide}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          {currentSlide < slides.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={nextSlide}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Slide Indicators */}
        <div className="mb-8 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/30"
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA Card */}
        <Card className="mx-auto max-w-lg animate-slide-up rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col space-y-4">
            <Button
              size="lg"
              variant="hero"
              className="w-full"
              onClick={() => navigate("/register")}
              aria-label="Crear cuenta"
            >
              Crear cuenta
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
              aria-label="Iniciar sesión"
            >
              Iniciar sesión
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Al continuar, aceptas nuestros{" "}
              <a href="/terms" className="text-primary hover:underline">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
