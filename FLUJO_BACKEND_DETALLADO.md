## Flujo backend detallado (por fases) + módulo ejemplo (Contributions)

Este archivo describe, con el mismo nivel de detalle que tu desglose del frontend, cómo fluye una petición en el backend de ColectaYa. Está pensado para que lo uses en la exposición técnica: paso a paso, archivos concretos y líneas/fragmentos a señalar.

Estructura
- Resumen general
- Fases globales (1..20): desde llegada del HTTP hasta respuesta
- Módulo ejemplo: `contributions` — recorrido completo (controller, dto, service, prisma)
- Archivos y por qué abrirlos en vivo
- Comandos y ejemplos curl para demo
- Preguntas comunes y respuestas técnicas

---

Resumen general

El backend está compuesto por módulos NestJS en `backend/src/`. El flujo típico de una petición HTTP REST es:
1) Entrada a Nest (Express/Fastify)
2) Middlewares, Guards y Interceptors
3) Pipes de validación (DTOs + ValidationPipe)
4) Controller → Service
5) Service → Prisma (DB)
6) Eventos/Jobs/Notificaciones
7) Respuesta al cliente

En cada paso hay puntos de control importantes: autenticación, autorización, validación, manejo de errores, logging y redacción (no volcar PII), y transacciones en la DB.

Fases detalladas (1..20)

FASE 1: Llega la petición HTTP
Archivo: N/A (transport layer — Express/Fastify via Nest)
Ruta ejemplo: `POST /collections/:id/contributions`
Proceso: El servidor HTTP recibe la request, la empaqueta como objeto Request y la pasa al pipeline de Nest.

FASE 2: Middleware y logging inicial
Archivo: `backend/src/main.ts` (o `backend/src/common/middlewares/*` si existen)
Proceso: Middlewares globales (p. ej. helmet, cors, body-parser) ejecutan. Un logger de entrada puede registrar metadata (method, path, timestamp) — evitar body completo si contiene PII.

FASE 3: Guard (Auth) — validar token
Archivo: `backend/src/auth/*` o `backend/src/supabase/supabase-auth.service.ts` y guards en `backend/src/auth/guards/`
Proceso: El Guard extrae el token (Authorization header), lo valida con Supabase o JWT, y agrega `request.user` al contexto. Si falla, retorna 401.

FASE 4: Interceptors (opcional)
Archivo: `backend/src/common/interceptors/*`
Proceso: Se pueden aplicar interceptors para medir tiempo, transformar respuesta, o capturar errores de forma consistente.

FASE 5: ValidationPipe (DTOs)
Archivo: `backend/src/main.ts` donde se registra `app.useGlobalPipes(new ValidationPipe(...))` y DTOs específicos en `backend/src/*/dto/*.ts`
Proceso: Antes de ejecutar el controller method, Nest valida el body/params/query contra el DTO. Si no cumple, responde 400/422 automáticamente. Ejemplo real: `backend/src/contributions/dto/create-contribution.dto.ts`.

FASE 6: Controller - Enrutamiento y parámetros
Archivo: `backend/src/contributions/contributions.controller.ts`
Proceso: El controller recibe parámetros (route params, body, user). Debe ser delgada: validar autorización y delegar la lógica a un service.

FASE 7: Controller - Autorización fina
Archivo: same as above (controller)
Proceso: Validar que el usuario tenga permisos (ej. que pueda contribuir a la colección). Si no, lanzar ForbiddenException (403).

FASE 8: Service - Lógica de negocio
Archivo: `backend/src/contributions/contributions.service.ts`
Proceso: Servicio realiza las validaciones de negocio (colección abierta, límites, reglas de membresía), orquesta transacciones si es necesario y llama a Prisma para persistir.

FASE 9: Service - Transaction / Prisma
Archivo: `backend/src/prisma/prisma.service.ts` y llamadas en `contributions.service.ts`
Proceso: Abrir transacción si hay varias escrituras relacionadas (crear contribution + actualizar estadística). Usar `prisma.$transaction()` para atomicidad.

