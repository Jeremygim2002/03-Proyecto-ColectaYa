import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import './index.css';
import App from './App.tsx';
import { preloadCriticalAssets } from './lib/utils.ts';

// Configuración de PayPal
const paypalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
  currency: 'USD',
  intent: 'capture',
};

// Precargar los assets antes y durante el render de la pagina
preloadCriticalAssets();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PayPalScriptProvider options={paypalOptions}>
      <App />
    </PayPalScriptProvider>
  </StrictMode>,
);
