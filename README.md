# HustleHub+ (MERN) - Client / Freelancer login

Full-stack MERN app:

| Layer | Technology |
|---|---|
| Database | Azure Cosmos DB for MongoDB / Azure DocumentDB |
| API | Node.js + Express (JWT authentication, role-based access) |
| Frontend | React (Vite) |
| Containers | Docker + docker-compose |


## Step 1 - Run it - Run the app without docker for testing, at the end we will run with docker

### Option A: Docker (recommended)
Install Docker Desktop, then from the project root:
```
docker compose up --build
```
- App: http://localhost:3000
- API health check: http://localhost:5000/api/health
- Stop: `Ctrl+C`, then `docker compose down`

Look for these lines in the terminal, this will tell you that you are connected to the database successfully:

hustlehub-backend  | [db] Connected to Azure Cosmos DB (MongoDB API), database: hustlehub
hustlehub-backend  | [server] HustleHub+ API listening on port 5000 (production)

### Option B: Without Docker (development)
Use 3 terminals. On Windows, use **Command Prompt** if PowerShell blocks npm scripts. This runs both the backend and frontend.

Terminal 1:
```
(In the path: C:\User\hustlehub-mern\backend)

cd backend
npm install

```
(leave open)

Terminal 2:
```
(In the path: C:\User\hustlehub-mern\frontend)

cd frontend
npm install

```
(leave open)

Terminal 3:
```
(In the path: C:\User\hustlehub-mern)

npm run dev
```

Look for these lines in the terminal, this will tell you that you are connected to the database successfully:

[backend] [db] Connected to Azure Cosmos DB (MongoDB API), database: hustlehub
[backend] [server] HustleHub+ API listening on port 5000 (development)

## Watch this video for the start up of the app:
https://youtu.be/beebRInAWko

## If everything is fine open the app using this port:
http://localhost:3000/

You will see it in the terminal, copy the port in a browser

 
## API
| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register` | public. Body: `name, email, password, role` (`client` or `freelancer`) |
| POST | `/api/auth/login` | public. Body: `email, password, role`. Returns `token` + `user` |
| GET | `/api/auth/me` | any logged-in user (Bearer token) |
| GET | `/api/client/home` | client only |
| GET | `/api/freelancer/home` | freelancer only |
| GET | `/api/health` | public, reports database status |



