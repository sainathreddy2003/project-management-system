# DATABASE SPECIFICATION & ENTITY RELATIONSHIP (ER) DIAGRAM
## Relational Design for Project Management System (MySQL)

---

### 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "owns (1:N)"
    USERS ||--o{ REFRESH_SESSIONS : "authenticates (1:N)"
    USERS ||--o{ AUDIT_LOGS : "triggers (1:N)"
    PROJECTS ||--o{ TASKS : "contains (1:N)"

    USERS {
        VARCHAR(36) id PK "UUID"
        VARCHAR(255) fullName "User full display name"
        VARCHAR(255) email UK "Unique lowercase email address"
        VARCHAR(255) passwordHash "Bcrypt hashed password"
        DATETIME createdAt "Registration timestamp"
        DATETIME updatedAt "Account update timestamp"
    }

    PROJECTS {
        VARCHAR(36) id PK "UUID"
        VARCHAR(36) userId FK "References users(id) ON DELETE CASCADE"
        VARCHAR(255) name "Project title"
        TEXT description "Detailed project scope"
        ENUM status "NOT_STARTED, IN_PROGRESS, COMPLETED"
        DATE startDate "Target kickoff date"
        DATE endDate "Target delivery date"
        DATETIME createdAt "Creation timestamp"
        DATETIME updatedAt "Last updated timestamp"
    }

    TASKS {
        VARCHAR(36) id PK "UUID"
        VARCHAR(36) projectId FK "References projects(id) ON DELETE CASCADE"
        VARCHAR(255) name "Actionable task title"
        TEXT description "Acceptance criteria / notes"
        ENUM priority "LOW, MEDIUM, HIGH"
        ENUM status "PENDING, IN_PROGRESS, COMPLETED"
        DATE dueDate "Target completion deadline"
        DATETIME createdAt "Task creation timestamp"
        DATETIME updatedAt "Task updated timestamp"
    }

    REFRESH_SESSIONS {
        VARCHAR(36) id PK "UUID"
        VARCHAR(36) userId FK "References users(id) ON DELETE CASCADE"
        VARCHAR(255) tokenHash UK "SHA-256 hash of refresh token"
        DATETIME expiresAt "Session expiration (7 days)"
        DATETIME revokedAt "Revocation timestamp on logout/rotation"
        DATETIME createdAt "Session issuance timestamp"
    }

    AUDIT_LOGS {
        VARCHAR(36) id PK "UUID"
        VARCHAR(36) userId FK "References users(id) ON DELETE CASCADE"
        VARCHAR(100) action "Action key (REGISTER, LOGIN, CREATE_PROJECT, etc.)"
        VARCHAR(100) entityType "Target entity (User, Project, Task)"
        VARCHAR(255) entityId "UUID of modified resource"
        DATETIME createdAt "Audit event timestamp"
    }
```

---

### 2. Relational Integrity & Foreign Key Constraints

1. **User -> Project Cascade**:
   - `CONSTRAINT fk_projects_user FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE`
   - Guarantees referential integrity: Deleting a user account cleans up all associated projects.

2. **Project -> Task Cascade**:
   - `CONSTRAINT fk_tasks_project FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE`
   - When a project is deleted, all child tasks are automatically deleted. No orphaned task records can exist.

3. **User -> RefreshSession & AuditLog Cascade**:
   - Cascading deletions prevent dangling authentication sessions or orphan logs.

---

### 3. Indexing Strategy & Query Optimization

| Table | Index Name | Columns Indexed | Rationale |
|---|---|---|---|
| `users` | `PRIMARY` | `id` | Clustered primary key lookup. |
| `users` | `email` (UNIQUE) | `email` | Fast authentication queries and unique constraint enforcement. |
| `projects` | `idx_projects_user` | `userId` | Strict tenancy queries (`WHERE userId = ?`). |
| `projects` | `idx_projects_status`| `status` | Filter by status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`). |
| `projects` | `idx_projects_name` | `name` | Search bar query optimization. |
| `tasks` | `idx_tasks_project` | `projectId` | Parent-child join queries (`WHERE projectId = ?`). |
| `tasks` | `idx_tasks_status` | `status` | Kanban & status filtering (`PENDING`, `IN_PROGRESS`, `COMPLETED`). |
| `tasks` | `idx_tasks_priority`| `priority` | Priority sorting and filtering (`HIGH`, `MEDIUM`, `LOW`). |
| `tasks` | `idx_tasks_due_date`| `dueDate` | Dashboard due date & overdue calculations. |
| `refresh_sessions` | `idx_sessions_user` | `userId` | User session revocation on logout. |
| `audit_logs` | `idx_audit_user` | `userId` | User activity feeds. |
| `audit_logs` | `idx_audit_entity` | `entityType, entityId` | Entity-specific audit history lookup. |

---

### 4. Tenancy & IDOR Prevention Rules in SQL

Every SQL query in the service layer enforces ownership via parameterized inputs:
```sql
-- Safe Project Fetch
SELECT * FROM projects WHERE id = ? AND userId = ?;

-- Safe Task Fetch (Joins through parent Project)
SELECT t.* FROM tasks t
JOIN projects p ON t.projectId = p.id
WHERE t.id = ? AND p.userId = ?;
```
If 0 rows are returned, the application throws a 404/403 response immediately, preventing any unauthorized visibility or modification.
