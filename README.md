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

## Look for these lines in the terminal, this will tell you that you are connected to the database successfully:

hustlehub-backend  | [db] Connected to Azure Cosmos DB (MongoDB API), database: hustlehub
hustlehub-backend  | [server] HustleHub+ API listening on port 5000 (production)

### Option B: Without Docker (development)
Use one terminals. On Windows, use **Command Prompt** if PowerShell blocks npm scripts.

Terminal 1:
```
(In the path: C:\User\hustlehub-mern)

npm install
npm run dev
```
## Look for these lines in the terminal, this will tell you that you are connected to the database successfully:

[backend] [db] Connected to Azure Cosmos DB (MongoDB API), database: hustlehub
[backend] [server] HustleHub+ API listening on port 5000 (development)

## If you don't see those lines then you have to add you PC IP address to Azure for the app to work:
Add your IP in the Azure portal:

1. Open your hustlehub-dev cluster in Azure.
2. Go to Settings → Networking.
3. Make sure public access is enabled.
4. Click Add current client IP address (it fills in your IP), then Save.
Wait about a minute for it to apply.

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



