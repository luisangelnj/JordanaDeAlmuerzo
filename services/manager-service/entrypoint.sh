#!/bin/sh
# El script se detendrá si cualquier comando falla
set -e

# --- INICIO DE LA LÓGICA DE PARSEO ---
# Revisa si la variable DATABASE_URL existe
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL found. Parsing connection string..."
  
  # Formato esperado: postgres://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE_DE_DATOS
  DB_USERNAME=$(echo $DATABASE_URL | sed -e 's/postgres:\/\/\([^:]*\):.*/\1/')
  DB_PASSWORD=$(echo $DATABASE_URL | sed -e 's/postgres:\/\/.*:\([^@]*\)@.*/\1/')
  DB_HOST=$(echo $DATABASE_URL | sed -e 's/postgres:\/\/.*@\([^:]*\):.*/\1/')
  DB_PORT=$(echo $DATABASE_URL | sed -e 's/postgres:\/\/.*:\([0-9]*\)\/.*/\1/')
  DB_DATABASE=$(echo $DATABASE_URL | sed -e 's/postgres:\/\/.*\/\([^?]*\).*/\1/')
  
  export DB_USERNAME DB_PASSWORD DB_HOST DB_PORT DB_DATABASE
fi

echo "Running production migrations..."
npm run migration:run:prod

echo "Migrations finished successfully. Starting application..."
# Ejecuta el comando principal pasado desde el Dockerfile (CMD)
exec "$@"