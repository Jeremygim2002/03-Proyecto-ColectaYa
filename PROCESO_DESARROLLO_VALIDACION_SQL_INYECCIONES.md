# Proceso de desarrollo, validación y protección contra inyecciones (ColectaYa)

Este documento explica exactamente dónde en el código están las piezas de validación, por qué funcionan así y cómo intervienen en el proyecto los siguientes puntos:

- Etapas de desarrollo
- Configuración del entorno
- Desarrollo de módulos
- Integración y pruebas
  - Integración de funcionalidades clave
  - Seguridad y validación de datos
    - Validación en frontend y backend
    - Sanitización de entradas
    - Protección contra inyecciones SQL

He referenciado los archivos concretos del repositorio para que sepas dónde tocar si quieres mejorar o auditar la seguridad.

---

## Resumen ejecutable

- Validación backend: NestJS + class-validator + ValidationPipe (global). Archivo principal: `backend/src/main.ts`. DTOs validados: `backend/src/**/dto/*.ts` (ej.: `backend/src/collections/dto/create-collection.dto.ts`, `backend/src/contributions/dto/create-contribution.dto.ts`).
- Validación frontend: `zod` + `react-hook-form` con `zodResolver`. Ejemplo: `frontend/src/pages/Profile.tsx`.
- Sanitización y protección SQL: Prisma Client (parametrizado) maneja queries seguros cuando se usan los métodos `prisma.model.create/update/find...`. Evitar interpolar valores en `$queryRaw` o usar bindings. Código relevante: `backend/src/prisma/prisma.service.ts`.
- Hardening HTTP: CORS y helmet configurados en `backend/src/main.ts`.
- Tests e integración: tests e2e en `backend/test/app.e2e-spec.ts`; usar `supertest` con Nest testing utilities.

---

## 1) Etapas de desarrollo (cómo y dónde se implementan)

Las etapas típicas en este proyecto y dónde se reflejan en el código:

1. Planificación / Diseño
   - Artefactos: `DISEÑO_SISTEMA_Fase_Elaboracion_Construccion.md`, `DICCIONARIO_DATOS.md` (en la raíz del repo). Aquí defines modelos, endpoints y contratos.

2. Configuración del entorno
   - Backend: `backend/.env` (ejemplo en README o `.env.example`), `backend/package.json` (scripts), `backend/tsconfig.json`.
   - Frontend: `frontend/.env`, `frontend/package.json`, Vite config `frontend/vite.config.ts`.
   - Código que aplica la configuración en runtime:
     - `backend/src/main.ts`: lee `process.env` para CORS, puerto, etc.
     - `backend/src/prisma/prisma.service.ts`: configura Prisma según `NODE_ENV`.

3. Desarrollo de módulos
   - Backend: cada dominio está encapsulado en su módulo Nest (p.ej. `backend/src/collections`, `backend/src/contributions`, `backend/src/members`). Cada módulo expone controladores, servicios y DTOs.
     - DTOs (`backend/src/**/dto/*.ts`) usan `class-validator` para reglas (tipos, min/max, formato URL, email, fecha, enums). Ejemplo: `CreateCollectionDto`.
   - Frontend: componentes y páginas en `frontend/src/components` y `frontend/src/pages`. Formularios usan `react-hook-form + zod` para validar en cliente (ejemplo: `frontend/src/pages/Profile.tsx`).

4. Integración y pruebas
   - Tests e2e: `backend/test/app.e2e-spec.ts` usa `@nestjs/testing` + `supertest`.
   - Integración local: `docker-compose.yml` y Dockerfiles (en la raíz y carpetas `backend`/`frontend`) preparan entornos con Postgres para pruebas de integración.

---

## 2) Configuración del entorno — dónde y por qué

