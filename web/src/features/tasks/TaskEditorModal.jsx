import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { tasksApi } from '../../api/tasks.js';
import { projectsApi } from '../../api/projects.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function TaskEditorModal({
  isOpen,
  onClose,
  task = null,
  defaultProjectId = '',
  onSaved,
}) {
  const isEditing = !!task;
  const [projects, setProjects] = useState([]);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      projectId: '',
      name: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
    },
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await projectsApi.getProjects({ page: 1, pageSize: 100 });
        if (res.success && res.data) {
          setProjects(res.data);
        }
      } catch {
        // Ignore background failure
      }
    }
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      reset({
        projectId: task.projectId || defaultProjectId || '',
        name: task.name || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'PENDING',
        dueDate: task.dueDate || '',
      });
    } else {
      reset({
        projectId: defaultProjectId || (projects[0]?.id || ''),
        name: '',
        description: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      });
    }
    setServerError('');
  }, [task, defaultProjectId, projects, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setServerError('');

      let response;
      if (isEditing) {
        response = await tasksApi.updateTask(task.id, data);
      } else {
        response = await tasksApi.createTask(data);
      }

      if (response.success && response.data) {
        onSaved?.(response.data);
        onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create Task'}
      description={isEditing ? `Update status and details for ${task?.name}` : 'Assign a new task item under a project'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-medium">
            {serverError}
          </div>
        )}

        <Select
          label="Project"
          required
          options={projectOptions}
          {...register('projectId', { required: 'Please select a project.' })}
          error={errors.projectId?.message}
          disabled={isEditing || !!defaultProjectId}
        />

        <Input
          label="Task Name"
          required
          placeholder="e.g. Implement JWT middleware"
          {...register('name', { required: 'Task name is required.' })}
          error={errors.name?.message}
        />

        <Textarea
          label="Description"
          placeholder="Acceptance criteria, technical notes, or reference links..."
          rows={3}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Priority"
            required
            {...register('priority')}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
            ]}
          />

          <Select
            label="Status"
            required
            {...register('status')}
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={submitting}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
