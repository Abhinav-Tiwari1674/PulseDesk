# Technical Audit Report: PulseDesk

Based on a direct and comprehensive scan of the PulseDesk codebase.

---

# 1. Project Overview
* **One-line summary**: A modern, responsive workspace task tracking and team collaboration platform built on the MERN stack.
* **Primary problem solved**: Enables administrative managers to assign tasks, define step-by-step checklists, track real-time completion progress, and converse with team members without communication overhead.
* **Target users**: Project managers/workspace administrators and their assigned employees or team members.

---

# 2. Tech Stack
* **Frontend**: React (v19.2.7), Vite (v8.1.0), TailwindCSS (v4.3.1)
* **Backend**: Node.js, Express.js (v5.2.1)
* **Database**: MongoDB (Mongoose ORM v9.7.3)
* **Authentication**: JWT (JSON Web Tokens), Cookie-based sessions, Google OAuth (Firebase Client SDK v12.15.0 & Firebase Admin SDK v14.1.0)
* **State Management**: React Context API (`AuthContext`)
* **AI APIs**: Google Gemini API (`gemini-flash-latest`) via `@google/generative-ai` (v0.24.1)
* **Cloud Services**: MongoDB Atlas (Cloud Database), Firebase Auth (OAuth Identity Provider), Brevo (Transactional Email HTTP API - replaces SMTP)
* **Deployment**: Render (configured to serve React SPA builds via wildcard fallback routes)
* **Libraries & Tools**: 
  * *Backend*: `bcryptjs`, `cookie-parser`, `cors`, `dotenv`, `express-rate-limit`, `helmet`, `morgan`, `nodemailer` (installed but SMTP unused in favor of Brevo HTTP), `nodemon`
  * *Frontend*: `framer-motion`, `lucide-react`, `axios`, `clsx`, `tailwind-merge`
  * *Unused Installed Packages*: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `react-hook-form` (all present in client `package.json` but not imported or used in the source code)

---

# 3. Features
* **Authentication**:
  * Local account registration with mandatory `@gmail.com` domain validation.
  * Local login with email, password, and "Remember Me" toggle (extends token life to 30 days).
  * 6-digit numeric OTP generation, verification, and expiration validity check sent on registration.
  * Forgot Password email link dispatch and SHA-256 hashed password reset token validation.
  * Federated Google Sign-In verified securely via Firebase ID Token validation on the backend.
* **Workspace Management**: **Not Implemented** *(Workspace.js model and workspace routes are absent from active code; migration script references exist but are leftover scripts).*
* **Project Management**: **Not Implemented** *(Project.js model and project routes are absent from active code).*
* **Task Management**:
  * Admins can create tasks, assign them to employees, set titles, priorities (low, medium, high), status (pending, in-progress, completed), progress percentage, and description.
  * Admins can edit task titles, descriptions, assignees, priorities, status, and subtasks.
  * Admins can delete tasks.
  * Employees can view assigned tasks and update status, progress, checklists, and submit work updates.
* **Team Collaboration**:
  * Real-time Direct Chat panel enabling direct messaging between administrators and employees.
  * Context-specific Task Message history tracking within the task update modal (acting as an audit log).
* **Role-Based Access**:
  * Granular controls separating `admin` and `employee` roles.
  * Front-end page route guards (`AdminRoute` for `/employees` and `/tasks`; `ProtectedRoute` for `/dashboard`, `/profile`, `/chat`).
  * Backend route level checks (`requireRole('admin')` or `protect` middleware validation).
* **Dashboard**:
  * **Admin View**: High-level counter cards (Total Employees, Total Tasks, Completed, Pending), Recent Task Updates stream, Latest Employee Messages log, and Employee Task Overview interactive table.
  * **Employee View**: High-level counter cards (Total Assigned, Completed, Pending, In-Progress) and My Tasks checklist stream.
* **AI Features**:
  * **AI Task Breakdown & Subtask Generator**: Generates description and a 3-7 subtask checklist based on the task title.
  * **AI Task Progress Summarizer**: Summarizes task update chat logs into a 2-3 sentence progress report.
  * **AI Chat Tone Enhancer**: Rewrites rough update messages into polite and professional corporate chats.
* **Notifications**:
  * Email alert to employees on new task assignment.
  * Email alert to admins when an employee completes a task.
  * Numeric OTP codes sent during registration.
  * Password recovery reset links sent upon request.
* **Search & Filters**:
  * Tasks page search (by title/description) and filter options (by status, priority, or assignee).
  * Employees page search (by name/email).
  * Chat sidebar search (by contact name/email).
