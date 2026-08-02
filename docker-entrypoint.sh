#!/bin/sh
set -e
echo "Syncing Prisma schema..."
npx prisma db push
exec "$@"
