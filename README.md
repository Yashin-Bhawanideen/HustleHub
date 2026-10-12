# HustleHub+ (MERN) - Client / Freelancer login

#Members
- ST10444715 Keegan Ewan Tromp
- ST10434249 Richard Hein
- ST10443463 Yashin Bhawanideen
- ST10443090 Amir Muller
- ST10450208 Mishal Bhikha


On the freelancing marketplace platform HustleHub+, clients peruse and reserve the services of independent contractors. The system's authentication base is covered in this version of the project. Both clients and freelancers can register and log in; upon successful login, each role is redirected to a secure page. A client sees the corresponding site for clients, and a freelancer sees a page verifying they are logged in as a freelancer. The rest of the team will create the gig management, booking, and finance functionality from these pages.

It's a full-stack MERN application. React is used to build the frontend, Node.js and Express are used to build the backend API, and Azure DocumentDB (Azure Cosmos DB for MongoDB) is used to store user data in MongoDB. Docker is used to containerise both the frontend and the backend, ensuring that the project functions consistently across all machines.

# How authentication and security work

Plain-text passwords are never saved when a user registers, selects a role, and their information is put in the database with the password hashed using bcrypt. The API verifies their login information and the role they have chosen before returning a JSON Web Token (JWT). This token is stored by the frontend and sent with subsequent requests; for each protected route, the backend verifies it. Role-based access restriction guarantees that neither clients nor freelancers can access client or freelancer pages. Helmet applies HTTP security headers, rate limits login and registration, and validates and sanitises input. A private.env file that is never uploaded to GitHub contains secrets like the database connection string and the JWT secret.

# Project Structure

The project is divided into two side-by-side applications. The React user interface is located in the frontend folder, while the Express API is located in the backend folder. Both containers and a package are started simultaneously via a docker-compose.yml file located in the root folder.You can launch both applications in development with a single command if you have json in the root.

The Dockerfile creates the backend container, and the.env.example file serves as a template for the private settings file inside the backend folder. The src folder contains the source code. App.js configures Express with the security middleware and routes, while server.js launches the server and establishes a database connection. The configuration folder controls the database connection and verifies the environment parameters. The User data model is located in the models folder. The login and registration logic is located in the controllers folder. JWT checking, role checking, input validation, and error handling are all included in the middleware folder. The utils folder generates and validates the JWT tokens, while the routes folder specifies the role-protected areas and the API endpoints for authentication.

The Dockerfile inside the frontend folder creates the React application and uses nginx to serve it, while the nginx.conf file routes /api requests to the backend container. The src folder contains the source code; api.js is a helper for contacting the backend API, and App.jsx manages page routing. The person who is logged in is monitored throughout the application by the context folder. The protected route component, which reroutes visitors who are logged out or have the incorrect role, is located in the components folder. The client page, the freelancer page, and the login and registration page are all located in the pages folder.

Every request goes through distinct levels of accountability on the backend. The model reads and writes the database, the controllers execute the logic, the middleware verifies and checks the token and role, and the routes receive the request.



