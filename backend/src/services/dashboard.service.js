import { query } from '../config/db.js';

export async function getDashboardMetrics(userId) {
  // 1. Projects overview
  const projectStats = await query(
    `SELECT 
      COUNT(*) AS totalProjects,
      SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS projectsInProgress,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS projectsCompleted,
      SUM(CASE WHEN status = 'NOT_STARTED' THEN 1 ELSE 0 END) AS projectsNotStarted
     FROM projects
     WHERE userId = ?`,
    [userId]
  );

  const totalProjects = Number(projectStats[0]?.totalProjects || 0);
  const projectsInProgress = Number(projectStats[0]?.projectsInProgress || 0);
  const projectsCompleted = Number(projectStats[0]?.projectsCompleted || 0);
  const projectsNotStarted = Number(projectStats[0]?.projectsNotStarted || 0);

  // 2. Tasks overview
  const taskStats = await query(
    `SELECT 
      COUNT(*) AS totalTasks,
      SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTasks,
      SUM(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgressTasks,
      SUM(CASE WHEN t.status = 'PENDING' THEN 1 ELSE 0 END) AS pendingTasks,
      SUM(CASE WHEN t.dueDate = CURDATE() THEN 1 ELSE 0 END) AS tasksDueToday,
      SUM(CASE WHEN t.dueDate < CURDATE() AND t.status != 'COMPLETED' THEN 1 ELSE 0 END) AS overdueTasks,
      SUM(CASE WHEN t.dueDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND t.status != 'COMPLETED' THEN 1 ELSE 0 END) AS tasksDueThisWeek
     FROM tasks t
     JOIN projects p ON t.projectId = p.id
     WHERE p.userId = ?`,
    [userId]
  );

  const totalTasks = Number(taskStats[0]?.totalTasks || 0);
  const completedTasks = Number(taskStats[0]?.completedTasks || 0);
  const inProgressTasks = Number(taskStats[0]?.inProgressTasks || 0);
  const pendingTasks = Number(taskStats[0]?.pendingTasks || 0);
  const tasksDueToday = Number(taskStats[0]?.tasksDueToday || 0);
  const overdueTasks = Number(taskStats[0]?.overdueTasks || 0);
  const tasksDueThisWeek = Number(taskStats[0]?.tasksDueThisWeek || 0);

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 3. Priority breakdown for real charts
  const priorityRows = await query(
    `SELECT t.priority, COUNT(*) AS count
     FROM tasks t
     JOIN projects p ON t.projectId = p.id
     WHERE p.userId = ?
     GROUP BY t.priority`,
    [userId]
  );

  const priorityBreakdown = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  priorityRows.forEach((r) => {
    priorityBreakdown[r.priority] = Number(r.count);
  });

  // 4. Status breakdown for charts
  const statusBreakdown = [
    { name: 'Pending', count: pendingTasks, key: 'PENDING', color: '#71717A' },
    { name: 'In Progress', count: inProgressTasks, key: 'IN_PROGRESS', color: '#D97706' },
    { name: 'Completed', count: completedTasks, key: 'COMPLETED', color: '#10B981' },
  ];

  // 5. Recent projects
  const recentProjectsRows = await query(
    `SELECT 
      p.id,
      p.name,
      p.status,
      DATE_FORMAT(p.endDate, '%Y-%m-%d') AS endDate,
      p.updatedAt,
      COUNT(t.id) AS totalTasks,
      COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completedTasks
     FROM projects p
     LEFT JOIN tasks t ON p.id = t.projectId
     WHERE p.userId = ?
     GROUP BY p.id
     ORDER BY p.updatedAt DESC
     LIMIT 4`,
    [userId]
  );

  const recentProjects = recentProjectsRows.map((r) => {
    const pTotal = Number(r.totalTasks || 0);
    const pCompleted = Number(r.completedTasks || 0);
    return {
      id: r.id,
      name: r.name,
      status: r.status,
      endDate: r.endDate,
      totalTasks: pTotal,
      completedTasks: pCompleted,
      progress: pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0,
    };
  });

  // 6. Upcoming urgent tasks
  const upcomingTasks = await query(
    `SELECT 
      t.id,
      t.projectId,
      p.name AS projectName,
      t.name,
      t.priority,
      t.status,
      DATE_FORMAT(t.dueDate, '%Y-%m-%d') AS dueDate
     FROM tasks t
     JOIN projects p ON t.projectId = p.id
     WHERE p.userId = ? AND t.status != 'COMPLETED'
     ORDER BY 
       CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
       COALESCE(t.dueDate, '9999-12-31') ASC
     LIMIT 5`,
    [userId]
  );

  return {
    metrics: {
      totalProjects,
      projectsInProgress,
      projectsCompleted,
      projectsNotStarted,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      tasksDueToday,
      overdueTasks,
      tasksDueThisWeek,
      completionPercentage,
    },
    priorityBreakdown,
    statusBreakdown,
    recentProjects,
    upcomingTasks,
  };
}
