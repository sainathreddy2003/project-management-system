# REST API DOCUMENTATION
## Shared Backend REST API Specification

**Base URL**: `http://localhost:5001/api`  
**Authentication Scheme**: Bearer JWT (`Authorization: Bearer <accessToken>`)  
**Response Format**: `application/json`

---

### Standard Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation",
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Standard Error Envelope:
```json
{
  "success": false,
  "error": "Error description message."
}
```

---

### 1. Authentication Endpoints

#### `POST /api/auth/register`
Create a new user account and receive authentication credentials.
- **Rate Limit**: 50 requests / 15 minutes.
- **Request Body**:
```json
{
  "fullName": "Alex Chen",
  "email": "alex.dev@example.com",
  "password": "Password123!"
}
```
- **Responses**:
  - `201 Created`: `{ "success": true, "data": { "user": { "id": "...", "fullName": "Alex Chen", "email": "alex.dev@example.com", "createdAt": "..." }, "accessToken": "...", "refreshToken": "..." } }`
  - `409 Conflict`: `An account with this email address already exists.`
  - `400 Bad Request`: Validation errors.

#### `POST /api/auth/login`
Authenticate with email and password.
- **Rate Limit**: 50 requests / 15 minutes.
- **Request Body**:
```json
{
  "email": "alex.dev@example.com",
  "password": "Password123!"
}
```
- **Responses**:
  - `200 OK`: Returns user profile, access token, and refresh token.
  - `401 Unauthorized`: `Invalid email or password.`

#### `POST /api/auth/refresh`
Rotate refresh token and issue a new access token.
- **Request Body**:
```json
{
  "refreshToken": "7c8e9b..."
}
```
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }`
  - `401 Unauthorized`: `Your session expired. Please sign in again.`

#### `POST /api/auth/logout`
Revoke refresh token and terminate active session.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**: `{ "refreshToken": "..." }`
- **Responses**:
  - `200 OK`: `{ "success": true, "message": "Logged out successfully." }`

#### `GET /api/auth/me`
Retrieve currently authenticated user profile.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { "id": "...", "fullName": "...", "email": "...", "createdAt": "..." } }`
  - `401 Unauthorized`: `Your session expired. Please sign in again.`

---

### 2. Project Management Endpoints

#### `GET /api/projects`
List owned projects with real-time task counts and pagination.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Query Parameters**:
  - `page`: Page index (default: `1`).
  - `pageSize`: Items per page (default: `10`, max: `100`).
  - `search`: Filter by name or description.
  - `status`: Filter by `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`.
  - `sortBy`: `name`, `status`, `startDate`, `endDate`, `createdAt` (default: `createdAt`).
  - `sortOrder`: `asc` or `desc` (default: `desc`).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "e44d32f1-...",
      "name": "Inventory ERP Modernization",
      "description": "Migrating legacy barcode inventory...",
      "status": "IN_PROGRESS",
      "startDate": "2026-09-22",
      "endDate": "2026-11-03",
      "totalTasks": 5,
      "completedTasks": 2,
      "progress": 40,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "page": 1, "pageSize": 10, "total": 4, "totalPages": 1 }
}
```

#### `POST /api/projects`
Create a new project.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
```json
{
  "name": "TechBuddy Platform",
  "description": "Collaborative developer mentor platform",
  "status": "IN_PROGRESS",
  "startDate": "2026-09-06",
  "endDate": "2026-10-20"
}
```
- **Responses**:
  - `201 Created`: Project details.
  - `400 Bad Request`: `End date must be after or equal to start date.`

#### `GET /api/projects/:id`
Retrieve project details with child tasks.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Responses**:
  - `200 OK`: Returns project metadata + child tasks array.
  - `404 Not Found`: Project not found or access denied (IDOR protection).

#### `PUT /api/projects/:id`
Update an owned project.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**: Any subset of `name`, `description`, `status`, `startDate`, `endDate`.
- **Responses**:
  - `200 OK`: Updated project object.
  - `404 Not Found`: If project does not belong to authenticated user.

#### `DELETE /api/projects/:id`
Delete project (cascades and deletes all child tasks).
- **Headers**: `Authorization: Bearer <accessToken>`
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { "id": "...", "deleted": true } }`
  - `404 Not Found`: If project does not belong to authenticated user.

---

### 3. Task Management Endpoints

#### `GET /api/tasks`
List owned tasks across all projects or within a specific project.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Query Parameters**:
  - `projectId`: Optional UUID of specific project.
  - `search`: Match on task name or description.
  - `status`: `PENDING`, `IN_PROGRESS`, `COMPLETED`.
  - `priority`: `LOW`, `MEDIUM`, `HIGH`.
  - `page`: default `1`.
  - `pageSize`: default `20`.
  - `sortBy`: `name`, `status`, `priority`, `dueDate`, `createdAt`.
  - `sortOrder`: `asc` or `desc`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c194...",
      "projectId": "e44d...",
      "projectName": "Inventory ERP Modernization",
      "name": "Implement barcode lookup optimization with MySQL indexing",
      "description": "Index high-frequency SKU queries...",
      "priority": "MEDIUM",
      "status": "PENDING",
      "dueDate": "2026-10-13",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 15, "totalPages": 1 }
}
```

#### `POST /api/tasks`
Create a task under an owned project.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**:
```json
{
  "projectId": "e44d32f1-...",
  "name": "Design real-time MySQL dashboard aggregation query",
  "description": "Calculate project completion percentage and task distribution",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "dueDate": "2026-10-07"
}
```
- **Responses**:
  - `201 Created`: Created task object.
  - `404 Not Found`: If target project does not exist or belongs to another user.

#### `PUT /api/tasks/:id`
Update task status, priority, due date, or project.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Request Body**: Any subset of `name`, `description`, `priority`, `status`, `dueDate`, `projectId`.
- **Responses**:
  - `200 OK`: Updated task object.
  - `404 Not Found`: If task does not belong to user.

#### `DELETE /api/tasks/:id`
Delete an owned task.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { "id": "...", "deleted": true } }`

---

### 4. Dashboard Endpoint

#### `GET /api/dashboard`
Aggregated operational metrics computed directly from MySQL.
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalProjects": 4,
      "projectsInProgress": 2,
      "projectsCompleted": 1,
      "projectsNotStarted": 1,
      "totalTasks": 15,
      "completedTasks": 6,
      "inProgressTasks": 4,
      "pendingTasks": 5,
      "tasksDueToday": 1,
      "overdueTasks": 0,
      "tasksDueThisWeek": 3,
      "completionPercentage": 40
    },
    "priorityBreakdown": {
      "HIGH": 6,
      "MEDIUM": 6,
      "LOW": 3
    },
    "statusBreakdown": [
      { "name": "Pending", "count": 5, "key": "PENDING", "color": "#71717A" },
      { "name": "In Progress", "count": 4, "key": "IN_PROGRESS", "color": "#D97706" },
      { "name": "Completed", "count": 6, "key": "COMPLETED", "color": "#10B981" }
    ],
    "recentProjects": [ ... ],
    "upcomingTasks": [ ... ]
  }
}
```
