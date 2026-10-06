import React from 'react';
import { FolderGit2 } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#FAF9F5] text-graphite-900 font-sans">
      <div className="w-full max-w-sm">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-accent text-white shadow-xs mb-3">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-graphite-900">{title}</h1>
          {subtitle && <p className="text-xs text-graphite-500 mt-1">{subtitle}</p>}
        </div>

        {/* Card */}
        <div className="bg-white border border-surface-border rounded-lg shadow-sm p-6">
          {children}
        </div>

        {/* Footer subtle copy */}
        <p className="text-center text-[11px] text-graphite-400 mt-6 font-mono">
          PMS &bull; MySQL Relational Architecture
        </p>
      </div>
    </div>
  );
}