* **Profile & Settings**:
  * View-only user card layout displaying name, email, role, and provider. *Editing and settings modifications are **Not Implemented**.*
* **Admin Features**:
  * Add, edit, or delete employees.
  * View employee task activity, progress, and updates.
  * Create, edit, delete, and audit tasks.
* **Analytics**: **Not Implemented** *(Only high-level task status counters on dashboards exist).*
* **File Upload**: **Not Implemented** *(User avatars default to Google picture URL or name initials).*
* **Other Features**:
  * Strict domain restriction enforcing gmail-only sign-ups and employee invitations.
  * Automated client-side polling intervals (3-second chat sync, 4-second task sync) for real-time visual updates.

---

# 4. Authentication & Security
* **JWT**: Implemented. Stored in httpOnly cookies with `strict` SameSite configuration and standard bearer authorization headers. Remember-me token expires in 30 days; default token in 1 day.
* **Google OAuth**: Implemented via client Firebase authentication popup, verified backend-side using the Firebase Admin SDK token decoder.
* **Firebase Authentication**: Implemented. Used to delegate federated Google logins.
* **Forgot Password**: Implemented. Sends password reset links via email with a 10-minute validity window.
* **OTP**: Implemented. Sends 6-digit verification code on signup, expiring in 15 minutes.
* **Email Verification**: Implemented. Blocks password logins for unverified accounts until the OTP is validated.
* **Protected Routes**: Implemented. React guards `ProtectedRoute` and `AdminRoute` restrict route access.
* **Role-Based Access Control**: Implemented. Enforces role verification on client routes and backend API endpoints using roles `admin` and `employee`.
* **Password Hashing**: Implemented. All local passwords are encrypted with 10 salt rounds using `bcryptjs` in a Mongoose pre-save middleware.
* **Middleware**: Implemented. Custom `protect` (verifies token/attaches user) and `requireRole` (privilege gate) Express middleware.
* **CORS**: Implemented. Configured in `server.js` to restrict API access to client origin in production.
* **Environment Variables**: Implemented. Server-side secrets managed in `.env` via `dotenv`; client-side variables prefixed with `VITE_`.
* **Rate Limiting**: Implemented. Selective endpoint protection via `express-rate-limit`: `authLimiter` limits logins/registers/OTP to 20 requests per 15 minutes, `forgotLimiter` limits password resets to 5 requests per hour.
* **Helmet**: Implemented. Custom security header policies configure cross-origin policies and disable standard CSP for stylesheet flexibility.
* **Other Security Features**:
  * Hashed password recovery token representation stored in MongoDB database (SHA-256).
  * Strict email domain whitelisting enforcing `@gmail.com` sign-ups on backend controllers.
  * Database sparse unique index preventing admin-employee ID overlap collision.

---

# 5. Dashboard Modules
* **Admin Dashboard Overview**: Counter cards showing workspace totals, recent task updates list, latest worker messages stream, and employee directory status dashboard.
* **Employee Dashboard Overview**: Assigned stats tracking panel, task list dashboard, and task update interactive modal.
* **Task Planner Module (Admin)**: Grid showing tasks, search filters, task creator panel, update modal, task deletion trigger.
* **Employee Management Module (Admin)**: Active employee list directory, create employee trigger, edit/delete modals.
* **Direct Chat Module**: Sidebar contact lookup, chat transcripts feed, direct text transmission box.
* **Profile Module**: User information card panel.

---

# 6. REST APIs
* **Total number of REST API endpoints**: **25**
* **API categories**: 
  1. User Authentication and Account Management (`/api/auth/*`)
  2. Workspace Communications and Direct Messaging (`/api/messages/*`)
  3. Task Checklist Allocation and Progress Management (`/api/tasks/*`)
* **CRUD modules**:
  * *Tasks CRUD*: POST `/api/tasks`, GET `/api/tasks`, GET `/api/tasks/:id`, PUT `/api/tasks/:id`, DELETE `/api/tasks/:id`
  * *Employees CRUD*: POST `/api/auth/employees`, GET `/api/auth/employees`, PUT `/api/auth/employees/:id`, DELETE `/api/auth/employees/:id`
  * *Messages CRUD*: POST `/api/messages`, GET `/api/messages/:userId`
* **Authentication APIs**:
  * POST `/api/auth/register` (Account creation)
  * POST `/api/auth/login` (Local login)
  * POST `/api/auth/google` (Google login verification)
  * POST `/api/auth/logout` (Session clearance)
  * POST `/api/auth/forgot-password` (Recovery email trigger)
  * POST `/api/auth/reset-password/:token` (Hashed verification password update)
  * POST `/api/auth/verify-otp` (OTP code validation)
  * POST `/api/auth/resend-otp` (OTP regeneration)
  * GET `/api/auth/me` (Profile detail request)
