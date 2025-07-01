#!/bin/sh
# El script se detendrá si cualquier comando falla
set -e

echo "Running production migrations..."
npm run migration:run:prod

echo "Migrations finished successfully. Starting application..."
# Ejecuta el comando principal pasado desde el Dockerfile (CMD)
exec "$@"