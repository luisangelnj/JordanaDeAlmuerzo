# Dockerfile para marketplace-service (SIN MIGRACIONES)

# ----- Etapa 1: Builder (Sin cambios) -----
# Compila el código TypeScript a JavaScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# ----- Etapa 2: Production -----
# Crea la imagen final ligera
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Instalamos solo las dependencias de producción
RUN npm install --omit=dev

# Copiamos el código JavaScript compilado
COPY --from=builder /app/dist ./dist

# El comando final es más simple: solo inicia la aplicación con Node.
# No hay un paso previo de migración.
CMD ["node", "dist/index.js"]