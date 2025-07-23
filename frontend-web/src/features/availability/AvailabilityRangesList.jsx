import React, { useState, useEffect } from 'react';
import { getAvailabilityRanges, removeAvailabilityRange, generateTimeSlotsFromRanges } from '../../api/availability';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';

/**
 * Component to display and manage availability ranges
 */
const AvailabilityRangesList = ({ professionalId, onRangesChanged, showAddForm }) => {
  const [ranges, setRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Days of week mapping (Java uses 1-7 where 1=Monday)
  const daysOfWeek = {
    1: 'Monday',
    2: 'Tuesday', 
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
  };

  // Fetch availability ranges
  const fetchRanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getAvailabilityRanges(professionalId);
      setRanges(data);
    } catch (error) {
      console.error('Error fetching availability ranges:', error);
      setError('Failed to load availability ranges. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (professionalId) {
      fetchRanges();
    }
  }, [professionalId]);

  // Handle range deletion
  const handleDeleteRange = async (index) => {
    if (!window.confirm('Are you sure you want to delete this availability range?')) return;

    try {
      setIsDeleting(true);
      await removeAvailabilityRange(professionalId, index);
      toast.success('Availability range deleted successfully');
      fetchRanges();
      onRangesChanged?.();
    } catch (error) {
      console.error('Error deleting availability range:', error);
      toast.error('Failed to delete availability range');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle generating time slots
  const handleGenerateTimeSlots = async () => {
    try {
      setIsGenerating(true);
      await generateTimeSlotsFromRanges(professionalId);
      toast.success('Time slots generated successfully');
      onRangesChanged?.();
    } catch (error) {
      console.error('Error generating time slots:', error);
      toast.error('Failed to generate time slots');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    return time;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability Ranges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader size="lg" text="Loading availability ranges..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability Ranges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-error-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Availability Ranges</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchRanges} variant="primary">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Availability Ranges</CardTitle>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateTimeSlots}
            loading={isGenerating}
            disabled={isGenerating || ranges.length === 0}
          >
            Generate Time Slots
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {ranges.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No availability ranges</h3>
            <p className="text-gray-600 mb-4">
              You haven't set any availability ranges yet. Add your first range to get started.
            </p>
            <Button
              variant="primary"
              onClick={showAddForm}
            >
              Add Availability Range
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              These ranges define when you're available for appointments. Time slots will be generated based on these ranges.
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interval
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ranges.map((range, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {daysOfWeek[range.dayOfWeek] || `Day ${range.dayOfWeek}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(range.startTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(range.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {range.intervalMinutes} minutes
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteRange(index)}
                          className="text-error-600 hover:text-error-900"
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="primary"
                onClick={showAddForm}
              >
                Add Another Range
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityRangesList;