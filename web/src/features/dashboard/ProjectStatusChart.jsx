import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export function ProjectStatusChart({ statusBreakdown = [], priorityBreakdown = {} }) {
  const shouldReduceMotion = useReducedMotion();
  const hasData = statusBreakdown.some((s) => s.count > 0);

  const priorityData = [
    { name: 'High', count: priorityBreakdown.HIGH || 0, color: '#BE123C' },
    { name: 'Medium', count: priorityBreakdown.MEDIUM || 0, color: '#D97706' },
    { name: 'Low', count: priorityBreakdown.LOW || 0, color: '#64748B' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Task Status Distribution */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 bg-white border border-surface-border rounded-md shadow-xs hover:border-zinc-300 transition-colors"
      >
        <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2.5">
          <h4 className="text-xs font-semibold text-graphite-900 font-mono uppercase tracking-wider">
            Task Status Distribution
          </h4>
          <span className="text-[11px] text-graphite-500 font-mono">Live SQL Aggregation</span>
        </div>

        {!hasData ? (
          <div className="h-44 flex items-center justify-center text-xs text-graphite-400 italic">
            No task records available for status breakdown
          </div>
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#71717A' }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#18181B' }} />
                <Tooltip
                  cursor={{ fill: '#F4F3EE' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E4E4E7',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={!shouldReduceMotion}
                  animationDuration={700}
                  animationEasing="ease-out"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#C2410C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Task Priority Distribution */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 bg-white border border-surface-border rounded-md shadow-xs hover:border-zinc-300 transition-colors"
      >
        <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2.5">
          <h4 className="text-xs font-semibold text-graphite-900 font-mono uppercase tracking-wider">
            Task Priority Load
          </h4>
          <span className="text-[11px] text-graphite-500 font-mono">Workload Intensity</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#18181B' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#71717A' }} />
              <Tooltip
                cursor={{ fill: '#F4F3EE' }}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E4E4E7',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                isAnimationActive={!shouldReduceMotion}
                animationDuration={700}
                animationEasing="ease-out"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-priority-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
