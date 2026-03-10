#!/bin/bash
set -e

echo "Starting FinTrack Personal Finance System..."

# Start PostgreSQL
echo "Starting PostgreSQL..."
docker-compose up -d postgres
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Start Backend
echo "Starting Spring Boot backend..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!
echo "Backend starting on http://localhost:8080 (PID: $BACKEND_PID)"
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 15

# Start Frontend
echo "Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend starting on http://localhost:5173 (PID: $FRONTEND_PID)"
cd ..

echo ""
echo "==============================="
echo "FinTrack is starting up!"
echo "==============================="
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
echo "API Docs: http://localhost:8080/api"
echo ""
echo "Press Ctrl+C to stop all services"

wait
