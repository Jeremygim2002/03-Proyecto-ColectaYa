# ColectaYa

Demo: https://03-proyecto-colecta-ya.vercel.app/

## Descripción

ColectaYa es una plataforma para crear y administrar colectas/campañas colaborativas. Permite a organizadores crear colectas con metas, invitar participantes, recibir contribuciones y gestionar retiros. El backend está desarrollado en NestJS con Prisma + PostgreSQL; el frontend usa React + Vite y componentes basados en Radix/Shadcn.

## Stack tecnológico

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, @radix-ui (shadcn components), TanStack React Query, react-hook-form + zod
- Backend: Node.js, TypeScript, NestJS v11, Prisma (PostgreSQL client)
- Base de datos: PostgreSQL (Postgres 15 en docker-compose)
- Autenticación: Supabase (Auth)
- Infra / Dev: Docker, Docker Compose, ESLint, Prettier, Jest

## Instalación y ejecución (local)

Requisitos previos:
- Node.js 20+ y npm
- Docker & Docker Compose (recomendado para levantar la DB y ejecutar todo en conjunto)

1) Clonar el repositorio

```bash
git clone https://github.com/Jeremygim2002/technicalTestFractal.git
cd 03-Proyecto-ColectaYa
```

2) Levantar con Docker Compose (forma recomendada)

```bash
# Construye y levanta DB, backend y frontend
docker compose up --build
```

3) Alternativa sin Docker (desarrollo separado)

Backend:
```bash
cd backend
npm install
cp .env.example .env
# Edita .env según tu entorno (DATABASE_URL, SUPABASE vars, etc.)
npm run start:dev
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env
# Edita .env si es necesario (VITE_API_BASE_URL)
npm run dev
```

## Variables de entorno (usar `.env.example` como referencia)

Backend (`backend/.env.example`):

```bash
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/colectaya_db"

# JWT Secret (si aplica)
JWT_SECRET="tu-super-secreto-jwt-muy-seguro-256-bits"
JWT_EXPIRES_IN="7d"

# Configuración del servidor
PORT=3000
NODE_ENV="development"

# Frontend URL
FRONTEND_URL="http://localhost:3001"

# Rate limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

Frontend (`frontend/.env.example`):

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ColectaYa
VITE_APP_ENVIRONMENT=development
```

Nota: copia cada `.env.example` a `.env` en cada carpeta (`backend` y `frontend`) y rellena los valores antes de ejecutar sin Docker.

## Cómo ejecutar la aplicación completa

- Recomendada (Docker): `docker compose up --build` desde la raíz levantará Postgres, backend y frontend. Backend escucha en el puerto 3000 del contenedor y se mapea al host en el `docker-compose.yml` (host:container -> 4000:3000 para backend según configuración); frontend se sirve vía nginx en el contenedor (mapeado normalmente a host:3000).
- Sin Docker: ejecutar backend y frontend por separado (ver comandos arriba). Asegúrate de que `VITE_API_BASE_URL` apunte al backend correcto.

## Estructura del proyecto (resumen)

```
03-Proyecto-ColectaYa/
├─ backend/                # NestJS backend (controllers, services, DTOs, Prisma)
│  ├─ src/
│  │  ├─ auth/
│  │  ├─ collections/
│  │  ├─ contributions/
│  │  ├─ invitations/
│  │  ├─ members/
│  │  ├─ withdrawals/
│  │  ├─ prisma/
│  │  └─ main.ts
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ package.json
│  └─ .env.example
├─ frontend/               # React + Vite frontend
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  └─ api/
│  ├─ package.json
│  └─ .env.example
├─ docker-compose.yml
└─ README.md
```

---
