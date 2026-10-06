import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <span className="font-mono text-4xl font-semibold text-accent">404</span>
      <h2 className="text-base font-semibold text-graphite-900 mt-2">Page Not Found</h2>
      <p className="text-xs text-graphite-500 max-w-sm mt-1 mb-5">
        The workspace path you requested does not exist or may have been relocated.
      </p>
      <Link to="/dashboard">
        <Button size="sm">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
