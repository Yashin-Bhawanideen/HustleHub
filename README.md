# Emeris | INSY7314 POE

# Members
- ST10444715	Keegan Ewan Tromp
- ST10434249	Richard Hein
- ST10443463	Yashin Bhawanideen
- ST10443090	Amir Muller
- ST10450208	Mishal Bhikha

# Important Links: 

- Explanation of application: 

# HustleHub+
## About the Program
HustleHub+ is an online marketplace for independent contractors. Clients peruse the gigs offered by freelancers and reserve them for a specific date. After that, each booking is either accepted or rejected by the freelancer. Additionally, each user receives reminders about events that impact them, and freelancers receive a tax summary that calculates their income and income tax from their approved reservations. There is no processing of actual payments. The amount of gigs in approved bookings is what generates revenue.
The MERN stack serves as the foundation for the application. React 18 is used in the frontend together with Vite and React Router. Express API and Node.js make up the backend. Data is hosted on Azure DocumentDB (Azure Cosmos DB for MongoDB), stored in MongoDB, and accessible via Mongoose. JSON Web Tokens (JWT) are used for login, and Docker containers are used for both the frontend and backend.

## Users and what they can do
When creating an account, each user choose a role: freelancer or client. The user's access to certain sites and API routes is determined by the role. The present version does not have an admin role.

- Client: Freelancers are employed by a client. On the My Bookings tab, a client can view the status of their bookings (pending, approved, or refused), explore all gigs, book a gig by selecting a date (previous dates cannot be chosen), read and manage notifications, and log out.

- Freelancer: A freelancer provides services. A freelancer can check and accept or reject pending booking requests, create, update, and remove their own gigs, access the Tax Summary page, read and manage notifications, and log out.

## Pages
The login and registration page is at /. Clients use /client for the available gigs and /client/bookings for their bookings. Freelancers use /freelancer for their gigs, /freelancer/bookings for incoming bookings and /freelancer/tax for the tax summary. A logged-in user who opens a page for the other role is sent back to their own home page.

## Setup and running
- Requirements: You need Node.js 24 and npm, an Azure DocumentDB cluster, and Docker Desktop if you want to run the app in containers.
- install packages: Launch a terminal in the project root, which is the folder that houses frontend, backend, and docker-compose.yml. Use Command Prompt on Windows, as npm scripts may be blocked by PowerShell.
- cd backend
- npm install
- npm run dev
- cd frontend
- npm install
- npm run dev

The utility that launches the frontend and backend simultaneously is added by the root install. The other two install the packages specific to each application.

## Create the settings file
Copy the template to backend/.env. The file must be named exactly .env and saved as UTF-8.
- copy backend\.env.example backend\.env
Next, enter the values. The connection string from the preceding step is MONGODB_URI. The default hustlehub database name, DB_NAME, was generated automatically during the initial registration. The secret that signs login tokens is called JWT_SECRET, and it needs to be at least 32 characters long. Create one with node -e "console.log(require('crypto')."randomBytes(48).toString('hex'));The " The duration of a token is indicated by JWT_EXPIRES_IN (default 1h). The password hashing strength is set by BCRYPT_SALT_ROUNDS (default 12). CLIENT_ORIGIN is the frontend address that can call the API (default http://localhost:3000), NODE_ENV is development or production, and PORT is the API port (default 5000). The backend checks these settings at startup and refuses to run, with a clear message, if a required one is missing.

## Run the development
From the project root, run:
- npm run dev
This initiates the frontend and backend simultaneously. [db] Connected to Azure Cosmos DB and [server] HustleHub+ API listening on port 5000 should be printed by the backend. Go to http://localhost:3000. Requests from the frontend are sent to /api and then forwarded to the backend by the development server. The API is available at http://localhost:5000/api/health.

