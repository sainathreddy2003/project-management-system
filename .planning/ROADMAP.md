# GSD DEVELOPMENT ROADMAP
## Project Management System (Web + Android + MySQL + REST API)

### Milestone 1: Foundation & Relational Schema (Phases 1-2)
- [x] Phase 1: Establish architecture, design system specification, and repository layout.
- [x] Phase 2: Set up MySQL database, relational schema, migrations, and software-domain seed script.

### Milestone 2: Backend Core & Security (Phases 3-7)
- [x] Phase 3: Implement Authentication (register, login, logout, me, bcrypt, JWT, rate-limiting).
- [x] Phase 4: Implement Authorization & Strict Ownership (IDOR guard on projects & tasks).
- [x] Phase 5: Implement Project Management APIs (CRUD, search, status filter, pagination, sorting).
- [x] Phase 6: Implement Task Management APIs (CRUD, status, priority, due dates, project association).
- [x] Phase 7: Implement Real-time Dashboard API (SQL aggregations for metrics, completion rate, overdue tasks).
- [x] Phase 7B: Automated integration tests & IDOR attack coverage (100% pass on 21 test assertions).

### Milestone 3: Web Application (Phases 8-14)
- [ ] Phase 8: Scaffold Web App (Vite, React, JavaScript/JSX, Tailwind CSS, IBM Plex typography, AppShell with 240px sidebar).
- [ ] Phase 9: Web Authentication UI (Login, Register, Session Expiry handling, Auth guard).
- [ ] Phase 10: Web Projects Management UI (Data table, search, status filter, project editor modal, delete modal).
- [ ] Phase 11: Web Tasks Management UI (Task table, status toggle, priority badges, task editor modal, project task view).
- [ ] Phase 12: Web Dashboard UI (Metric cards, project status distribution, upcoming tasks, overdue alerts, Recharts).
- [ ] Phase 13: Search, Filter, Sort, and Pagination controls on Web.
- [ ] Phase 14: Comprehensive Loading, Error, and Empty states with actionable recovery.

### Milestone 4: Mobile Android Application (Phases 15-16)
- [ ] Phase 15: Scaffold React Native Expo Android application with Expo SecureStore & bottom navigation.
- [ ] Phase 16: Connect Mobile to shared REST API (Auth, Dashboard, Projects, Tasks, Pull-to-refresh, Offline banner).

### Milestone 5: Verification, Quality Assurance & Delivery (Phases 17-23)
- [ ] Phase 17: Security hardening (Helmet, CORS, rate limiting, audit log, zero sensitive data in logs).
- [ ] Phase 18: Browser testing and responsive validation.
- [ ] Phase 19: Mobile offline/error and session expiration validation.
- [ ] Phase 20: Database ER diagram (`docs/database.md`) and API documentation (`docs/api.md`).
- [ ] Phase 21: Comprehensive README.md and .env.example.
- [ ] Phase 22: Final Anti-Slop & SDE interview review.
