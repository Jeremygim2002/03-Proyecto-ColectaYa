# Guía para exposición técnica: ColectaYa (frontend ↔ backend)

Este documento es tu guion técnico para explicar el código "de pies a cabeza" en una exposición técnica. Contiene un orden recomendado, tiempos por sección, qué archivos abrir en vivo, qué líneas o fragmentos destacar y qué preguntas/observaciones enfatizar.

Duración recomendada: 20–30 minutos (puedes ajustar según el tiempo disponible)

Estructura rápida
- 0:00–0:90s — Presentación y objetivo de la demo (¿qué muestra? datos y usuarios de ejemplo).
- 1:30–6:00 — Flujo front → back: demo práctica (crear/consultar/contribuir). Mostrar Network y código relevante al mismo tiempo.
- 6:00–12:00 — Paseo por el frontend (componentes, hooks, cliente API, cache).
- 12:00–20:00 — Paseo por el backend (bootstrap, controllers, services, DTOs, Prisma). Explicar validación y protección contra inyección SQL.
- 20:00–25:00 — Preguntas técnicas / arquitectura y consideraciones de seguridad.

Preparación antes de la exposición
- Asegúrate de tener el proyecto corriendo localmente:
  - Backend: abre `d:/ColectaYa/backend/` y ejecuta el script de desarrollo (p. ej., `npm run start:dev` si existe).
  - Frontend: abre `d:/ColectaYa/frontend/` y ejecuta `npm run dev` (Vite).
- Abre DevTools (Network) en el navegador en la vista `CollectionDetail`.
- Ten listos en el editor los archivos que vas a abrir (usa una sola ventana y pestañas ordenadas).

Recomendación general para la exposición en vivo
- Muestra la UI y, simultáneamente, el request en Network.
- Abre el fichero del frontend que corresponde a la vista activa (p. ej. `CollectionDetail.tsx`) y explica qué hook solicita los datos.
- En el backend, abre el controller que recibe la petición (p. ej. `contributions.controller.ts`) y el DTO que valida la entrada; muestra la línea con las validaciones.
- Explica la llamada a Prisma y por qué es segura (parametrización).

Checklist de archivos a tener abiertos (orden de aparición en la demo)

1) Punto de entrada - Frontend
- `frontend/src/main.tsx` — muestra configuración de proveedores (React Query Provider, Router) y por qué es importante para el cache/global state.

2) Página de demostración
- `frontend/src/pages/CollectionDetail.tsx` — la vista que vas a manipular en la demo.
  - Qué destacar: lectura de `collectionId` (p. ej. `useParams()`), llamadas a hooks `useCollectionById` y `useContributions`, componente que abre `ContributeModal`.

3) Hooks / Cliente API
- `frontend/src/hooks/queries/useContributions.ts` y `frontend/src/hooks/queries/useCollections.ts` — mostrar la query key y el `enabled` guard (ejecutar sólo si `id` existe).
- `frontend/src/api/client.ts` — configuración del cliente HTTP (baseURL, headers Authorization). Explica dónde se adjunta el token si aplica.
- `frontend/src/constants/queryKeys.ts` — cómo se construyen las keys de caché y por qué es importante para invalidaciones tras mutaciones.

4) Componentes de UI relevantes
- `frontend/src/components/common/CreateCollectionModal.tsx` — formulario, validación cliente (react-hook-form + zod).
- `frontend/src/components/contribute/ContributeModal.tsx` (o nombre equivalente) — formulario de aportes y llamada a la mutación.

5) Backend: punto de entrada y seguridad
- `backend/src/main.ts` — muestra las siguientes configuraciones:
  - `ValidationPipe` (whitelist, transform)
  - `helmet()` y CORS
  - Logger global o interceptores
  - Por qué estas configuraciones importan (seguridad y consistencia de inputs).

6) Backend: controller y DTO
- `backend/src/contributions/contributions.controller.ts` — método `create()` que recibe `POST /collections/:id/contributions`.
- `backend/src/contributions/dto/create-contribution.dto.ts` — muestra las validaciones que impiden datos inválidos. Ejemplo real en este repo:

  Archivo: `backend/src/contributions/dto/create-contribution.dto.ts`

  ```ts
  import { IsNumber, Min } from 'class-validator';

  export class CreateContributionDto {
    @IsNumber()
    @Min(0.01)
    amount!: number;
  }
  ```

  - Explica: `@IsNumber()` asegura el tipo; `@Min(0.01)` evita aportes nulos/0.
  - Indica en qué punto `ValidationPipe` valida automáticamente (antes de entrar al controller method).

