## Flujo end-to-end: Frontend ↔ Backend (Explicación para exposición)

Este documento explica, paso a paso y con referencias a archivos del repositorio, cómo fluye la información entre el frontend y el backend en el proyecto "ColectaYa". Está pensado para que lo uses en una exposición técnica "de pies a cabeza".

Estructura del documento
- Resumen general
- Flujo Frontend (entrada, rutas, cliente API, hooks, páginas y componentes clave)
- Flujo Backend (bootstrap, módulos, controllers, services, Prisma, DTOs y validación)
- Ejemplos de flujo (crear colección, contribuir, unirse)
- Archivos clave — lista y por qué
- Notas para la exposición

---

## Resumen general

ColectaYa es una aplicación full-stack TypeScript con:
- Backend: NestJS + Prisma (Postgres). Código en `backend/src/`.
- Frontend: React 19 + Vite + TypeScript. Código en `frontend/src/`.

El patrón general es: el usuario en el navegador interactúa con componentes/páginas (frontend) → estos usan el cliente API y hooks (React Query) → el backend recibe solicitudes en controllers (NestJS) → servicios aplican lógica y usan Prisma para persistencia → respuestas vuelven al frontend → React Query actualiza/caché e invalida.

## Flujo Frontend (detallado)

1) Punto de entrada
- Archivo: `frontend/src/main.tsx` (o `frontend/src/main.ts`) — monta React y renderiza la aplicación. Aquí se registra React Query Provider, Theme, y el router.

2) Ruteo y páginas
- Archivo principal: `frontend/src/App.tsx` (o rutas en `src/pages`) — contiene rutas hacia páginas: `CollectionDetail`, `JoinCollection`, `Profile`, etc.

3) Cliente API
- Ruta/archivo: `frontend/src/api/client.ts` y `frontend/src/api/index.ts` (endpoints folder).
- Qué hace: centraliza fetch/axios (u otro wrapper) con base URL, headers (Authorization si aplica), manejo de errores y transformación mínima.
- Por qué: evita duplicar la base URL y el manejo de tokens, y permite cambiar la implementación en un solo lugar.

4) Hooks y React Query
- Carpeta: `frontend/src/hooks/queries/` (p. ej. `useCollections.ts`, `useContributions.ts`).
- Qué hacen: encapsulan llamadas a endpoints y exponen estados (isLoading, data, error) y funciones (refetch, invalidate).
- Claves (query keys): definidas en `frontend/src/constants/queryKeys.ts` para asegurar consistencia al invalidar caches.

5) Páginas / Componentes clave
- `frontend/src/pages/CollectionDetail.tsx`
  - Usa `useParams()` para leer collectionId de la URL.
  - Llama a `useCollections` o `useCollectionById` y `useContributions`.
  - Renderiza datos: nombre, meta, aportes, botones (contribuir, unirse).
  - Evitar logs sensibles: no mostrar ni loggear montos/IDs en consola en producción.

- `frontend/src/components/common/CreateCollectionModal.tsx`
  - Formulario para crear colección. Usa react-hook-form + zod para validación.
  - Envía payload al endpoint `POST /collections`.

- `frontend/src/pages/JoinCollection.tsx` / `ContributeModal`
  - Flujo de unirse y aportar: recoge datos y llama a endpoints backend.

6) Estado de autenticación
- Ubicación posible: `frontend/src/stores/` o `supabase` client en `frontend/src/api`.
- Si se usa Supabase client en frontend, el token se incluye en requests; de lo contrario, el backend gestiona sesión y cookies.

7) Respuesta y actualizaciones
- Tras mutaciones (crear contributión, crear colección), los hooks usan React Query para invalidar keys y refetchear datos actualizados. Ej: invalidar `['collection', id, 'contributions']`.

## Flujo Backend (detallado)

1) Punto de entrada (bootstrap)
- Archivo: `backend/src/main.ts`
  - Configura NestFactory, aplica middlewares (helmet, cors), pipes globales (ValidationPipe), interceptors y registro de logging.
  - Importante para seguridad: se configura CORS y ValidationPipe con whitelist/transform.