- `backend/src/main.ts` (líneas clave):
  - Habilita CORS con whitelist (evita que sitios no autorizados llamen la API).
  - Aplica `helmet()` (cabeceras de seguridad) y `compression()`.
  - Registra interceptores globales (`LoggingInterceptor`, `ResponseInterceptor`).
  - Aplica `ValidationPipe` global con opciones:
    - `whitelist: true` elimina propiedades extra del body que no están en el DTO.
    - `forbidNonWhitelisted: true` lanza error si vienen props no permitidas (recomendado para APIs públicas).
    - `transform: true` convierte tipos basados en los tipos de los DTOs (p.ej. strings a numbers si el DTO lo requiere).

  Por qué funciona: NestJS aplica las reglas definidas en los DTOs (decoradores de `class-validator`) en cada request entrante. Esto centraliza la validación y evita duplicación.

- `backend/src/prisma/prisma.service.ts`:
  - Conecta a BD con Prisma Client y configura logs según `NODE_ENV`.
  - Usa `$queryRaw` en `healthCheck()` **sin interpolación de usuario** (en este caso `SELECT 1`), lo cual es seguro.

  Por qué importa: Prisma Client, cuando se usa con sus métodos estándar (`create`, `findUnique`, `update`, etc.), genera consultas parametrizadas y evita inyecciones SQL. Solo hay que tener cuidado con `$queryRaw` y no interpolar variables directamente.

---

## 3) Desarrollo de módulos — validaciones por módulo y archivos clave

- Collections
  - DTO: `backend/src/collections/dto/create-collection.dto.ts` (usa `@IsString()`, `@IsUrl()`, `@IsNumber()`, `@Min()` y `@IsEnum()`)
  - Servicio / Controller: `backend/src/collections/*` (aquí se aplica la lógica de negocio y se llama a Prisma para persistir datos).

- Contributions
  - DTO: `backend/src/contributions/dto/create-contribution.dto.ts` (`@IsNumber()`, `@Min(0.01)`)
  - Servicio: valida pagos simulados y actualiza colecciones.

- Auth & Users
  - Supabase integra el flujo de login; backend sincroniza usuario con Prisma en `backend/src/supabase/supabase-auth.service.ts`.

En todos los casos, la contract-first (DTOs) hace que el `ValidationPipe` del `main.ts` valide las entradas antes de que la lógica de negocio se ejecute.

---

## 4) Integración y pruebas (qué archivos y cómo probar)

- Tests de ejemplo (e2e): `backend/test/app.e2e-spec.ts` — arranca el módulo y hace peticiones reales contra el servidor en memoria.
- Flujo local de integración:
  1. Levantar base de datos (Docker compose) — `docker-compose up db` o `docker-compose up` si está todo configurado.
  2. Ejecutar `npm run start:dev` (backend) y `npm run dev` (frontend) para desarrollo.
  3. Ejecutar tests: en backend normalmente `npm run test` o `npm run test:e2e` (ver `backend/package.json`).

Integración de funcionalidades clave:
- Cuando una contribución se crea (`contributions.service`), el backend actualiza la tabla `Contribution` y puede invalidar o actualizar estadísticas de la `Collection` (esto ocurre en el servicio de contribuciones). React Query en frontend (`useContributions`, `useCollection`) se encarga de refetch/invalidate para mostrar datos actualizados.

---

## 5) Seguridad y validación de datos

### 5.1 Validación en frontend

- Librerías: `zod` + `react-hook-form` (`zodResolver`). Ejemplo práctico: `frontend/src/pages/Profile.tsx`.
  - Dónde: en cada formulario con `useForm({ resolver: zodResolver(schema) })`.
  - Por qué: evita que se envíen datos mal formados desde el cliente y proporciona retroalimentación inmediata al usuario.

### 5.2 Validación en backend

- Librerías y componentes:
  - `class-validator` + `class-transformer` se usan vía DTOs.
  - `ValidationPipe` (global) en `backend/src/main.ts` aplica las reglas.

- Qué hace exactamente:
  - Tipo-check (ej.: amount debe ser número y >= 0.01)
  - Formatos (ej.: `@IsUrl()`, `@IsDateString()`)
  - Whitelisting: elimina campos extra o lanza error (según la configuración)

### 5.3 Sanitización de entradas

