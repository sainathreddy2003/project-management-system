# SYSTEM ARCHITECTURE SPECIFICATION
## Full-Stack Cross-Platform Project Management System (MVC Architecture)

### 1. High-Level MVC Architecture Overview

The system is organized strictly around the **Model-View-Controller (MVC)** architectural pattern, making it intuitive to read, navigate, and explain during technical interviews:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VIEW LAYER (Presentation)                       │
│                                                                        │
│   Web (React 18 + Vite)                Android (React Native + Expo)   │
│   web/src/pages/                       mobile/src/screens/             │
│   web/src/components/                  mobile/src/components/          │
│   web/src/features/                    mobile/src/navigation/          │
│                                                                        │
│   API Response Views (JSON Presenters):                                │
│   backend/src/views/response.view.js (renderSuccess, renderError)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTP REST API (JSON)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    ROUTING & CONTROLLER LAYER                          │
│                                                                        │
│   [ Routing: backend/src/routes/ ]                                     │
│   auth.routes.js        ──>  routes to  ──>  auth.controller.js        │
│   project.routes.js     ──>  routes to  ──>  project.controller.js     │
│   task.routes.js        ──>  routes to  ──>  task.controller.js        │
│   dashboard.routes.js   ──>  routes to  ──>  dashboard.controller.js   │
│                                                                        │
│   [ Controllers: backend/src/controllers/ ]                            │
│   - Extracts parameters (req.params, req.query, req.body)              │
│   - Runs input validators (backend/src/validators/)                    │
│   - Invokes Models and sends formatted output via Views                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                             Calls Model Layer
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       MODEL LAYER (Data Logic)                         │
│                                                                        │
│   [ Models: backend/src/models/ ]                                      │
│   - user.model.js       (users table, bcrypt hash, JWT session tokens) │
│   - project.model.js    (projects table, tenant isolation, CRUD)       │
│   - task.model.js       (tasks table, relational JOIN tenancy checks)  │
│   - dashboard.model.js  (real-time aggregated SQL metrics & breakdown) │
│   - audit.model.js      (audit_logs table, system audit logging)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                        Parameterized SQL (?)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                     DATABASE TIER (Data Storage)                       │
│                                                                        │
│   - MySQL 8.0 Engine (project_management_db)                           │
│   - mysql2/promise Connection Pool                                     │
│   - 5 Normalized 3NF Tables with ON DELETE CASCADE Foreign Keys        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Directory Mapping (MVC)

| MVC Role | Folder Location | Responsibilities |
| :--- | :--- | :--- |
| **Model** (`M`) | `backend/src/models/` | Direct MySQL queries using parameterized bindings (`?`). Enforces tenancy (`WHERE userId = ?` and relational `JOIN`). |
| **View** (`V`) | `web/` (React SPA)<br/>`mobile/` (Expo App)<br/>`backend/src/views/` | User interfaces for Web and Android + backend JSON response serializers (`renderSuccess`, `renderError`). |
| **Controller** (`C`) | `backend/src/controllers/` | Orchestrates request handling, validates inputs with validators, delegates to Models, and formats output through Views. |
| **Routes** | `backend/src/routes/` | Maps HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) and paths to controller functions. |
| **Middleware** | `backend/src/middleware/` | Cross-cutting concerns: `auth.middleware.js` (JWT guard), rate limiter, helmet security headers, request logger. |
| **Validators** | `backend/src/validators/` | Request payload schema validation (e.g., date logic `endDate >= startDate`, required strings). |

---

### 3. Step-by-Step Request Lifecycle Example

When a user fetches their projects (`GET /api/projects`):
1. **Request Ingestion**: Express receives request $\to$ passes through `auth.middleware.js` (verifies JWT, attaches `req.user`).
2. **Route Match**: `project.routes.js` routes `GET /` to `project.controller.js::listProjects`.
3. **Controller Execution**:
   - `listProjects` sanitizes query parameters (`parseProjectQuery`).
   - Calls `ProjectModel.listProjects(req.user.id, queryParams)`.
4. **Model Execution**:
   - `project.model.js` executes parameterized SQL:
     ```sql
     SELECT p.*, COUNT(t.id) AS totalTasks
     FROM projects p
     LEFT JOIN tasks t ON p.id = t.projectId
     WHERE p.userId = ?
     GROUP BY p.id
     ```
   - Enforces user isolation directly at the database query level.
5. **View Presentation**:
   - Controller calls `renderSuccess(res, result.data, null, 200, result.pagination)` in `response.view.js`.
   - Sends consistent JSON payload to Web / Mobile Views.

---

### 4. Client Platforms (The Views)
- **Web View**: React 18 (pure JavaScript/JSX) + Vite + Tailwind CSS + Axios + Lucide icons + Recharts + Motion for React.
- **Mobile View**: React Native + Expo SDK 51 (pure JavaScript) + Axios + Expo SecureStore + Bottom Navigation.
- **State Synchronization**: Both clients share the exact same REST API controllers and MySQL models.
