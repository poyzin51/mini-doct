import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addAvailabilityRange, generateTimeSlotsFromRanges } from '../../api/availability';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

// Validation schema
const availabilityRangeSchema = yup.object({
  dayOfWeek: yup.number().required('Day of week is required').min(1).max(7),
  startTime: yup
    .string()
    .required('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
  endTime: yup
    .string()
    .required('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)')
    .test('is-after-start', 'End time must be after start time', function(value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = value.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      return endMinutes > startMinutes;
    }),
  intervalMinutes: yup
    .number()
    .required('Interval is required')
    .min(5, 'Interval must be at least 5 minutes')
    .max(120, 'Interval must be at most 120 minutes'),
});

/**
 * Availability range form component
 */
const AvailabilityRangeForm = ({ professionalId, onRangeAdded, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateSlots, setGenerateSlots] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(availabilityRangeSchema),
    defaultValues: {
      dayOfWeek: 1, // Monday (Java uses 1-7, where 1=Monday)
      startTime: '09:00',
      endTime: '17:00',
      intervalMinutes: 30,
    },
  });

  // Days of week options (Java uses 1-7 where 1=Monday)
  const daysOfWeekOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ];

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Convert form data to match backend expectations
      const rangeData = {
        dayOfWeek: data.dayOfWeek, // Java DayOfWeek enum uses 1-7
        startTime: data.startTime,
        endTime: data.endTime,
        intervalMinutes: parseInt(data.intervalMinutes),
      };

      // Add availability range
      const updatedProfessional = await addAvailabilityRange(professionalId, rangeData);
      
      // Generate time slots if requested
      if (generateSlots) {
        await generateTimeSlotsFromRanges(professionalId);
        toast.success('Availability range added and time slots generated');
      } else {
        toast.success('Availability range added');
      }
      
      onRangeAdded?.();
      reset();
      onClose?.();
    } catch (error) {
      console.error('Error adding availability range:', error);
      toast.error(error.response?.data?.message || 'Failed to add availability range');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Availability Range</CardTitle>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Day of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week <span className="text-error-500">*</span>
            </label>
            <select
              {...register('dayOfWeek')}
              className="input"
            >
              {daysOfWeekOptions.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
            {errors.dayOfWeek && (
              <p className="text-sm text-error-600 mt-1">{errors.dayOfWeek.message}</p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              required
              {...register('startTime')}
              error={errors.startTime?.message}
            />

            <Input
              label="End Time"
              type="time"
              required
              {...register('endTime')}
              error={errors.endTime?.message}
            />
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interval (minutes) <span className="text-error-500">*</span>
            </label>
            <select
              {...register('intervalMinutes')}
              className="input"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
            {errors.intervalMinutes && (
              <p className="text-sm text-error-600 mt-1">{errors.intervalMinutes.message}</p>
            )}
          </div>

          {/* Generate Slots Option */}
          <div className="flex items-center">
            <input
              id="generateSlots"
              type="checkbox"
              checked={generateSlots}
              onChange={(e) => setGenerateSlots(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="generateSlots" className="ml-2 block text-sm text-gray-900">
              Generate time slots immediately
            </label>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              This will create a recurring availability pattern. Time slots will be generated for the next 4 weeks.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            {onClose && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Add Availability Range
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AvailabilityRangeForm;