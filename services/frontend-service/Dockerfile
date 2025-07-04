# Etapa 1: Compilación
FROM node:22 AS builder

WORKDIR /app

ARG VITE_BACKEND_API_URL
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL

# Copiamos solo los archivos necesarios primero para aprovechar el cache de Docker
COPY package*.json ./
RUN npm install

# Luego copiamos el resto del código
COPY . .

# Compilamos la app para producción
RUN npm run build

# Etapa 2: Servidor estático (usamos Nginx)
FROM nginx:alpine

# Copiamos los archivos generados en la etapa de build al directorio que Nginx sirve
COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: Reemplaza el archivo de configuración por uno personalizado si lo necesitas
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto que Nginx usará (por defecto 80)
EXPOSE 80

# Comando por defecto (ya viene con Nginx base)
CMD ["nginx", "-g", "daemon off;"]