2) Módulos principales
- `backend/src/app.module.ts` — agrupa submódulos: `CollectionsModule`, `ContributionsModule`, `PrismaModule`, `AuthModule`, `InvitationsModule`, etc.

3) Controllers (exposición HTTP)
- Ubicación: `backend/src/*/*.controller.ts`, p. ej. `backend/src/collections/collections.controller.ts`
  - Reciben peticiones REST (GET/POST/PUT/DELETE).
  - Validan entrada (típicamente con DTOs) y delegan en Services.

4) Services (lógica de negocio)
- Ubicación: `backend/src/*/*.service.ts` (ej: `collections.service.ts`, `contributions.service.ts`).
  - Implementan la lógica: cálculos, comprobaciones de permisos, orquestación de llamadas a Prisma y otros servicios (p. ej. supabase sync, notificaciones, emails).

5) Persistencia: Prisma
- Archivos: `backend/prisma/schema.prisma` — define modelos (User, Collection, Contribution, Invitation, Member, Withdrawal).
  - Servicios usan `PrismaService` (`backend/src/prisma/prisma.service.ts`) para ejecutar queries parametrizadas.
  - Prisma garantiza consultas parametrizadas evitando concatenación insegura que conduce a SQL injection.

6) Validación y DTOs
- Ubicación DTOs: `backend/src/*/dto/*.ts` (p. ej. `create-collection.dto.ts`, `create-contribution.dto.ts`).
  - Con `class-validator` y `class-transformer` se valida/transforma la entrada antes de llegar a la lógica.

7) Autenticación
- `backend/src/supabase/supabase-auth.service.ts` y `backend/src/auth/*` — integran Supabase (o middleware JWT) para validar tokens y sincronizar usuarios.

8) Respuestas y telemetry
- Services retornan DTOs/objetos que controllers formatean a JSON. Logs de error se hacen en backend; deben evitar exponer tokens o PII en logs.

## Ejemplo de flujo: Crear una colección (end-to-end)

1) Frontend
  - Usuario abre `CreateCollectionModal` y completa formulario.
  - Form validado con react-hook-form + zod.
  - Se llama a cliente API: `POST /collections` con payload: { title, goalAmount, description, ownerId }.

2) Backend
  - `CollectionsController.create()` recibe la petición.
  - DTO `CreateCollectionDto` valida los campos.
  - `CollectionsService.create()` crea la entidad con `prisma.collection.create()`.
  - Opcional: crear membresía/owner en `members` table.

3) DB
  - Prisma crea registros en `Collection` y `Member`.

4) Frontend
  - Tras respuesta 201, el frontend invalida queries relevantes (p. ej. `['collections', 'list']`) para que la UI muestre la nueva colección.

Archivos implicados (resumen):
- Frontend: `frontend/src/components/common/CreateCollectionModal.tsx`, `frontend/src/api/client.ts`, `frontend/src/hooks/queries/useCollections.ts`, `frontend/src/constants/queryKeys.ts`.
- Backend: `backend/src/collections/collections.controller.ts`, `backend/src/collections/collections.service.ts`, `backend/src/collections/dto/create-collection.dto.ts`, `backend/prisma/schema.prisma`, `backend/src/prisma/prisma.service.ts`.

## Ejemplo de flujo: Contribuir a una colección

1) Frontend
  - Usuario clica "Contribuir" en `CollectionDetail`.
  - Se abre `ContributeModal` y el usuario confirma monto y método.
  - Frontend llama `POST /collections/:id/contributions` con body { amount, userId, paymentMethod }.

2) Backend
  - `ContributionsController.create()` valida DTO y llama a `ContributionsService.create()`.
  - `ContributionsService` puede: validar que la colección está abierta, crear registro de contribution en DB, notificar al owner, actualizar estadísticas.
  - Si hay integración con pasarela, el servicio orquesta llamada al gateway y registra resultado.

