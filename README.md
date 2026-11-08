# HustleHub+ — Auth Module (Node.js + Express)


## Setup

1. **Install Node.js**, Confirm installation in CMD:
   ```
   node -v
   npm -v
   ```
2. **Install dependencies:**, In Visual Studio Code terminal run:
   ```
   npm install
   ```

3. **Run the server:**, In Visual Studio Code terminal run:
   ```
   npm run dev
   ```
   or 
   
   (uses nodemon for auto-reload; `npm start` for a plain run)


4. **Configure the local HTTPS certificate:**

   The application is configured to run over HTTPS using a locally generated development certificate.
   Follow the **Local HTTPS certificate setup** section below before starting the server.

5. **Confirm that server is running:**
   ```
   https://localhost:5000/api/health
   ```

   This should return a response similar to:
   ```json
   {"success":true,"storageMode":"file"}
   ```

   > Because this is a local self-signed certificate, your browser may initially display a certificate warning until the certificate is trusted on your Windows machine.

6. **Creating new users:**

   1. install the Thunder client extension.
   2. change the method to POST, enter this url for registering a new user: https://localhost:5000/api/auth/register
   3. Enter this under the Body tab, and in the body tab under JSON tab, enter this to enter a new user in the memeory: {"email": "testuser@example.com", "password": "StrongPass1"}
   4. A status will show that the user has been successfully stored in the system.

7. **Login existing users::**

   1. In Thunder client extension, change the url to: https://localhost:5000/api/auth/login
   2. Keep the method POST and stay in the Body tab, and JSON tab in BODy Tab.
   3. Enter this in the JSON tab to view if the user regitered can login successfully using their credentials: {"email": "testuser@example.com", "password": "StrongPass1"}
   4.  A status will show that they logged in successfully.

8. **To stop server runnng:**, In Visual Studio Code terminal run:

   Click (Crtl + C) twice 



## Local HTTPS certificate setup (Windows)

The server must be accessed over HTTPS. For local development, create a self-signed certificate for `localhost` using PowerShell.

### 1. Create the certificate

Open **PowerShell as your normal Windows user** and run:

```powershell
$cert = New-SelfSignedCertificate `
  -DnsName "localhost" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -KeyExportPolicy Exportable `
  -FriendlyName "HustleHub+ Local HTTPS"

$password = ConvertTo-SecureString -String "hustlehub-dev" -Force -AsPlainText

New-Item -ItemType Directory -Force -Path .\certs | Out-Null

Export-PfxCertificate `
  -Cert $cert `
  -FilePath .\certs\localhost.pfx `
  -Password $password
```

### 2. Export the certificate and private key as PEM files

Node.js can use the certificate and private key directly as PEM files. If your Windows installation does not have OpenSSL available, install **Git for Windows**, then open **Git Bash** in the project folder and run:

```bash
openssl pkcs12 -in certs/localhost.pfx -nocerts -nodes -out certs/localhost-key.pem -passin pass:hustlehub-dev
openssl pkcs12 -in certs/localhost.pfx -clcerts -nokeys -out certs/localhost-cert.pem -passin pass:hustlehub-dev
```

The resulting files should be:

```text
certs/
├── localhost-cert.pem
├── localhost-key.pem
└── localhost.pfx
```

The `.gitignore` excludes these certificate files so private key material is not accidentally committed to Git.

### 3. Trust the certificate in Windows

Open `certmgr.msc`, find **HustleHub+ Local HTTPS** under **Personal > Certificates**, copy it, and paste it into **Trusted Root Certification Authorities > Certificates** for your current user.

Alternatively, for a development-only certificate, Windows may allow you to trust it through the browser's certificate warning.

### 4. Start the server

```bash
npm.cmd run dev
```

The terminal should show something similar to:

```text
HustleHub+ auth service listening at https://localhost:5000
```

Then test:

```text
https://localhost:5000/api/health
```

The terminal should no longer show an HTTP listener; it should report the HTTPS URL.

## Tests
```
npm test
```
Runs Jest + Supertest against the auth endpoints in memory mode. These are
a starting point your team can extend for the CI/CD pipeline's automated
backend/API testing requirement.

## Security measures implemented here
- Passwords hashed with bcrypt (never stored or logged in plaintext)
- JWT-based session tokens, expiring, secret loaded from env
- express-validator input validation & sanitisation on all auth fields
- Rate limiting on auth routes (brute-force mitigation)
- Helmet (secure HTTP headers) + configured CORS
- Generic error messages on login/registration failure (no user enumeration)
- Central error handler (no stack traces leaked to clients)
- Structured logging of registration/login events (winston) — never logs
  passwords or full tokens


## Sector 2 — Secure Authentication

Sector 2 requires two security controls:

1. Passwords must never be stored as plaintext. HustleHub+ hashes passwords with bcrypt before they are stored. The login process compares the submitted password with the stored bcrypt hash.
2. JWT must be used to authenticate subsequent requests. After successful login, the API returns a signed JWT. Protected endpoints require an `Authorization: Bearer <token>` header and validate the JWT before allowing access.

### Demonstrating the protected endpoint

1. Register a user with `POST /api/auth/register`.
2. Login with `POST /api/auth/login` and copy the returned `token`.
3. Send `GET /api/auth/me` with the header:
   `Authorization: Bearer YOUR_TOKEN_HERE`
4. The request should return HTTP 200 and the authenticated user's id, email and role.
5. Repeat the request without the header. It should return HTTP 401.
6. Repeat with an invalid or expired token. It should return HTTP 401.

### Password security

The stored user object contains a bcrypt password hash rather than the original password. Passwords and full JWTs are not written to application logs.

### Automated Sector 2 tests

Run:

```bash
npm test
```

The test suite verifies registration/login, password validation, JWT generation, access to the protected `/api/auth/me` endpoint with a valid JWT, rejection without a token, and rejection of an invalid JWT.
