import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingAction } from "./FloatingAction";

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