3) DB y cache
  - Contribution insertada en DB; después se puede actualizar suma total en `Collection` o mantener como agregado en queries.
  - Backend retorna 201; frontend invalida la key `['collection', id, 'contributions']` y `['collection', id]` para refrescar montos en la vista.

Archivos implicados (resumen):
- Frontend: `frontend/src/pages/CollectionDetail.tsx`, `frontend/src/components/contribute/ContributeModal.tsx`, `frontend/src/hooks/queries/useContributions.ts`.
- Backend: `backend/src/contributions/contributions.controller.ts`, `backend/src/contributions/contributions.service.ts`, `backend/src/contributions/dto/create-contribution.dto.ts`.

## Archivos clave — listado con propósito y por qué

- `frontend/src/main.tsx` — punto de arranque del frontend. Configura providers (React Query, router).
- `frontend/src/App.tsx` — rutas principales (pages).
- `frontend/src/api/client.ts` — cliente HTTP centralizado (baseURL, interceptors).
- `frontend/src/hooks/queries/*` — encapsulan queries/mutations. Importante para caché/invalidation.
- `frontend/src/pages/CollectionDetail.tsx` — página donde se muestran montos, aportes y call-to-actions.
- `frontend/src/components/common/CreateCollectionModal.tsx` — formulario cliente para crear colecciones.

- `backend/src/main.ts` — punto de arranque del backend; aplica seguridad y pipes.
- `backend/src/app.module.ts` — ordena y expone módulos.
- `backend/src/prisma/prisma.service.ts` — wrapper de Prisma; centraliza logs y manejo de conexión.
- `backend/prisma/schema.prisma` — modelo de datos (tabla Collection, Contribution, User, Member, Invitation, Withdrawal).
- `backend/src/collections/collections.controller.ts` y `collections.service.ts` — endpoints y lógica de collections.
- `backend/src/contributions/*` — endpoints y lógica de contributions.
- `backend/src/*/dto/*.ts` — validación de inputs (class-validator).

## Notas de seguridad y presentación

- Nunca muestres tokens o PII en logs. Para la demo, si necesitas mostrar datos, hazlo con datos anónimos o mocked.
- En la exposición, muestra el flujo con una petición real (devtools Network) y el log del servidor (solo si has retirado datos sensibles). Explica cada salto: componente → hook → cliente → controller → service → prisma.
- Señala la existencia de ValidationPipe en `backend/src/main.ts` y que Prisma usa consultas parametrizadas (en `prisma.service.ts`). Esto es clave para asegurar integridad y evitar SQL injection.

## Sugerencia de guion para la exposición (3–6 minutos por caso)

1) Mostrar la UI (CollectionDetail). Indicar el componente y el hook que alimenta la vista.
2) Abrir DevTools (Network) y realizar una contribución. Mostrar la request `POST /collections/:id/contributions`.
3) En el backend, abrir logs (o breakpoint) en `ContributionsController.create()` y explicar DTO y validación.
4) Seguir a `ContributionsService.create()` y explicar la llamada a Prisma (método `create`) y la actualización/invalidación.
5) Volver al frontend y mostrar cómo React Query actualiza la UI automáticamente al re-fetchear.

## Preguntas frecuentes para la audiencia

- ¿Cómo se evita la inyección SQL? — Prisma usa queries parametrizadas; además se valida la entrada con DTOs.
- ¿Dónde se maneja la autenticación? — Supabase integrándose en `backend/src/supabase/` y en `auth` module; tokens se validan y se sincroniza usuario.
- ¿Cómo se minimiza la exposición de PII? — No loggeando en producción, utilizando redaction en loggers y validando los DTOs.

---

Archivo creado para tu exposición. Si quieres, puedo:
- Añadir un diagrama secuencial (mermaid) con los pasos exactos (request/response). 
- Generar diapositivas con los fragmentos de código relevantes y capturas de Network/Logs.
- Incluir ejemplos de peticiones curl o Postman para que ejecutes en vivo.

Indícame si quieres que incluya diagramas mermaid y/o fragmentos de código exactos (con rutas y líneas). 