FASE 10: Prisma - ejecución SQL parametrizado
Archivo: `backend/prisma/schema.prisma` (modelo) y prisma client generado (no en repo): `@prisma/client`
Proceso: Prisma construye la consulta parametrizada y la ejecuta contra Postgres. Prisma evita concatenación insegura y minimiza riesgos de SQL injection.

FASE 11: Service - Post-process y side-effects
Archivo: `contributions.service.ts` (mismo)
Proceso: Tras crear la contribution, actualizar contadores, emitir eventos (EventEmitter) o encolar jobs (por ejemplo, notificación o envío de email). Mantener side effects fuera de la transacción cuando sea adecuado (o usar outbox pattern).

FASE 12: Respuesta del Service
Archivo: `contributions.service.ts` → return createdContribution
Proceso: Service retorna la entidad (o un DTO) al controller.

FASE 13: Controller formatea la respuesta
Archivo: `contributions.controller.ts`
Proceso: Controller puede transformar la entidad en un DTO/response shape y devolver `201 Created` con el body JSON.

FASE 14: Interceptor/Logger final
Archivo: `backend/src/common/interceptors/*` o `main.ts` (logger)
Proceso: Registrar el resultado (status, duration) sin exponer PII; en producción preferir niveles de log y redacción.

FASE 15: Cliente recibe respuesta
Archivo: frontend (fuera de scope aquí) — client HTTP parsea JSON.
Proceso: 201/200 llega al frontend; React Query invalida keys si corresponde.

FASE 16: Notificaciones/Jobs en background
Archivo: `backend/src/jobs/*` o servicios que encolan (p. ej. Redis / BullMQ)
Proceso: Encolar emails, webhooks o resumenes para procesar fuera de la request si son costosos.

FASE 17: Manejo de errores
Archivo: `backend/src/common/filters/*` (Exception Filters) y controllers/services
Proceso: Excepciones se convierten en respuestas HTTP consistentes. Internamente, se loggea stacktrace a nivel seguro (no en consola pública).

FASE 18: Observability
Archivo: opcional `backend/src/instrumentation/*` o configuración APM
Proceso: Exponer métricas y traces para latencia/errores. Útil en la demo para explicar SLOs y alertas.

FASE 19: Seguridad adicional
Archivo: `backend/src/main.ts`, guards y config
Proceso: CORS, helmet, rate-limiting y limitación de payload. Mostrar `ValidationPipe` y `class-validator` DTOs como defensa primaria.

FASE 20: Deploy/migraciones
Archivo: `backend/prisma/migrations/*` y `backend/Dockerfile` (si existe)
Proceso: Migrations en `prisma/migrations`; explicación de cómo se despliegan cambios y se aplica `prisma migrate deploy` en CI/CD.

---

Módulo ejemplo: `contributions` (recorrido completo)

Objetivo: explicar cada archivo y cada paso con el request `POST /collections/:id/contributions`.

1) Archivo: `backend/src/contributions/dto/create-contribution.dto.ts`
  - Contenido (ejemplo real en tu repo):

    import { IsNumber, Min } from 'class-validator';

    export class CreateContributionDto {
      @IsNumber()
      @Min(0.01)
      amount!: number;
    }

  - Qué explicar: Validaciones aplicadas; `ValidationPipe` transforma y valida antes de entrar al controller.

2) Archivo: `backend/src/contributions/contributions.controller.ts`
  - Puntos clave para la demo:
    - Decoradores: `@Post(':id/contributions')`, `@Body()`, `@Param('id')`, `@UseGuards(AuthGuard)`.
    - Firma del método: recepción de `CreateContributionDto` y `collectionId` y `request.user`.
    - Mostrar manejo de excepciones (throw new NotFoundException / ForbiddenException).

