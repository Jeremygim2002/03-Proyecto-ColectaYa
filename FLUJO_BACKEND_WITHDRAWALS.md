## Flujo backend detallado: Withdrawals (retiros) — paso a paso para la exposición

Este documento explica el flujo backend para el módulo `withdrawals` y sirve como material para tu exposición técnica: fases del request, archivos a abrir, DTOs, transacciones y recomendaciones de demo.

FASES generales (resumen rápido)
- 1) Request HTTP llega → Nest transport
- 2) Middlewares globales (helmet, cors)
- 3) Guard/Auth valida token
- 4) ValidationPipe valida DTOs
- 5) Controller delega a Service
- 6) Service usa Prisma (posible transacción)
- 7) Service retorna y Controller devuelve response

FASE 1: Entrada HTTP
Ruta ejemplo: `POST /withdrawals` (crear retiro) o `GET /withdrawals` (listar)
Archivo: transporte Nest (Express/Fastify) configurado en `backend/src/main.ts`

FASE 2: Middlewares y pre-checks
Archivo: `backend/src/main.ts` y `backend/src/common/middlewares/*`
Proceso: CORS, helmet, rate-limiter y body-parser. Registrar metadata de request sin exponer body sensible.

FASE 3: Guard (Auth) — validar token y permisos
Archivo: `backend/src/auth/guards/*` y `backend/src/supabase/supabase-auth.service.ts`
Proceso: Asegurar que solo usuarios autenticados (y en ciertos endpoints, admins/owners) puedan crear o aprobar retiros.

FASE 4: ValidationPipe y DTOs
Archivo: `backend/src/withdrawals/dto/create-withdrawal.dto.ts` (o nombre equivalente)
Proceso: Validar campos (amount, destinationAccount, note). Rechazar if amount <= 0 or invalid account format.

Ejemplo de DTO (sugerencia - adapta si tu archivo existe):

```ts
import { IsNumber, Min, IsString, Length } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @Length(6, 64)
  destinationAccount!: string;

  @IsString()
  note?: string;
}
```

FASE 5: Controller
Archivo: `backend/src/withdrawals/withdrawals.controller.ts`
Puntos a mostrar: `@Post() create(@Body() dto: CreateWithdrawalDto, @Req() req)` — extraer `user` del request y delegar a `withdrawalsService.create(user.id, dto)`.

FASE 6: Service - lógica de negocio
Archivo: `backend/src/withdrawals/withdrawals.service.ts`
Proceso:
- Verificar saldo disponible del usuario (o fondos en la colecta si aplica)
- Validar límites (min/max, frecuencia)
- Crear registro `Withdrawal` en DB con estado `pending`
- Encolar job de pago o notificación si es necesario

FASE 7: Transacción y Prisma
Archivo: `backend/src/prisma/prisma.service.ts` y `withdrawals.service.ts`
Proceso: Si se hace débito de algún ledger, usar `prisma.$transaction()` para crear withdrawal y actualizar balance de account o collection atomically.

FASE 8: Post-process / side-effects
Archivo: `backend/src/notifications/*` o jobs
Proceso: Enviar email al usuario y notificar al admin; iniciar worker para el proceso de pago.

FASE 9: Aprobación manual (owner/admin)
Endpoint: `PATCH /withdrawals/:id/approve` o `POST /withdrawals/:id/approve`
Archivo: `withdrawals.controller.ts` y `withdrawals.service.ts`
Proceso: Guard que verifique role; service que cambie estado a `approved` y dispare payout.

FASE 10: Manejo de errores y compensaciones
Archivo: `backend/src/common/filters/*` y `withdrawals.service.ts`
Proceso: Si el payout falla, marcar withdrawal `failed` y encolar retries o disputa/manual review.

Archivos a abrir en la demo (backend)
- `backend/src/main.ts` — ValidationPipe y middlewares
- `backend/src/withdrawals/withdrawals.controller.ts` — endpoints: create, list, approve, reject
- `backend/src/withdrawals/dto/create-withdrawal.dto.ts` — validaciones
- `backend/src/withdrawals/withdrawals.service.ts` — lógica y transacciones
- `backend/src/prisma/prisma.service.ts` — prisma client y uso de `$transaction`
- `backend/prisma/schema.prisma` — modelo `Withdrawal` y relaciones
- `backend/test/app.e2e-spec.ts` — pruebas end-to-end que cubran el flujo si existen

Demo paso a paso (backend)
1) Abrir `backend/src/main.ts` y mostrar `ValidationPipe`.
2) Abrir `withdrawals.controller.ts` y poner breakpoint en `create`.
3) Abrir `create-withdrawal.dto.ts` y explicar validaciones.
4) Abrir `withdrawals.service.ts` y mostrar el uso de `prisma.$transaction()` (si aplica) y la creación del withdrawal con estado `pending`.
5) Ejecutar el `curl` de ejemplo y observar logs/DB.

Ejemplo curl (crear withdrawal):

```bash
curl -X POST "http://localhost:3000/withdrawals" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 75.0, "destinationAccount": "ES12..."}'
```

Ejemplo curl (approve by admin):

```bash
curl -X POST "http://localhost:3000/withdrawals/789/approve" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

Consideraciones de seguridad y diseño
- Nunca loggear números de cuenta o tokens en producción.
- Validar doblemente: frontend y backend.
- Usar transactions para mantener consistencia entre balances y withdrawals.
- En production, externalizar pagos a un gateway y diseñar retrys/compensations.

Preguntas frecuentes y respuestas
- ¿Cómo evitar doble pago en retiros?
  - Diseñar idempotencia en el service (chequear estado antes de ejecutar payout) y usar locks/transactions.
- ¿Cómo auditar retiros?
  - Guardar un histórico con `performedBy`, `performedAt`, `status` y `notes`. Añadir endpoints/exports para auditoría.

---

¿Quieres que lea los archivos reales en `backend/src/withdrawals` y anote números de línea concretos para que sólo los abras en la demo? Puedo hacerlo ahora y actualizar este MD con referencias de línea.