7) Backend: service y Prisma
- `backend/src/contributions/contributions.service.ts` — lógica: validar estado de la colección, crear registro en DB, orquestar notificaciones o updates.
- `backend/src/prisma/prisma.service.ts` — wrapper para Prisma Client. Explica: centraliza la conexión, controla logs y health checks.
- `backend/prisma/schema.prisma` — abrir el modelo `Contribution` y `Collection` para mostrar relaciones y cómo Prisma genera el cliente.

8) Casos a mostrar en vivo

- Caso A — Crear colección (flujo create):
  1. En UI, abrir `CreateCollectionModal` y enviar formulario.
  2. Mostrar la petición `POST /collections` en Network.
  3. Abrir `collections.controller.ts` y `create-collection.dto.ts` para explicar validación.
  4. Abrir `collections.service.ts` y la llamada a `prisma.collection.create()`.
  5. Volver al frontend y explicar la invalidación de keys y re-render.

- Caso B — Contribuir (flujo contribution):
  1. En UI, abrir `ContributeModal` de `CollectionDetail`.
  2. Enviar `POST /collections/:id/contributions` con un `amount` real.
  3. Mostrar Network y la respuesta 201.
  4. Abrir `contributions.controller.ts` y `create-contribution.dto.ts` (ya listados arriba).
  5. Abrir `contributions.service.ts` y la llamada a Prisma.
  6. Volver al frontend y mostrar la actualización (React Query invalidation).

9) Qué mostrar en los logs / qué no mostrar
- Mostrar: status codes, errores no sensibles (400/422/500), tiempos y traces.
- NO mostrar: tokens, correos, números de tarjeta, montos en consola del lado cliente en producción.
- Si necesitas mostrar datos sensibles para la demo, anonymízalos previamente.

10) Snippets y líneas clave que conviene tener a mano
- ValidationPipe: `backend/src/main.ts` (líneas donde se crea `app.useGlobalPipes(new ValidationPipe(...))`).
- Prisma service: `backend/src/prisma/prisma.service.ts` (método `getPrisma()` o acceso al client).
- Controller example: `backend/src/contributions/contributions.controller.ts` (método `create`).
- DTO example: `backend/src/contributions/dto/create-contribution.dto.ts` (líneas con `@IsNumber()` y `@Min()`).
- Frontend hook: `frontend/src/hooks/queries/useContributions.ts` (mostrar `enabled: !!id` y queryKey).
- Frontend page: `frontend/src/pages/CollectionDetail.tsx` (dónde se renderiza y dónde se abre el modal de contribuir).

11) Comandos útiles (para preparar la demo)

Desde `d:/ColectaYa/backend/` (PowerShell):

```powershell
# Instala dependencias si hace falta
npm install
# Levanta backend (modo desarrollo - ejemplo, puede variar según package.json)
npm run start:dev
```

Desde `d:/ColectaYa/frontend/` (PowerShell):

```powershell
npm install
npm run dev
```

12) Preguntas complicadas que te pueden hacer (y respuestas cortas)
- ¿Cómo se evita la inyección SQL?
  - Prisma usa consultas parametrizadas y además validamos datos con DTOs en backend (ValidationPipe). Ver `backend/prisma/schema.prisma` y `backend/src/*/dto/*`.
- ¿Qué pasa si un request llega sin `collectionId`?
  - Las queries en frontend deben estar condicionadas (`enabled: !!id`). En backend la ruta con `:id` obliga a que exista, y el controller valida inputs y retorna 400/404 según corresponda.
- ¿Cómo maneja el sistema la autentificación?
  - Se integra Supabase en `backend/src/supabase/` y los guards en `backend/src/auth/` — validan tokens y sincronizan usuarios.

13) Recursos extra (opcional para la demo)
- Generar capturas de Network ya listas en una carpeta `demo_assets/` para evitar fallos en vivo.
- Añadir un diagrama mermaid en `FLUJO_FRONTEND_BACKEND.md` (si lo quieres, puedo añadirlo ahora).

---

Si quieres, ahora:
- Añado diagramas mermaid al mismo MD para que muestres gráficamente el flujo request → controller → service → prisma → response.
- Preparo una pequeña presentación (4–8 slides) con los fragmentos de código a abrir en vivo.

Indica qué prefieres y lo hago enseguida.
