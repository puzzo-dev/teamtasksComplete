#!/bin/bash

# Kill all child processes if this script receives SIGINT (Ctrl+C)
trap 'kill 0' SIGINT

echo "🚀 Starting backend server on port 3001..."
cd server && npm run dev &

echo "🚀 Starting frontend server..."
cd web && npm run dev &

echo ""
echo "✅ Both servers are booting up!"
echo "👉 The app will be available at: http://localhost:5173"
echo "🛑 Press Ctrl+C to stop both servers."
echo ""

# Wait indefinitely for background processes
wait