* **AI APIs**:
  * POST `/api/messages/enhance-tone` (Rewrites chat drafts professionally)
  * POST `/api/tasks/ai-generate` (Generates task descriptions and checklists)
  * GET `/api/tasks/:id/ai-summary` (Summarizes update chat history)
* **Other APIs**:
  * GET `/api/tasks/dashboard-stats` (Aggregates task status counters and logs)
  * GET `/api/auth/admin-details` (Retrieves administrator profile for worker lookup)

---

# 7. Database
* **Total MongoDB collections**: **3**
* **Schemas/Models**:
  1. **User** (`users` collection): Stores credentials, roles (`admin` or `employee`), verification parameters (OTP code, expiration, isVerified, isJoined), OAuth provider, and references.
  2. **Task** (`tasks` collection): Stores titles, descriptions, assignees, creators, priorities, status parameters, checklist structures, subtasks, timestamps, and task audit update logs.
  3. **Message** (`messages` collection): Stores direct communication logs linking sender, receiver, and message text.
* **Relationships**:
  * *One-to-Many Self Reference*: `User.admin` references `User._id` (links employee to their admin manager).
  * *Many-to-One*: `Task.assignedEmployee` and `Task.admin` reference `User._id`.
  * *Many-to-One*: `Message.sender` and `Message.receiver` reference `User._id`.
  * *Many-to-One*: `Task.updates.sender` references `User._id`.
* **Indexes**:
  * `email`: Unique index (Mongoose `unique: true`).
  * `employeeId`: Sparse, unique index (Mongoose `unique: true, sparse: true`) allowing admins to omit the field without triggering key duplicates.
* **Aggregations**: **Not Implemented** *(All data fetches use Mongoose standard query models, populate chains, or countDocuments queries).*

---

# 8. React Frontend
* **Total pages**: **10**
  1. Landing Page (`Landing/index.jsx`)
  2. Login Page (`Login.jsx`)
  3. Register Page (`Register.jsx`)
  4. Forgot Password Page (`ForgotPassword.jsx`)
  5. Reset Password Page (`ResetPassword.jsx`)
  6. Dashboard Page (`Dashboard.jsx`)
  7. Employees Page (`Employees.jsx`)
  8. Tasks Page (`Tasks.jsx`)
  9. Profile Page (`Profile.jsx`)
  10. Chat Page (`Chat.jsx`)
* **Total reusable components**: **2**
  1. `Layout.jsx` (Navigation sidebar, mobile responsive navbar, background layouts)
  2. `SpaceBackground.jsx` (Dynamic dark space canvas backdrop)
* **Context API / Redux**: `AuthContext` is utilized to manage session caching, login states, and OAuth authentication. Redux is **Not Implemented**.
* **Routing**: Managed via React Router DOM (v7.18.0) declarations.
* **Lazy Loading**: **Not Implemented** *(Statically imported).*
* **Protected Routes**: React route wrapper layouts (`ProtectedRoute` and `AdminRoute`) enforce security client-side.
* **Responsive Design**: Fluid UI scaling implemented via responsive Tailwind grid components, sidebars, and toggling drawers.
* **Custom Hooks**: Exactly **1** custom hook: `useAuth` hook.

---

# 9. Backend Architecture
* **Folder Structure**: Uses standard route-controller segregation:
  * `config/` (DB/Firebase certs), `controllers/` (business logic), `middlewares/` (auth protection), `models/` (Mongoose definitions), `routes/` (Express routes), `services/` (Gemini service), `utils/` (email, Firebase initialization helpers).
* **MVC Architecture**: Implemented. Backend functions as the API Controller and Model layer, serving the Client View.
* **Controllers**: **3** files (`authController.js`, `messageController.js`, `taskController.js`).
* **Routes**: **3** files (`authRoutes.js`, `messageRoutes.js`, `taskRoutes.js`).
* **Middleware**: **1** file (`authMiddleware.js` containing `protect` and `requireRole`).
* **Services**: **1** file (`aiService.js` hosting the Gemini prompt wrappers).
* **Utilities**: **3** files (`firebaseAdmin.js`, `generateToken.js`, `sendEmail.js`).
* **Validation**:
  * *Client*: Basic state checks (password length, email constraints, form alerts).
  * *Server*: Mongoose validation constraints and hardcoded domain check validations (`endsWith('@gmail.com')`).
* **Error Handling**: JavaScript `try/catch` statements wrap async controller routes, returning JSON response error payloads.

---