3) Archivo: `backend/src/contributions/contributions.service.ts`
  - Puntos clave:
    - Método `create(collectionId: string, dto: CreateContributionDto, userId: string)`.
    - Validaciones de negocio: existe colección, está activa, user es miembro o se le permite aportar.
    - Uso de `prisma.$transaction()` si se actualiza la colección y se inserta contribution.
    - Retorno: objeto contribution o DTO simplificado.

4) Archivo: `backend/src/prisma/prisma.service.ts`
  - Puntos clave:
    - Centralización del cliente Prisma.
    - Configuración de logs y manejo de conexión.
    - Mostrar ejemplo de `this.prisma.contribution.create(...)`.

5) Archivo: `backend/prisma/schema.prisma`
  - Puntos clave:
    - Modelo `Contribution` (fields: id, amount, createdAt, userId, collectionId).
    - Relaciones con `Collection` y `User`.

6) Jobs / Notificaciones
  - Si existe: `backend/src/notifications/*` o `backend/src/invitations/*`.
  - Cómo se encolan notificaciones: ejemplo `notifyOwner(contribution)`.

7) Tests / e2e
  - Mencionar `backend/test/app.e2e-spec.ts` como ejemplo de cómo probar el flujo completo.

Demo paso a paso (qué abrir y en qué orden)

1) En el editor: abre `backend/src/main.ts` y localiza `ValidationPipe` y `app.useGlobalPipes(...)`.
2) Abre `backend/src/contributions/contributions.controller.ts` y pon un breakpoint o añade un `console.log` en el método `create` (solo en dev). Explica dónde entran params y body.
3) Abre `backend/src/contributions/dto/create-contribution.dto.ts` y destaca `@IsNumber()` y `@Min(0.01)`.
4) Abre `backend/src/contributions/contributions.service.ts` y sigue la llamada a Prisma.
5) Abre `backend/src/prisma/prisma.service.ts` y enseña el acceso al cliente.
6) En otra terminal, ejecuta un `curl` para simular la petición (ver ejemplo abajo) y observa el flujo (logs/Network/backend console).

Comandos / ejemplos curl

Ejemplo: crear una contribution (reemplaza host y token):

```bash
curl -X POST "http://localhost:3000/collections/123/contributions" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.5}'
```

Observa en el servidor:
- Entrada en controller
- Validación OK
- Llamada a Prisma
- Respuesta 201 con body JSON

Preguntas técnicas frecuentes y respuestas (para la exposición)

- ¿Cómo se evita la inyección SQL?
  - Prisma genera consultas parametrizadas y las consultas de cliente usan parámetros, no concatenación. Además, los DTOs previenen datos inválidos.

- ¿Dónde se valida la autenticación y autorización?
  - En Guards (`backend/src/auth/guards/*`) y dentro de services (chequeos de permisos de negocio).

- ¿Cómo manejarías operaciones de larga duración (emails, webhooks)?
  - Encolar en background (BullMQ/Redis), usar un worker; mantener la request rápida y retornar 202 si se procesa asíncronamente.

- ¿Qué pasa si una transacción falla a mitad de camino?
  - Usar `prisma.$transaction()` para rollback automático; si hay side-effects externos, usar outbox pattern o compensating actions.

Notas finales y recomendaciones para la exposición

- Ten preparados fragmentos de código en el editor para saltar rápidamente.
- Demuestra la validación fallida intencionadamente (enviar `amount: 0`) para mostrar cómo ValidationPipe responde con 400/422.
- Muestra una llamada con token inválido para enseñar el Guard devolviendo 401.
- Evita loggear datos sensibles; si los necesitas para la demo, usa datos anonymizados o un entorno local.

---

Si quieres, añado ahora:
- Un diagrama mermaid secuencial del flujo `POST /collections/:id/contributions`.
- Fragmentos de código con líneas exactas (p. ej. indicar el número de línea donde está `ValidationPipe` en `main.ts`) — puedo leer los ficheros y anotar líneas concretas.

Dime si añada el diagrama o si quieres que haga la anotación de líneas exactas ahora mismo.
