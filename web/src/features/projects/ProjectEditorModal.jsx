import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { projectsApi } from '../../api/projects.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

export function ProjectEditorModal({ isOpen, onClose, project = null, onSaved }) {
  const isEditing = !!project;
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      status: 'NOT_STARTED',
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'NOT_STARTED',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'NOT_STARTED',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
      });
    }
    setServerError('');
  }, [project, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setServerError('');

      let response;
      if (isEditing) {
        response = await projectsApi.updateProject(project.id, data);
      } else {
        response = await projectsApi.createProject(data);
      }

      if (response.success && response.data) {
        onSaved?.(response.data);
        onClose();
      }
    } catch (err) {
      setServerError(err.message || 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      description={isEditing ? `Modify details for ${project?.name}` : 'Set up a new workspace initiative'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded font-medium">
            {serverError}
          </div>
        )}

        <Input
          label="Project Name"
          required
          placeholder="e.g. Inventory ERP Modernization"
          {...register('name', { required: 'Project name is required.' })}
          error={errors.name?.message}
        />

        <Textarea
          label="Description"
          placeholder="Detailed scope, technical requirements, or milestones..."
          rows={3}
          {...register('description')}
          error={errors.description?.message}
        />

        <Select
          label="Status"
          required
          {...register('status')}
          options={[
            { value: 'NOT_STARTED', label: 'Not Started' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />
          <Input
            label="Target End Date"
            type="date"
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={submitting}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
