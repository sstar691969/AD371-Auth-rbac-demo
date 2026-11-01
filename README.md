### AD371 Authentication and Role-Based Access Control Demo

### 1. Project Overview and Purpose

This project demonstrates how authentication (AuthN) and authorization (AuthZ) work together in a web application.

The application allows users to register an account, log in, and access features based on their assigned role. It includes two roles:

- User:** Can register, log in, view their account information, and use standard application features.
- Admin:** Can log in, view account information, and access a protected dashboard that displays the registered user list.

The purpose of this project is to demonstrate how a web application can verify user identities, manage login sessions, and restrict access to protected resources based on user roles.

The application was developed using Node.js, Express, SQLite, and JavaScript.

### 2. Authentication (AuthN) and Authorization (AuthZ)

Authentication (AuthN)

Authentication answers the question: **Who are you?**

The application implements authentication through registration and login.

- Users register with an email address and password.
- Passwords are hashed using bcrypt before being stored in the database.
- During login, the application compares the submitted password with the stored password hash.
- When login succeeds, the server creates a session for the user.
- The application provides a logout function that destroys the session.

The application also provides a session-checking endpoint to determine whether a user is currently logged in.

Authorization (AuthZ)

Authorization answers the question: **What are you allowed to access?**

The application uses role-based access control (RBAC) to determine which resources a user can access.

There are two roles:

| Role | Permissions |
|---|---|
| User | Register, log in, view account information, and use standard features. |
| Admin | Access standard features and the protected Admin dashboard and user list. |

The server checks the authenticated user's role before allowing access to administrative routes.

A regular User who attempts to access an Admin-only route receives an HTTP 403 Forbidden response. An unauthenticated visitor receives an HTTP 401 Unauthorized response.

Public registration always assigns the User role. A person cannot become an Admin simply by submitting an Admin role in the registration request. Admin accounts are created separately using the administrative setup script.

### 3. Technology Stack and Architecture

### Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Application page structure |
| CSS | Application styling |
| JavaScript | Frontend interactions and API requests |
| Node.js | Server-side JavaScript runtime |
| Express.js | Backend web framework and API routes |
| SQLite | Stores user account information |
| better-sqlite3 | Connects the application to SQLite |
| bcrypt | Password hashing and password verification |
| express-session | Manages user login sessions |
| connect-sqlite3 | Stores sessions in SQLite |
| dotenv | Loads environment variables |
| Helmet | Adds HTTP security headers |
| Supertest | Sends HTTP requests during automated testing |
| Node.js test runner | Runs automated tests |

### Application Architecture

The application uses a client-server architecture.

**Frontend:** The browser displays the registration form, login form, account information, and Admin dashboard. JavaScript sends requests to the backend API.

**Backend:** The Express server receives requests, validates input, handles authentication, manages sessions, and checks user permissions.

**Database:** SQLite stores user records, including email addresses, password hashes, roles, and account creation dates. Session information is stored separately in SQLite.

### Request Flow

1. A user enters registration or login information in the browser.
2. The frontend sends an HTTP request to the Express backend.
3. The backend validates the request and communicates with the database.
4. During login, bcrypt verifies the submitted password.
5. If authentication succeeds, the server creates a session.
6. When a user requests a protected resource, the backend checks the session and the user's role.
7. The server allows or denies access based on the authorization rules.

This separation allows the frontend to display information while the backend remains responsible for enforcing security.

### 4. How to Install and Run the Application

Requirements

- Node.js
- npm
- Git
- A code editor such as Visual Studio Code

### Step 1: Clone the Repository

Open Terminal and run:

```bash
git clone https://github.com/sstar691969/AD371-Auth-rbac-demo.git
```

Navigate into the project:

```bash
cd AD371-Auth-rbac-demo
```

### Step 2: Install Dependencies

Run:

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the main project folder.

Add the following configuration:

```env
PORT=3001
NODE_ENV=development
SESSION_SECRET=replace_with_a_long_random_secret
```

Generate a random session secret using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into the `SESSION_SECRET` setting in your local `.env` file.

Do not upload `.env` or share the session secret publicly.

### Step 4: Start the Application

Run:

```bash
node server.js
```

Open the application in your browser:

```text
http://localhost:3001
```

### Step 5: Create an Admin Account

Open a second Terminal window in the project folder and run:

```bash
node create-admin.js
```

Follow the prompts to enter an Admin email address and password.

The script creates an account with the Admin role. Use a strong password that is not reused elsewhere.