- Estado actual: el código hace validación de tipos y formatos, pero no hay un paso explícito y centralizado de "sanitización" (p. ej. normalizar strings, eliminar etiquetas HTML). Algunas recomendaciones:
  1. Sanitizar entradas que vayan a almacenarse o que puedan reenviarse en HTML (mensajes, descripciones). Usa una librería pequeña como `sanitize-html` o `dompurify` (para SSR o server-side sanitization usa `sanitize-html`).
  2. Siempre validar y luego sanitizar: primero falla rápido si el formato no es correcto, luego aplica sanitización para neutralizar HTML/JS en texto libre.

Ejemplo donde aplicar sanitización:
- `CreateCollectionDto.description` — antes de guardar en DB, pasar por `sanitizeHtml(description)` si permites HTML limitado.
- `Contribute message` (si existe): sanitizar antes de persistir.

### 5.4 Protección contra inyecciones SQL

- Prisma Client (uso recomendado):
  - Métodos como `prisma.collection.create(...)`, `prisma.contribution.create(...)` generan consultas parametrizadas; son seguros contra SQL injection.
  - Archivo clave: `backend/src/prisma/prisma.service.ts` (instancia de Prisma configurada con pooling y control de logs).

- Peligros a evitar:
  - No interpolar directamente variables de usuario en `$queryRaw` ES6 template strings. Ejemplo peligroso:

    // Mal — vulnerable si `userInput` proviene del cliente
    await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;

  - En su lugar usar bindings o usar los métodos del cliente:

    // Bueno — Prisma parametriza correctamente
    await prisma.user.findUnique({ where: { email: userInput } });

  - Si necesitas usar `$queryRaw` con valores, usa la sintaxis de bindings que Prisma provee (p. ej. `prisma.$queryRaw(Prisma.sql`...`)`) o una API que no concatene strings.

---

## 6) Recomendaciones concretas (pasos de mejora rápidos)

1. Frontend: seguir validando con `zod` y además sanitizar campos de texto libre con `dompurify` en el cliente o con `sanitize-html` en servidor antes de persistir.
2. Backend: revisar todos los usos de `$queryRaw` en el repo y reemplazar interpolaciones por queries parametrizadas.
3. Logs: evitar `console.log` de datos sensibles (montos, emails, tokens). Usar logger de Nest (`Logger`) con niveles y redacción en producción.
4. Tests: añadir pruebas de seguridad básicas — pruebas que intenten inyectar payloads en formularios y validar que la API rechaza o neutraliza el payload.
5. Integración continua: añadir un job que ejecute `npm run lint && npm run test` y que bloquee merges si las pruebas fallan.

---

## 7) Referencias directas (archivos en repo)

- `backend/src/main.ts` — configuración global, CORS, helmet, ValidationPipe.
- `backend/src/prisma/prisma.service.ts` — instancia de Prisma, healthCheck y manejo de conexiones.
- `backend/src/collections/dto/create-collection.dto.ts` — ejemplo de DTO con `class-validator`.
- `backend/src/contributions/dto/create-contribution.dto.ts` — DTO de contribución.
- `backend/src/supabase/supabase-auth.service.ts` — flujo de sincronización de usuario (cuidado con logging de tokens/PII).
- `backend/test/app.e2e-spec.ts` — ejemplo e2e.
- `frontend/src/pages/Profile.tsx` — ejemplo de `react-hook-form` + `zod`.
- `frontend/src/hooks/queries/*` — lógica de fetch/invalidate (React Query) para mantener datos sincronizados tras acciones.

---

Si quieres, aplico cambios automáticos para:
- envolver logs sensibles en checks de entorno (dev-only),
- o bien eliminar logs que exponen PII y montos,
- o añadir un ejemplo de sanitización en `contributions.service` o en el controller donde se reciben `description`/`message`.

Dime qué prefieres y lo aplico: (A) quitar logs sensibles, (B) dejar logs sólo en dev, (C) añadir sanitización mínima y un test que lo cubra.
