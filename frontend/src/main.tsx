import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { preloadCriticalAssets } from './lib/utils.ts'

// Precargar los assets antes y durante el render de la pagina
preloadCriticalAssets();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
