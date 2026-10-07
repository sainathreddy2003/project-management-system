import React from 'react';
import { Search, X } from 'lucide-react';

export function ProjectFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  onReset,
}) {
  const hasActiveFilters = !!search || !!status;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-surface-border rounded-md">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-graphite-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects by title or description..."
          className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-surface-muted/50 border border-surface-border rounded text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-graphite-400 hover:text-graphite-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-white border border-surface-border rounded text-graphite-700 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-white border border-surface-border rounded text-graphite-700 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="createdAt">Sort: Newest</option>
          <option value="name">Sort: Name (A-Z)</option>
          <option value="endDate">Sort: Target Due</option>
          <option value="status">Sort: Status</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-accent hover:text-accent-hover font-medium px-2 py-1 underline"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