# 10. AI Features
* **AI Task Breakdown & Subtask Generator**:
  * *Endpoint*: POST `/api/tasks/ai-generate`
  * *Action*: Receives a task title, generates a MERN-aligned task description and 3-7 actionable subtask checkpoints using Gemini, and returns them as a structured JSON object.
* **AI Task Progress Summarizer**:
  * *Endpoint*: GET `/api/tasks/:id/ai-summary`
  * *Action*: Formats task descriptions and update chat log feeds into a conversation log, sending the transcript to Gemini to retrieve a 2-3 sentence executive progress report.
* **AI Chat Tone Enhancer**:
  * *Endpoint*: POST `/api/messages/enhance-tone`
  * *Action*: Submits draft messages to Gemini, which returns a grammatically correct, polite, and professional corporate message replacement.

---

# 11. Cloud Services
* **Firebase**: Client verification verifies logins; backend Admin SDK validates ID tokens.
* **Cloudinary**: **Not Implemented** *(Photo configurations retrieve URL data directly from authenticated Google profiles).*
* **Render**: Serves as target environment for backend hosting.
* **MongoDB Atlas**: Serves as database host.
* **Other services**: **Brevo** REST API acts as transactional mailer, bypassing SMTP firewall ports.

---

# 12. Performance Optimizations
* **Query optimizations**: Selective mongoose projections (.select) and partial object populates (field restrictions).
* **Database indexes**: Mongoose-managed unique `email` and sparse unique `employeeId` index paths.
* **Caching**: **Not Implemented**.
* **Code splitting**: **Not Implemented**.
* **Lazy loading**: **Not Implemented**.
* **API optimization**: Uses short client-side polling intervals (3s/4s) instead of long-running sockets.
* **Other optimizations**: Session-specific token retention (combining local and session storage).

---

# 13. Security Features
* JWT cookies with httpOnly flags.
* Firebase ID Token backend authentication checks.
* SHA-256 hashed password reset token validations.
* Numeric 6-digit registration OTP verification email checks.
* Granular client-side Route Guards and backend Express Roles Middleware checks.
* Password hashing with 10 salt rounds.
* CORS client origin checks.
* Selective API rate limiters restricting brute-force endpoints.
* Helmet headers configurations.
* Gmail domain constraint restrictions.
* Mongoose sparse indexes preventing unique key admin collisions.

---

# 14. Actual Project Statistics
* React Pages: **10**
* Reusable Components: **2**
* REST APIs: **25**
* Controllers: **3**
* Routes: **3**
* Models: **3**
* MongoDB Collections: **3**
* Middleware: **1** (with 2 functions)
* Services: **1** (with 3 functions)
* Utility Files: **3**
* Dashboard Modules: **2** (distinct Admin and Employee roles layout modules)
* User Roles: **2** (`admin`, `employee`)
* AI Features: **3** (Task breakdown, Progress summarization, Tone enhancement)
* Authentication Methods: **2** (Email + password with OTP verification, Google Sign-in OAuth)

---

# 15. Resume Metrics
1. Engineered **25 REST API endpoints** using Express.js to structure the platform's authentication, collaboration, and task directories.
2. Modeled **3 Mongoose collections** (users, tasks, messages) with strict validation, reference schemas, and sparse database indexing.
3. Implemented **3 generative AI features** via the Google Gemini API to automate task generation, progress logs, and message formatting.
4. Programmed **10 responsive client-side pages** with React Router DOM to manage dashboard navigations.
5. Engineered **2 reusable React layout components** managing glassmorphic sidebar panels and canvas background rendering.
6. Structured **2 role-based directories** (`admin` and `employee`), restricting database and frontend routes via custom route middleware.
7. Verified accounts using a custom **6-digit registration OTP** sent via transaction APIs, enforcing a 15-minute expiratory check.
8. Secured authentication gateways using **2 Express rate limiters** blocking brute force attacks.
9. Implemented **1 React Context Provider** to store session data, handle user logins, and retain local states.
10. Engineered **2 federated authentication pathways** (Email+Password with OTP, Google OAuth verified by Firebase Admin SDK).
11. Implemented **3-second and 4-second client polling** schemas to synchronize direct chat messages and task logs in real-time.
12. Programmed **4 customized Brevo transactional email triggers** using responsive dark-themed HTML structures.
13. Integrated a **SHA-256 password recovery mechanism** validating reset links with a 10-minute expiry range.
14. Enforced email registrations to the **@gmail.com domain** on database controllers, isolating login paths.
15. Encrypted credentials by hashing user passwords using `bcryptjs` with **10 salt rounds** on Mongoose pre-save hooks.
16. Configured **Helmet security headers** to secure resource access configurations.
17. Engineered a **sparse, unique database index** for employee IDs, permitting admins to omit the key fields safely.
18. Populated MongoDB queries selectively via Mongoose projections, reducing JSON payload responses.
19. Created **3 separate API controller structures** to partition user accounts, tasks, and communications.
20. Programmed a background database script using Mongoose models to verify and migrate user task profiles.

