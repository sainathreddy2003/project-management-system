import React, { useState } from 'react';
import { tasksApi } from '../../api/tasks.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { AlertTriangle } from 'lucide-react';

export function DeleteTaskDialog({ isOpen, onClose, task, onDeleted }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!task) return null;

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      setError('');
      await tasksApi.deleteTask(task.id);
      onDeleted?.(task.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Task"
      description="This action cannot be undone."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-medium">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Confirm task removal</p>
            <p className="mt-0.5 text-amber-800">
              Are you sure you want to permanently delete task <strong className="font-semibold">{task.name}</strong>?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={submitting}
          >
            Delete Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
