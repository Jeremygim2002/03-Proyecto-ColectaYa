## Flujo frontend: Withdrawals (retiros) — paso a paso para la exposición

Este documento describe el flujo en el frontend para las operaciones de withdrawals (retiros). Está pensado para tu demo: fases claras, archivos a abrir, qué líneas destacar y cómo demostrar cache, mutaciones y manejo de tokens.

Nota: rutas y nombres de archivos están basados en la convención del proyecto (`frontend/src/...`). Si en tu repo hay nombres ligeramente distintos, adáptalos según corresponda.

FASE 1: Usuario navega a la vista de retiros
Archivo: `frontend/src/constants/routes.ts`
Ruta: `/withdrawals` o `/withdrawals/:id` (según la UI)
Proceso: El usuario hace clic en el menú "Retiros" o en una fila del dashboard. React Router monta `WithdrawalsPage` o `WithdrawalDetail`.

FASE 2: Componente inicia request de lista o detalle
Archivo: `frontend/src/pages/Withdrawals.tsx` o `frontend/src/pages/WithdrawalDetail.tsx`
Código típico: `useQuery({ queryKey: queryKeys.withdrawals.list(), queryFn: withdrawalsApi.list })` o `useQuery(queryKeys.withdrawals.detail(id), () => withdrawalsApi.get(id))`
Proceso: Al montar, el componente ejecuta el hook para obtener la lista de retiros o los detalles.

FASE 3: Genera query key
Archivo: `frontend/src/constants/queryKeys.ts`
Función: `queryKeys.withdrawals.list()` o `queryKeys.withdrawals.detail('456')`
Proceso: Genera keys como `['withdrawals','list']` o `['withdrawals','detail','456']` que React Query usa para cache/identificación.

FASE 4: Revisa cache
Archivo: `frontend/src/lib/queryClient.ts`
Configuración: `staleTime` y `cacheTime` definidos globalmente (ej. 5 min)
Proceso: TanStack Query devuelve datos cacheados si son válidos; si no, marca `isLoading` y realiza la petición.

FASE 5: Invoca endpoint de withdrawals
Archivo: `frontend/src/api/endpoints/withdrawals.ts`
Función: `withdrawalsApi.get(id)` o `withdrawalsApi.list()`
Proceso: La función prepara la ruta y llama a `api/client.ts`.

FASE 6: Construye URL del backend
Archivo: `frontend/src/constants/api.ts`
Constante: `API_ENDPOINTS.WITHDRAWALS.GET(id)` o `API_ENDPOINTS.WITHDRAWALS.LIST`
Proceso: Construye `/withdrawals` o `/withdrawals/:id`.

FASE 7: Construye request y ejecuta
Archivo: `frontend/src/api/client.ts`
URL final: `http://localhost:3000/withdrawals` (según env)
Proceso: Prepara headers (`Authorization: Bearer <token>`), método y body si hay mutación.

FASE 8: Mostrar estado loading
Archivo: `frontend/src/pages/Withdrawals.tsx`
Estado: `{ isLoading: true, data: undefined }`
Proceso: Renderizar skeleton/table loader; para detail mostrar spinner en el panel de detalles.

FASE 9: Backend procesa la request
Endpoint: `GET /withdrawals` o `GET /withdrawals/:id`
Proceso: Backend valida token, verifica permisos (solo admin/owner), consulta DB y devuelve JSON.

FASE 10: httpClient procesa respuesta
Archivo: `frontend/src/api/client.ts`
Proceso: Si `2xx` parsea JSON; si `401` intenta refresh (ver más abajo); si error formatea `ApiError`.

FASE 11: React Query guarda en cache
Archivo: `frontend/src/lib/queryClient.ts`
Cache entry: `['withdrawals','list']` o `['withdrawals','detail','456']`
Proceso: Guarda datos y gestiona stale/garbage collection.

FASE 12: Componente renderiza con datos
Archivo: `frontend/src/pages/Withdrawals.tsx` / `WithdrawalDetail.tsx`
Proceso: Mostrar lista de retiros, estado (pendiente/approved/rejected), amount, destination (account), createdAt.