---

# 16. Technical Interview Highlights
1. **Brevo REST HTTP API Email Integration**: Circumvented outbound SMTP port firewalls (ports 25, 465, 587) in the hosting environment (Render) by leveraging Brevo's REST HTTP endpoints (`/v3/smtp/email`) to send transactional notifications.
2. **Lazy Gemini Client Initialization**: Instantiated the `GoogleGenerativeAI` instance inside helper functions on-demand, preventing server crashes during deployment before API secrets were loaded.
3. **Structured Gemini JSON Output Configuration**: Configured Gemini using `responseMimeType: 'application/json'` to guarantee that subtask breakdown results adhered strictly to Mongoose schemas.
4. **Mongoose Pre-Save Password Hook**: Integrated Mongoose pre-save hooks to hash password fields using `bcryptjs` asynchronously with 10 salt rounds only when modified, preventing database double-hashing.
5. **Mongoose Sparse and Unique Employee Indexes**: Utilized Mongoose `sparse: true` and `unique: true` parameters on worker IDs to allow null-valued admin profiles without key collisions.
6. **Dual Session Token Persistence**: Structured client auth context to save tokens in `localStorage` for 30-day "Remember Me" sessions and `sessionStorage` for standard tabs.
7. **Granular Role-Based Update Enforcements**: Controlled task mutations by locking edits on the backend. Admins update all parameters; employees only modify statuses, percentages, and update logs.
8. **Automated Subtask Progress Math**: Created backend hooks that update progress percentages dynamically based on subtask checkmark rates, setting tasks to completed at 100%.
9. **Firebase Admin Token Verification**: Enabled Google Sign-In verification by passing ID tokens to the Firebase Admin SDK on the backend to decode profiles, avoiding client-side credential trust.
10. **State-less JWT Authentication via httpOnly Cookies**: Issued state-less JWT tokens stored in client cookies configured with httpOnly, SameSite, and Secure flags to defend against XSS.
11. **Express Rate Limiting Guardrails**: Applied `express-rate-limit` selectively across pathways to protect auth entry points from brute-force attempts.
12. **Domain-Level Registration Filters**: Filtered registrants using backend checks that reject all emails not ending with `@gmail.com` to isolate target databases.
13. **Selective Query Population**: Reduced database request times by specifying field projections inside Mongoose `.populate()` chains to query only necessary parameters.
14. **Helmet Headers Configuration**: Configured Helmet with custom policies to allow inline scripts for custom visual styles while blocking cross-origin leak threats.
15. **Real-time Client-side Polling Framework**: Implemented short-polling intervals on the frontend (3-second chat, 4-second task details) to simulate real-time socket connections.
16. **Task Update History Auditing**: Built a nested subdocument array (`updates`) in the Task model to create a read-only audit log tracking worker updates.
17. **Brevo Email Error Boundaries**: Encapsulated Brevo REST triggers inside detached `try/catch` scopes to log failures without blocking subsequent database task saves.
18. **Custom Express Route Guard Middleware**: Partitioned route protection using declarative custom middleware wrappers (`protect` and `requireRole`).
19. **Wildcard Production Router Routing**: Configured Express to serve the static Vite bundle on production, routing wildcard paths (`*any`) to the index file to prevent SPA page breaks on reload.
20. **Forgot Password Token Hashing**: Protected database breaches by storing SHA-256 hashes of reset password tokens rather than plaintext representations.

---

# 17. Resume Project Description

### 2-Bullet Format
* Engineered a collaborative MERN application with 25 REST APIs, protecting authentication via httpOnly JWT cookies, rate limiters, and Google Sign-in verified via the Firebase Admin SDK.
* Integrated Google Gemini AI to automate task checkpoints and summarize update logs in real-time, optimizing query responses using selective Mongoose field populations.

### 3-Bullet Format
* Programmed a task-tracking platform using Express and MongoDB with 25 REST APIs, segregating administrative and employee permissions using role-based middleware guards.
* Integrated the Google Gemini API to generate task description checklists and summarize worker update histories, reducing managerial task planning overhead.
* Bypassed cloud firewall SMTP blocks by leveraging Brevo HTTP endpoints for transactional notifications, syncing real-time user updates via client-side polling intervals.
