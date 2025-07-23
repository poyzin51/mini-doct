import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { timeSlotSchema } from '../../utils/validators';
import { addTimeSlot, addMultipleTimeSlots, generateRecurringTimeSlots } from '../../api/availability';
import { formatForAPI, combineDateAndTime } from '../../utils/dateUtils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

/**
 * Time slot form component for adding availability
 */
const TimeSlotForm = ({ professionalId, onSlotsAdded, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' or 'recurring'

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(timeSlotSchema),
    defaultValues: {
      date: '',
      startTime: '09:00',
      endTime: '17:00',
    },
  });

  // Recurring form state
  const [recurringConfig, setRecurringConfig] = useState({
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    startTime: '09:00',
    endTime: '17:00',
    intervalMinutes: 30,
  });

  // Days of week options
  const daysOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  // Handle single time slot submission
  const onSubmitSingle = async (data) => {
    try {
      setIsSubmitting(true);

      // Combine date and time
      const dateTime = combineDateAndTime(data.date, data.startTime);
      if (!dateTime) {
        toast.error('Invalid date or time');
        return;
      }

      // Format for API
      const timeSlot = formatForAPI(dateTime);
      
      // Add time slot
      await addTimeSlot(professionalId, timeSlot);
      
      toast.success('Time slot added successfully');
      onSlotsAdded?.();
      reset();
      onClose?.();
    } catch (error) {
      console.error('Error adding time slot:', error);
      toast.error(error.data?.message || 'Failed to add time slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle recurring time slots submission
  const onSubmitRecurring = async () => {
    try {
      setIsSubmitting(true);

      // Validate recurring config
      if (!recurringConfig.startDate || !recurringConfig.endDate) {
        toast.error('Please select start and end dates');
        return;
      }

      if (recurringConfig.daysOfWeek.length === 0) {
        toast.error('Please select at least one day of the week');
        return;
      }

      if (recurringConfig.startTime >= recurringConfig.endTime) {
        toast.error('End time must be after start time');
        return;
      }

      // Generate time slots
      const timeSlots = generateRecurringTimeSlots({
        startDate: new Date(recurringConfig.startDate),
        endDate: new Date(recurringConfig.endDate),
        daysOfWeek: recurringConfig.daysOfWeek,
        startTime: recurringConfig.startTime,
        endTime: recurringConfig.endTime,
        intervalMinutes: recurringConfig.intervalMinutes,
      });

      if (timeSlots.length === 0) {
        toast.error('No time slots generated. Please check your configuration.');
        return;
      }

      if (timeSlots.length > 100) {
        if (!window.confirm(`This will create ${timeSlots.length} time slots. Continue?`)) {
          return;
        }
      }

      // Add multiple time slots
      await addMultipleTimeSlots(professionalId, timeSlots);
      
      toast.success(`${timeSlots.length} time slots added successfully`);
      onSlotsAdded?.();
      
      // Reset recurring config
      setRecurringConfig({
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        startTime: '09:00',
        endTime: '17:00',
        intervalMinutes: 30,
      });
      
      onClose?.();
    } catch (error) {
      console.error('Error adding recurring time slots:', error);
      toast.error(error.data?.message || 'Failed to add time slots');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle day of week selection
  const handleDayOfWeekChange = (dayValue, checked) => {
    setRecurringConfig(prev => ({
      ...prev,
      daysOfWeek: checked
        ? [...prev.daysOfWeek, dayValue]
        : prev.daysOfWeek.filter(day => day !== dayValue),
    }));
  };

  // Handle recurring config change
  const handleRecurringConfigChange = (field, value) => {
    setRecurringConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Time Slots</CardTitle>
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
        
        {/* Mode Toggle */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              mode === 'single'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Single Slot
          </button>
          <button
            type="button"
            onClick={() => setMode('recurring')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              mode === 'recurring'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recurring Slots
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {mode === 'single' ? (
          // Single Time Slot Form
          <form onSubmit={handleSubmit(onSubmitSingle)} className="space-y-4">
            <Input
              label="Date"
              type="date"
              required
              {...register('date')}
              error={errors.date?.message}
              min={new Date().toISOString().split('T')[0]}
            />

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
                Add Time Slot
              </Button>
            </div>
          </form>
        ) : (
          // Recurring Time Slots Form
          <div className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-error-500">*</span>
                </label>
                <input
                  type="date"
                  value={recurringConfig.startDate}
                  onChange={(e) => handleRecurringConfigChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-error-500">*</span>
                </label>
                <input
                  type="date"
                  value={recurringConfig.endDate}
                  onChange={(e) => handleRecurringConfigChange('endDate', e.target.value)}
                  min={recurringConfig.startDate || new Date().toISOString().split('T')[0]}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Days of Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Days of Week <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeekOptions.map((day) => (
                  <label key={day.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={recurringConfig.daysOfWeek.includes(day.value)}
                      onChange={(e) => handleDayOfWeekChange(day.value, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-error-500">*</span>
                </label>
                <input
                  type="time"
                  value={recurringConfig.startTime}
                  onChange={(e) => handleRecurringConfigChange('startTime', e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-error-500">*</span>
                </label>
                <input
                  type="time"
                  value={recurringConfig.endTime}
                  onChange={(e) => handleRecurringConfigChange('endTime', e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interval (minutes)
              </label>
              <select
                value={recurringConfig.intervalMinutes}
                onChange={(e) => handleRecurringConfigChange('intervalMinutes', parseInt(e.target.value))}
                className="input"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>

            {/* Preview */}
            {recurringConfig.startDate && recurringConfig.endDate && recurringConfig.daysOfWeek.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
                <p className="text-sm text-blue-700">
                  This will create approximately{' '}
                  <span className="font-medium">
                    {(() => {
                      try {
                        const slots = generateRecurringTimeSlots({
                          startDate: new Date(recurringConfig.startDate),
                          endDate: new Date(recurringConfig.endDate),
                          daysOfWeek: recurringConfig.daysOfWeek,
                          startTime: recurringConfig.startTime,
                          endTime: recurringConfig.endTime,
                          intervalMinutes: recurringConfig.intervalMinutes,
                        });
                        return slots.length;
                      } catch {
                        return 0;
                      }
                    })()}
                  </span>{' '}
                  time slots.
                </p>
              </div>
            )}

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
                type="button"
                variant="primary"
                onClick={onSubmitRecurring}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Add Time Slots
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotForm;