import { v4 as uuidv4 } from 'uuid';
import { pool, initDatabase, query, execute } from '../config/db.js';
import { hashPassword } from '../utils/password.js';

async function seed() {
  console.log('[SEED] Ensuring database schema is up-to-date...');
  await initDatabase();

  console.log('[SEED] Cleaning existing seed data...');
  // We can delete test users which will cascade delete their projects, tasks, sessions, and logs
  const testEmails = ['alex.dev@example.com', 'jordan.qa@example.com'];
  for (const email of testEmails) {
    await execute('DELETE FROM users WHERE email = ?', [email]);
  }

  console.log('[SEED] Creating primary demo user: alex.dev@example.com ...');
  const alexId = uuidv4();
  const alexPasswordHash = await hashPassword('Password123!');
  await execute(
    'INSERT INTO users (id, fullName, email, passwordHash) VALUES (?, ?, ?, ?)',
    [alexId, 'Alex Chen', 'alex.dev@example.com', alexPasswordHash]
  );

  console.log('[SEED] Creating secondary IDOR verification user: jordan.qa@example.com ...');
  const jordanId = uuidv4();
  const jordanPasswordHash = await hashPassword('Password123!');
  await execute(
    'INSERT INTO users (id, fullName, email, passwordHash) VALUES (?, ?, ?, ?)',
    [jordanId, 'Jordan Taylor', 'jordan.qa@example.com', jordanPasswordHash]
  );

  // Jordan's private project (for IDOR testing)
  const jordanProjectId = uuidv4();
  await execute(
    `INSERT INTO projects (id, userId, name, description, status, startDate, endDate)
     VALUES (?, ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY))`,
    [
      jordanProjectId,
      jordanId,
      'Internal QA Audit & Compliance',
      'Confidential compliance report and vulnerability scanning metrics.',
      'IN_PROGRESS',
    ]
  );
  const jordanTaskId = uuidv4();
  await execute(
    `INSERT INTO tasks (id, projectId, name, description, priority, status, dueDate)
     VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 3 DAY))`,
    [
      jordanTaskId,
      jordanProjectId,
      'Audit token leakage in access logs',
      'Verify that authorization headers are never logged.',
      'HIGH',
      'IN_PROGRESS',
    ]
  );

  // Helper date functions
  const today = new Date();
  const formatDate = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().slice(0, 10);
  };

  // Alex's projects
  const projects = [
    {
      id: uuidv4(),
      userId: alexId,
      name: 'Inventory ERP Modernization',
      description: 'Migrating legacy barcode inventory modules to real-time sync with POS billing and low-stock notification triggers.',
      status: 'IN_PROGRESS',
      startDate: formatDate(-14),
      endDate: formatDate(28),
      tasks: [
        {
          name: 'Implement JWT middleware and session revocation',
          description: 'Authenticate requests with 15-minute access tokens and handle refresh token rotation.',
          priority: 'HIGH',
          status: 'COMPLETED',
          dueDate: formatDate(-5),
        },
        {
          name: 'Build project & task relational API endpoints',
          description: 'Construct REST endpoints enforcing strict tenant isolation with parameterized SQL.',
          priority: 'HIGH',
          status: 'COMPLETED',
          dueDate: formatDate(-2),
        },
        {
          name: 'Design real-time MySQL dashboard aggregation query',
          description: 'Calculate project completion percentage and task distribution without client-side calculation.',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          dueDate: formatDate(1), // Tomorrow
        },
        {
          name: 'Implement barcode lookup optimization with MySQL indexing',
          description: 'Index high-frequency SKU queries to keep lookup latency under 5ms.',
          priority: 'MEDIUM',
          status: 'PENDING',
          dueDate: formatDate(7),
        },
        {
          name: 'Connect low-stock alert webhook service',
          description: 'Fire background webhook notifications when quantity reaches reorder threshold.',
          priority: 'LOW',
          status: 'PENDING',
          dueDate: formatDate(14),
        },
      ],
    },
    {
      id: uuidv4(),
      userId: alexId,
      name: 'TechBuddy Platform',
      description: 'Collaborative developer mentor platform featuring live code review requests, session bookings, and feedback scorecards.',
      status: 'IN_PROGRESS',
      startDate: formatDate(-30),
      endDate: formatDate(14),
      tasks: [
        {
          name: 'Configure Express security headers with Helmet and CORS',
          description: 'Lock down allowed origins and prevent cross-site framing.',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          dueDate: formatDate(-10),
        },
        {
          name: 'Implement multi-column task search and status filter',
          description: 'Filter tasks by project, priority, and status using database queries with pagination.',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          dueDate: formatDate(0), // Today
        },
        {
          name: 'Create responsive task table with priority badges',
          description: 'Build dense, scannable UI matching modern engineering tool standards.',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          dueDate: formatDate(3),
        },
        {
          name: 'Write authorization and IDOR protection tests',
          description: 'Ensure User A cannot read, update, or delete User B projects or tasks.',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: formatDate(5),
        },
      ],
    },
    {
      id: uuidv4(),
      userId: alexId,
      name: 'Campus Placement Tracker',
      description: 'Student interview progress pipeline tracking OA clearance, technical rounds, and offer letter verifications.',
      status: 'COMPLETED',
      startDate: formatDate(-60),
      endDate: formatDate(-7),
      tasks: [
        {
          name: 'Normalize placement schema and foreign key constraints',
          description: 'Define relational schema with CASCADE rules and clustered indexes.',
          priority: 'HIGH',
          status: 'COMPLETED',
          dueDate: formatDate(-35),
        },
        {
          name: 'Implement student resume verification workflow',
          description: 'Parse PDF resumes and record verification timestamps in audit logs.',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          dueDate: formatDate(-20),
        },
        {
          name: 'Deploy staging build to cloud provider',
          description: 'Validate environment variables and health check endpoint on managed instance.',
          priority: 'HIGH',
          status: 'COMPLETED',
          dueDate: formatDate(-7),
        },
      ],
    },
    {
      id: uuidv4(),
      userId: alexId,
      name: 'Mobile Task Sync',
      description: 'Cross-platform mobile companion using React Native Expo with SecureStore hardware token persistence and pull-to-refresh.',
      status: 'NOT_STARTED',
      startDate: formatDate(1),
      endDate: formatDate(30),
      tasks: [
        {
          name: 'Set up Expo SecureStore token interceptor',
          description: 'Persist tokens securely in mobile keychain instead of AsyncStorage.',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: formatDate(4),
        },
        {
          name: 'Build mobile task creation modal with status pickers',
          description: 'Comfortable touch targets for creating tasks on Android devices.',
          priority: 'MEDIUM',
          status: 'PENDING',
          dueDate: formatDate(8),
        },
        {
          name: 'Implement offline network failure banner and retry mechanism',
          description: 'Display polite offline banner without crashing or showing false empty states.',
          priority: 'MEDIUM',
          status: 'PENDING',
          dueDate: formatDate(12),
        },
      ],
    },
  ];

  for (const proj of projects) {
    await execute(
      `INSERT INTO projects (id, userId, name, description, status, startDate, endDate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [proj.id, proj.userId, proj.name, proj.description, proj.status, proj.startDate, proj.endDate]
    );

    for (const t of proj.tasks) {
      const taskId = uuidv4();
      await execute(
        `INSERT INTO tasks (id, projectId, name, description, priority, status, dueDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [taskId, proj.id, t.name, t.description, t.priority, t.status, t.dueDate]
      );
    }
  }

  console.log('[SEED] Seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Primary Demo Credentials:');
  console.log('Email:    alex.dev@example.com');
  console.log('Password: Password123!');
  console.log('--------------------------------------------------');
  console.log('Secondary (IDOR Test) Credentials:');
  console.log('Email:    jordan.qa@example.com');
  console.log('Password: Password123!');
  console.log('--------------------------------------------------');
}

seed()
  .catch((err) => {
    console.error('[SEED] Error running seed script:', err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