## Run with docker
Start Docker Desktop, make sure backend/.env exists, and stop any development servers so ports 3000 and 5000 are free. Then run:
- docker compose up --build
Go to http://localhost:3000. Use Ctrl+C to stop, then use Docker compose down. Because the values are only read when the containers are formed, run docker compose down and restart after making changes to .env.

# Features
## Regitration and login
A user selects a role on this page before logging in or creating an account. A hashed password is saved by the server when the user enters their name, email address, and password twice during registration. A JWT is returned by the server after logging in using the email address, password, and selected role. After storing it, the frontend directs the user to the client or freelancer's home page. The user is informed which role to choose if the password is correct but the selected role does not correspond with the account. Each type of user travels directly to their particular region because the role is predetermined.

## Role based pages
Every role can only utilise its own API routes and can only view its own pages. The ProtectedRoute component on the front end directs users with the incorrect role to their own home page and logged-out visitors to the login page. Route groups execute authenticate and then authorizeRoles on the backend. Only freelancers are permitted to use the gig and tax methods, and only clients are permitted to create a booking. The two roles are kept apart on the server and not just in the interface because they have different tasks and data.

## Gig management
A freelancer has the ability to add, modify, and remove their own gigs. A gig's name, title, description (up to 2000 characters), and rand amount are all included. The dashboard provides a form for creating or modifying and displays the gigs as cards. The read, edit, and delete routes only match gigs that belong to the freelancer who is now logged in, and each gig saves the owner's ID.

## Browsing gigs and booking
Each gig is included on the customer home page along with the freelancer's name. Submitting sends the request to POST /api/bookings, and selecting Booking opens a date picker that blocks previous dates. The server verifies that the gig exists, that the client is not scheduling their own gig, and that the date is a real date in the format YYYY-MM-DD. After then, the booking is saved as Pending, giving the freelancer the last word.

## Booking management
A reservation is either accepted, rejected, or pending. Each request, together with the client, date, price, and status, is displayed on the freelancer's Incoming Bookings page. Pending requests have Accept and Reject buttons. A reservation cannot be processed twice because the server only modifies reservations that are still pending and belong to that freelancer. The current status is displayed on the client's My Bookings page. Every choice generates an activity log item and a notification.

## Tax estimation
For the current South African tax year, which runs from March 1 to February 31, each freelancer receives an estimate of their revenue and income tax. The predicted annual revenue, the estimated annual tax with its bracket rate, the expected net annual income, a monthly income bar chart, and a brief explanation of the computation are all displayed on the Tax Summary page. The numbers are not tax returns; rather, they are estimates to assist independent contractors in making plans.

## How accepted bookings become income
Only reservations that are accepted are taken into account. Rejected and pending ones are disregarded. A booking's value is the gig amount, and it counts toward the month of the booking date (the date the customer selected, not the day it was accepted). This implies that a gig's later pricing adjustment affects the numbers, while a booking whose gig was removed is excluded. Only reservations made within the tax year are taken into account. Nothing about taxes is kept on file. Every time the page loads, the server recalculates everything, resulting in a newly accepted booking.

## Monthly totals and projection
The gig amounts of the approved reservations for every calendar month are totalled by the database. The server displays the totals in a list of twelve months, starting in March and ending in February, with zero for months when no reservations were made. This list is displayed in the bar chart. The program estimates a full year because the tax year is typically just partially over. It determines the number of months that have begun (the current month counts as a full month), divides the income of those months by that figure to obtain an average, and then multiplies the result by twelve. Although they are not included in the projection, accepted reservations for months that have not yet begun are included in the graphic.

## How tax is calculated
The tax bracket under the SARS rates for the period of March 1, 2026, to February 28, 2027, is determined by the estimated yearly income. 18% tax is applied to income up to R245,100. Then, the rates are 26% up to R383,100, 31% up to R530,200, 36% up to R695,800, 39% up to R887,000, 41% up to R1,878,600, and 45% over that. The predetermined base amount of the bracket plus its rate applied to income above the starting point of the bracket make up the annual tax. For instance, since R300,000 is in the 26% tax band, the tax is R44,118 + 26% of the R54,900 over R245,100, or R58,392. The monthly figures are calculated by dividing the annual values by twelve, and the net income is calculated by subtracting the tax from the expected revenue. The utils/TaxCalc.js file contains the logic.

