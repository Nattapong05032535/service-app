# Start SQL Server
docker-compose up -d db

echo "Waiting for SQL Server to start..."
# Wait for SQL Server (simplified)
Start-Sleep -Seconds 15

# Push schema to DB
pnpm db:push

# Start the app
pnpm dev