## 5. How to Run the Automated Tests

The project uses the built-in Node.js test runner and Supertest.

To run the automated tests, execute:

```bash
npm test
```

The tests cover the following behaviors:

1. Unauthenticated visitors cannot access Admin routes.
2. Public registration always assigns the User role.
3. Users can log in successfully.
4. Sessions identify authenticated users.
5. Regular Users cannot access Admin routes.
6. Admins can log in and access the user list.
7. Logout destroys the login session.

The test suite also verifies that password hashes are not included in the Admin user-list response.

**Test results:** The completed automated test run passed all 8 reported tests, with zero failures.

## 6. Security Measures and Limitations

### Security Measures Implemented

- **Password hashing:** bcrypt hashes passwords before they are stored in the database.
- **Password verification:** Login checks the submitted password against the stored hash.
- **Session management:** express-session maintains authenticated user sessions.
- **SQLite session storage:** Sessions are stored separately from user account records.
- **Session cookie protection:** Session cookies use HttpOnly and SameSite=Lax settings, with Secure enabled in production configuration.
- **Session regeneration:** The session is regenerated after successful login to help protect against session fixation.
- **Role-based access control:** Backend middleware checks whether the authenticated user has the required role.
- **Protected Admin routes:** Only authenticated Admin users can access administrative endpoints.
- **Registration restrictions:** Public registration cannot assign the Admin role.
- **Input validation:** Registration validates email and password requirements.
- **Security headers:** Helmet adds HTTP security headers.
- **Environment variables:** Sensitive configuration is stored in `.env`, which is excluded from Git.

### Known Limitations and Future Improvements

This project is an educational demonstration and should not be considered a fully production-ready authentication system.

Possible future improvements include:

- Adding rate limiting to reduce repeated login attempts.
- Implementing CSRF protection where appropriate for the session-based application.
- Adding email verification and password reset functionality.
- Improving password policy and account validation.
- Adding more comprehensive logging and security monitoring.
- Configuring and verifying HTTPS and secure cookies in a production deployment.
- Adding additional automated tests for invalid input, duplicate registrations, and session expiration.
- Reviewing production database backup and recovery procedures.

These improvements would strengthen the application if it were developed further for real-world use.

### 7. AI Assistance, Prompts, and Evaluation

### How AI Was Used

AI assistance was used during development to help understand authentication and authorization concepts, plan the application structure, troubleshoot programming errors, and develop automated tests.

AI assistance also helped explain how the frontend communicates with the backend, how sessions work, and how role-based access control protects administrative routes.

The generated code and explanations were reviewed and tested before being included in the project.

### Examples of AI Prompts Used

**Prompt 1: Understanding Authentication and Authorization**

"Explain the difference between authentication and authorization in a full-stack web application. Provide a beginner-friendly example using User and Admin roles."

**Prompt 2: Project Architecture**

"Help me build a beginner-friendly Node.js and Express authentication application using SQLite, bcrypt password hashing, and session-based authentication."

**Prompt 3: Role-Based Access Control**

"Show me how to implement backend middleware that requires a user to be logged in and checks whether the user has an Admin role before accessing protected routes."

**Prompt 4: Security Testing**

"Help me create automated tests using Node.js test runner and Supertest to verify that unauthenticated users receive HTTP 401, regular users receive HTTP 403 when accessing Admin routes, and Admin users can access protected routes."

**Prompt 5: Troubleshooting**

"Help me troubleshoot my Express authentication application step by step. Explain the cause of the error and provide commands to verify the solution."

### Evaluation of AI Assistance

AI assistance helped speed up development and made it easier to understand unfamiliar programming concepts. It was especially useful for explaining middleware, session management, password hashing, and automated testing.

However, AI-generated code should not automatically be assumed to be correct or secure. Some suggestions require verification against the actual application and its requirements.

For example, a registration form must not be trusted to assign administrative privileges. I verified that the backend always creates public registrations with the User role, even when an Admin role is submitted in the request.

I also verified that regular users cannot access the protected Admin route, while authenticated Admin users can access the user list.

The automated tests provided additional evidence that these security behaviors worked as expected.

My evaluation is that AI was a useful development and learning tool, but testing, reviewing the code, and understanding the security decisions were still necessary.

## Conclusion

This project demonstrates how authentication and authorization work together in a web application. It uses password hashing, session management, SQLite, and role-based access control to separate regular User permissions from Admin permissions.

Building and testing the application provided practical experience with full-stack development, backend security middleware, database integration, and automated quality assurance.
