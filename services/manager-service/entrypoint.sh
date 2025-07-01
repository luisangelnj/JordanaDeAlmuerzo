# services/manager-service/entrypoint.sh
#!/bin/sh
set -e

echo "Running production migrations..."
npm run migration:run:prod

echo "Migrations finished successfully. Starting application..."
exec "$@"