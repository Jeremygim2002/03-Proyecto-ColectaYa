## Frontend Dockerfile (Vite + React) - Multi-stage: build + nginx
FROM nginx:alpine


WORKDIR /app

# instalar dependencias
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# copiar el código y construir
COPY frontend/ .
RUN npm run build

FROM nginx:alpine

# Copiar build a la carpeta pública de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: copiar configuración personalizada de nginx si es necesario
# COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
