# SYSTEM ARCHITECTURE SPECIFICATION
## Full-Stack Cross-Platform Project Management System (JavaScript + MERN-to-MySQL)

### 1. High-Level Architecture Overview
```
+-------------------------------------------------------------+
|                        CLIENT TIER                          |
|                                                             |
|   +--------------------------+   +----------------------+   |
|   |   React + Vite (JS/JSX)  |   | React Native + Expo  |   |
|   |  - Tailwind CSS          |   |  - Android Target    |   |
|   |  - React Router DOM      |   |  - Expo SecureStore  |   |
|   |  - Axios API Client      |   |  - Axios API Client  |   |
|   |  - React Hook Form       |   |  - Pull-to-Refresh   |   |
|   |  - Recharts Dashboard    |   |  - React Navigation  |   |
|   |  - Restrained 240px Shell|   |  - Offline Handling  |   |
|   +--------------------------+   +----------------------+   |
+-------------------------------------------------------------+
                               | (HTTP / REST + JSON)
                               v
+-------------------------------------------------------------+
|                        SHARED API SERVER                    |
|                Node.js + Express.js (JavaScript)            |
|                                                             |
|   [ Security Middleware ]                                   |
|   - Helmet (HTTP headers protection)                        |
|   - CORS (Strict allowed origins)                           |
|   - express-rate-limit (Brute-force protection on /auth)    |
|   - Structured Request Logger (Sanitized, no secrets)       |
|                                                             |
|   [ Routing & Controllers ]                                 |
|   - auth.controller.js        (register, login, logout, me) |
|   - project.controller.js     (CRUD, search, filter, page)  |
|   - task.controller.js        (CRUD, status, priority)      |
|   - dashboard.controller.js   (Real-time SQL aggregations)  |
|                                                             |
|   [ Business Logic & Strict Authorization ]                 |
|   - Ownership enforcement (WHERE userId = ? on all queries) |
|   - IDOR prevention on every Project & Task lookup          |
|   - Input validators (explicit, readable JavaScript)        |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   DATA PERSISTENCE TIER                     |
|                                                             |
|   - MySQL Relational Database                               |
|   - mysql2/promise Connection Pool (Parameterized queries)  |
|   - Strict Foreign Keys (ON DELETE CASCADE)                 |
|     * users                                                 |
|     * projects (FK -> users.id)                             |
|     * tasks    (FK -> projects.id)                          |
|     * refresh_tokens (FK -> users.id)                       |
|     * audit_logs     (FK -> users.id)                       |
+-------------------------------------------------------------+
```

---

### 2. Relational Database Design with Raw Parameterized SQL
The developer uses `mysql2/promise` with clean, parameterized queries:
- **No SQL injection vulnerabilities**: Every variable is bound using `?` placeholders.
- **Explainable in interviews**: Clean SQL statements (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`, `COUNT`).
- **Normalized relational design**:
  - `users` table: primary key `id` (VARCHAR(36) UUID).
  - `projects` table: foreign key `userId` references `users(id)` ON DELETE CASCADE.
  - `tasks` table: foreign key `projectId` references `projects(id)` ON DELETE CASCADE.
  - `refresh_tokens` table: foreign key `userId` references `users(id)` ON DELETE CASCADE.
  - `audit_logs` table: foreign key `userId` references `users(id)` ON DELETE CASCADE.

---

### 3. Authentication & Authorization Flow
1. **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10). Plaintext passwords are never stored or logged.
2. **Access Token**: Short-lived JWT (15 minutes). Sent in the `Authorization: Bearer <token>` header.
3. **Refresh Token**: Stored hashed in the `refresh_tokens` table with expiration.
4. **IDOR & Tenancy Guard**:
   - `SELECT * FROM projects WHERE id = ? AND userId = ?`
   - `SELECT t.* FROM tasks t JOIN projects p ON t.projectId = p.id WHERE t.id = ? AND p.userId = ?`
   - If no rows match, return 404 / 403 without leaking information.

---

### 4. Client Platforms
- **Web**: React (JavaScript/JSX) + Vite + Tailwind CSS + Axios + Lucide icons.
- **Mobile**: React Native + Expo (JavaScript/JSX) + Axios + Expo SecureStore + Bottom Navigation.
- **Cross-Platform State**: Both connect to the exact same REST API and MySQL database.
