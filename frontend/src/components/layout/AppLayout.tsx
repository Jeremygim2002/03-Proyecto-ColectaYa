import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingAction } from "./FloatingAction";

/**
 * AppLayout - Layout compartido para todas las páginas autenticadas
 * Header y Footer se renderizan una sola vez y permanecen montados durante la navegación entre páginas
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
      <FloatingAction />
    </div>
  );
}
