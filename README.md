# taskflow-microservices

# TaskFlow Microservices

## Architecture
[diagram ya explanation]
- API Gateway (Port 3000) — routes requests to services
- Auth Service (Port 3001) — handles signup/login/JWT
- Note Service (Port 3002) — CRUD for notes, protected by JWT

## How to run
docker-compose up