FASE 13: Usuario inicia un nuevo retiro (mutación)
Archivo: `frontend/src/components/withdrawals/CreateWithdrawalModal.tsx` o `frontend/src/pages/Withdrawals.tsx`
Proceso: Form con amount y destino; validación cliente (react-hook-form + zod). Ejecuta `useMutation(() => withdrawalsApi.create(dto))`.

FASE 14: httpClient ejecuta `POST /withdrawals`
Archivo: `frontend/src/api/endpoints/withdrawals.ts` + `api/client.ts`
Proceso: Envía payload `{ amount, destinationAccount }` con token.

FASE 15: Mostrar estado de mutación
Archivo: el componente que llama la mutación
Proceso: `isLoading` en la mutation, feedback al usuario (spinner y disable del botón). En `onSuccess` invalidar keys y cerrar modal.

FASE 16: Invalidación de cache post-mutation
Archivo: `frontend/src/constants/queryKeys.ts` y `lib/queryClient.ts`
Proceso: `queryClient.invalidateQueries(queryKeys.withdrawals.list())` y opcionalmente `invalidateQueries(queryKeys.withdrawals.detail(newId))`.

FASE 17: Token refresh automático (si aplica)
Archivo: `frontend/src/api/client.ts` + `frontend/src/api/endpoints/auth.ts`
Trigger: 401
Proceso: `apiClient` detecta 401, llama `authApi.refreshToken(refreshToken)`, si OK guarda nuevo access token y reintenta la request.

FASE 18: Deduplicación de requests
Archivo: `lib/queryClient.ts`
Escenario: multiples componentes piden la misma lista/detail
Proceso: React Query ejecuta sólo una request y comparte resultado con subscritores.

FASE 19: Mostrar flujo de estados en UI
Archivo: `frontend/src/pages/Withdrawals.tsx`
Proceso: estados visibles: pending, approved, rejected, processing. Mostrar qué acciones puede tomar el owner/admin (approve, reject).

FASE 20: Manejo de errores y feedback
Archivo: `frontend/src/components/ui/Toast.tsx` y `api/client.ts`
Proceso: Mostrar toast con éxito/error; manejar errores 400/422 con mensajes amigables.

Archivos a abrir en la demo (frontend)
- `frontend/src/constants/routes.ts` — muestra la ruta `/withdrawals`.
- `frontend/src/pages/Withdrawals.tsx` — lista y UI.
- `frontend/src/components/withdrawals/CreateWithdrawalModal.tsx` — formulario y validación.
- `frontend/src/hooks/queries/useWithdrawals.ts` — hook de lista/detail.
- `frontend/src/api/endpoints/withdrawals.ts` — funciones `list`, `get`, `create`, `approve`, `reject`.
- `frontend/src/api/client.ts` — interceptor de tokens y reintentos.
- `frontend/src/constants/queryKeys.ts` — keys de cache.

Demo sugerida (pasos rápidos)
1) Abrir la página `Withdrawals` y mostrar lista vacía o con entries.
2) Abrir DevTools → Network.
3) Abrir `CreateWithdrawalModal`, enviar un retiro de ejemplo. Mostrar `POST /withdrawals` en Network.
4) En backend, mostrar logs/endpoint y la creación en DB (en la demo lokal).
5) En frontend, mostrar invalidación y refresco de la lista.

Comandos utiles (PowerShell)

```powershell
cd d:/ColectaYa/frontend
npm run dev

cd d:/ColectaYa
# backend en otra terminal
cd d:/ColectaYa/backend
npm run start:dev
```

Ejemplo curl (crear withdrawal):

```bash
curl -X POST "http://localhost:3000/withdrawals" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50.0, "destinationAccount": "ES123..."}'
```

Notas y recomendaciones
- Nunca muestres/o logees números de cuenta, tokens o correos en consola para la demo pública.
- Valida cliente y servidor: el frontend debe validar montos y formato de cuenta; backend volverá a validar y proteger.
- Para la demo, prepara un caso de error (amount < minimum) para mostrar respuesta 400 y el mensaje.
