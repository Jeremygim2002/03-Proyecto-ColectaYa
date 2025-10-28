## Backend Dockerfile (NestJS + Prisma)
FROM node:22-alpine AS builder


WORKDIR /app

# Instalar dependencias
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el código fuente
COPY backend/ .

# Generar Prisma client (si aplica) y compilar
RUN npx prisma generate || true
RUN npm run build

# Eliminar dependencias de desarrollo para reducir la imagen final
RUN npm prune --production || true

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar artefactos de la etapa de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main"]
