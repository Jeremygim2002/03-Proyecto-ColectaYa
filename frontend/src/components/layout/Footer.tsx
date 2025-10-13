"use client";

import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: "Términos de Servicio", href: "/terms" },
    { name: "Privacidad", href: "/privacy" },
    { name: "Soporte", href: "/support" },
  ];

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center space-y-2 md:items-start">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-lg font-bold text-foreground">Colectaya</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © {currentYear} Colectaya. Todos los derechos reservados.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-muted-foreground transition-all duration-300 hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* IInfo sobre metodos de pago */}
        <div className="mt-6 border-t border-border/40 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Usamos Yape, Plin y MercadoPago para pagos directos y seguros
          </p>
        </div>
      </div>
    </footer>
  );
}
