# TeamTasks Complete

A robust, full-stack task-tracking application built to manage team assignments efficiently. 

## Features
- **Task Management**: Create, toggle, and search tasks.
- **Assignees**: Assign tasks to users dynamically during creation or inline directly from the list.
- **Real-time Filtering**: Filter tasks by status, assignee, and search keywords simultaneously.
- **Containerized Infrastructure**: Production-ready deployment pipeline using Docker and Jenkins.

## Stack

- **server/** — Node + TypeScript + Express + SQLite (better-sqlite3)
- **web/** — React + Vite + TypeScript
- **infra/** — Docker, Nginx, Docker Compose, Jenkinsfile

SQLite is used for lightweight local state. The API runs on port `:3001` and the React frontend on `:5173`.

## Requirements

- Node 18+ and npm
- (Optional) Docker & Docker Compose for production testing

## Local Development Setup

To run the application locally on your machine:

1. Install dependencies and seed the database (run inside `server/` and `web/` directories):
```bash
cd server && npm install && npm run seed
cd ../web && npm install
```

2. Start the development servers simultaneously using the provided bash script at the root:
```bash
./start.sh
```
> The application will be available at `http://localhost:5173`. Press `Ctrl+C` to cleanly stop both servers.

## Production Deployment (Jenkins)

This project contains a production-ready Jenkins pipeline (`infra/Jenkinsfile`).

1. **Architecture**: 
   - Multi-stage Docker build for the frontend (Vite -> Nginx static serving).
   - Node.js Alpine container for the backend API.
   - `docker-compose.yml` to orchestrate them, natively proxying `/api` traffic through Nginx.
2. **Domain Routing**: 
   - The stack exposes port `446`, designed to sit behind an external reverse proxy (like Traefik/Apache) routing `folixxtasks.ibrands.ng` to it.
3. **Execution**:
   - The Jenkins pipeline builds the images, pushes them to `ghcr.io/teamtasks`, SSHs into the production VPS, and executes `docker compose up -d`.