## Access and limits
Only logged-in freelancers can use the tax endpoint, and it always uses the freelancer's own bookings, identified from the verified token. The estimate treats booking income as the freelancer's only income, subtracts no business expenses, and applies no rebates or deductions, so the tax shown is usually higher than a real assessment. The bracket table covers one tax year and must be updated each year. Freelancers should check their real position with SARS or a tax professional.

## Notifictaions (Loggging)
Users receive notifications regarding HustleHub+ events that impact them. On the home and booking pages, a Notifications panel displays messages sent to the user, starting with the most recent 100. Every one of them has a title, a brief message, and the creation date. The user can mark a single notice as read or all of them at once. Unread notifications are highlighted, and the panel displays the number of unread notifications. Notifications serve as a brief history because they are never erased.

## What is recorded
Every notification is a distinct record in the database. The receiver, the type, the title and message, a link to the relevant gig or booking, whether and when it was read, and the creation date are all stored. Sensitive information such as tokens and passwords is never included in a notification. Notifications that are marked as read are also recorded in the activity log along with the IP address, who did it, and what was impacted.

## What notification exist
When a freelancer creates a gig, they receive a "Gig created" notification; when a client books one of their gigs, they receive a "New booking request" notification. When a customer submits a booking, they receive a "Booking submitted" notification; when the freelancer decides, they receive a "Booking accepted" or "Booking rejected" notification. When a user logs in, they all get a "Login successful" signal.

## How booking and gig notifictaions work
The notification is generated at the time of the event by the controllers that manage gigs and bookings. Clients see decisions sooner, freelancers respond to requests more quickly, and neither party has to constantly monitor the bookings pages thanks to booking notifications that alert everyone when something needs their attention. The site reloads the panel to immediately display the new notification when a freelancer launches a gig or a client makes a reservation. In other situations, the panel does not update in real time; instead, it loads when a site is opened or refreshed.

## How the login notification works
When the panel loads for the first time following a login, the notification is generated. If there isn't already a notification for that login, the server adds it after reading the time the login token was provided. Therefore, while logging out and back in produces a new one, refreshing the site does not. This creates a list of login times and verifies that the login was successful under the appropriate role. An early warning that someone else might have used their account is sent if the user notices a time they do not recognise.

# Privacy
## Activity log
Key events are recorded in the activity log, including booking creation, acceptance, and rejection; read notifications; unsuccessful logins, account locks, blocked attempts on locked accounts, and logouts. Each entry is written by utils/activityLogger.js along with the IP address, the action, the item involved, and a brief description. After an issue or suspected attack, it provides a trail that may be examined.

## Containerisation
Each of the frontend and backend operates in a separate Docker container. The backend image has a health check on /api/health, runs as the unprivileged node user, and installs only the production packages. The frontend image creates the React application and uses nginx to serve it, forwarding /api requests to the backend container. docker-compose.Both are started by yml, which also transmits backend/.env's settings to the backend. Secrets remain outside of the pictures, and the application functions the same way on all machines.

# Security
## Security implementations
- Hashing of passwords. Bcrypt is used to hash passwords; it is purposefully slow and adds a random salt. BCRYPT_SALT_ROUNDS provides the number of rounds. The hash is never provided to the browser and is concealed from standard database queries.

- Validation and sanitisation of input: Before any controller code, express-validator rules are executed. The role, name, password, and email must all be text. The email needs to be legitimate and standardised. The name must contain HTML characters that have been escaped and be between two and sixty characters. The password must consist of eight to seventy-two characters, including a number, an uppercase letter, and a lowercase letter. The admin role cannot be selected after registration since the position must be client or freelancer. For speedy feedback, the registration page restates the password guidelines, but the server maintains its authority.

- JWT verification: The server issues a token signed with HS256 using JWT_SECRET following login. It expires after JWT_EXPIRES_IN (one hour by default) and contains the user's ID, role, and token version. It is sent in an Authorisation: Bearer header by the browser. In order to prevent a deleted account from continuing to use an outdated token, the authenticate middleware loads the user from the database, examines the header, and confirms the signature and expiration (accepting only HS256). Because a stateless token is appropriate for an API and contains the user's identity on each request, JWT was selected.

- Revocation of tokens: Every token has a token version number assigned to each user. When you log out, you add one to the stored version by calling POST /api/auth/logout. The browser then removes its copy of each previous token when it fails the check and is denied on all devices. This was selected because a system that manages reservations and revenue needs a mechanism to terminate a session, and a basic JWT typically cannot be cancelled before it expires. A role change takes effect right away since role checks utilise the role that is stored in the database rather than the one in the token.

- Access control based on roles: Only the specified roles are permitted by authorizeRoles, which runs after authenticate; otherwise, it returns 403. This is conveniently mirrored by the frontend ProtectedRoute, but it is enforced by the server.

- Checks for ownership: The logged-in user's ID from the validated token is included in queries for gigs, bookings, alerts, and tax data. A lost record and another person's record provide the identical response, and a user can only access their own records.

- IP rate restriction: Express-rate-limit responds with a "too many attempts" message after allowing each IP address to make 30 requests on the /api/auth routes in 15 minutes. In order to see the actual visitor address, the server only trusts one proxy the nginx container.

- Lockout of an account. An account is locked for fifteen minutes following five unsuccessful attempts to log in. Even the right password is refused while the system is locked, and the user is informed of the remaining minutes. The counter is cleared after a successful login. The lockout delays an attacker who distributes guesses for a single account across numerous machines, whereas the IP limit slows a single machine that attempts numerous accounts.

- Defence against the listing of accounts: "Invalid email or password" is the same message that appears when a login attempt fails. The server still verifies the password with a false hash in the event that the email does not exist, therefore the response time is meaningless. A unclear notice appears when you register using an email address that is already in use.

- Secure HTTP headers: The API uses Helmet to add protective headers. The nginx configuration adds X-Content-Type-Options, X-Frame-Options and Referrer-Policy for the frontend.

- CORS restriction and request size limit: The API only accepts browser requests from the origin in CLIENT_ORIGIN, and JSON request bodies are limited to 10 kilobytes.

- Central error handling: errorHandler.js logs the full error on the server and returns a general message, so stack traces and internal details are never exposed.

- Secret management: The connection string and JWT secret live in backend/.env, which is listed in .gitignore and excluded from the Docker image by .dockerignore. At startup config/env.js checks that the required values exist and that the JWT secret is at least 32 characters.

- Activity logging: Security-relevant events are recorded as described in section 5.8, including failed logins, account locks and logouts.

- Container hardening: The backend container runs as a non-root user, has a health check, and is built without the .env file.

- Static code analysis in the pipeline: A GitHub Actions workflow runs on every push and pull request. CodeQL scans the JavaScript for vulnerabilities and reports them in the repository's Security tab. ESLint with the security plugin checks the backend source, uploads an HTML report as evidence and fails the pipeline on errors.

## State analysis - Github tests

### CodeQL analysis

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/b0b02d42-8ead-4cfe-b550-e4d6f706a428" />

As part of the CI process, CodeQL, GitHub's static analysis tool, analysed the project's JavaScript source. The scan performed on the most recent change ("Update auth.js," run #4), and all of its steps setting up the job, examining the code, launching CodeQL, and conducting the analysis completed successfully in roughly one minute and twenty seconds. CodeQL searches the code for security issues, such as injection vulnerabilities, unsafe user input usage, and insecure data handling, and it reports each discovery as an alert in the Security tab of the repository. Because CodeQL reports discoveries without failing the build, the job passes regardless of whether the scan produces [X alerts].
### ESLint security rules

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/d6f035e2-21ec-4645-9ec5-89e05db6aeab" />

The backend source code in the pipeline was also examined by ESLint using the security plugin. Six issues were recorded on its initial run: two faults and four warnings. An unnecessary error variable in the authentication middleware and an unneeded mongoose import in the tax controller were the two code-quality mistakes. The pipeline passed in roughly 14 seconds after both were taken out. The detect-object-injection rule, which flags any location where an object is accessed with a variable because it can be dangerous when an attacker owns the variable, is the source of the four warnings. They can be found in the tax calculator, the tax controller, and the environment configuration (two). After review, all four were determined to be false positives since the keys are never derived from user input but rather from fixed lists that are written in the code or from computed month numbers. As proof, ESLint also stored its report in the pipeline run as a downloadable file.

## How security features address common threats
- Injection. The main risk for a MongoDB app is NoSQL injection, where an attacker sends an object such as a query operator instead of text. The validation rules require the email, password, name and role to be text and the role to match the allowed list, so objects are rejected before any query runs. The password is never placed in a query. It is compared with bcrypt after the user is found. User ids in lookups come from a signed token, request bodies are limited to 10 kilobytes, and the app uses Mongoose methods with typed values and never builds queries from raw text.

- Cross-site scripting. The name is escaped on the server before it is saved, and React escapes every value it displays, so stored content appears as text and not as a script. Helmet and the nginx headers add further protection. The token is kept in the browser's local storage, so a successful script attack could read it. The one-hour expiry and revocation on logout limit the damage.

- vulnerabilities in authentication. Strong password guidelines, bcrypt hashing, the IP rate limit, and account lockout all prevent password guessing. The dummy-hash comparison and identical login errors manage account discovery. Token expiration, database checks on every request, and revocation upon logout are how stolen or outdated sessions are handled. The token secret and passwords are never entered into the code or sent back to the browser.

- control over access. Every protected route executes authorizeRoles, which returns 403 for a role that is not permitted, after authenticate, which returns 401 for a missing or incorrect token. Only clients and freelancers may register, and since the role is read from the database, no one can access the functions of another position. Ownership checks prevent users from using guesswork to read or modify the records of other users. The server handles the actual enforcement; the protected routes on the frontend are merely for convenience.

# Screenshots
## Docker running sucessfully

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/19a5e757-bd5a-4157-b213-82dca7f161b5" />

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/21ca8c49-40ed-4780-99cc-a832bc5163c9" />

## App
### Client login screen

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/fe77e160-0b45-40ba-859e-377bad65aba7" />

### Freelancer login screen

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/21cb33be-bb28-4fc3-a1bf-f654fab1b30c" />

### Client Dashboard

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/c3f64022-3721-42eb-9da1-0aeb9bf18777" />

### Listing of all available gigs made by freelancers

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/2a15cfbf-540a-4c96-b788-6557d22aba13" />

### Client made a booking to "Jane", lists in My Bookings screen

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/070eae38-d18b-4668-8d09-654931df8d05" />

### freelancer dashboard

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/2d490620-ecb4-4827-9760-ed7ca169f6f9" />

### Notifictaion showing gig created in freelancer dashboard

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/dd60cb6f-d7a8-4335-9103-f9390ebddcb5" />

### Tax summary screen for freelancer

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/2b010e3e-5c89-4eee-a3ef-c442bfc7346a" />

### Incoming bookings screen for freelancer

<img width="1662" height="632" alt="image" src="https://github.com/user-attachments/assets/0d78250f-7f9c-4135-ac97-65ac2a585ac7" />

