import React, { useState, useEffect } from 'react';
import timetableService, { TimeSlot } from '../../services/timetableService';
import TimeSlotDialog from '../../components/timetable/TimeSlotDialog';
import TimeSlotList from '../../components/timetable/TimeSlotList';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const TimeSlotsManagement: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch time slots on component mount
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching time slots...");
      
      const slots = await timetableService.getTimeSlots();
      console.log("Time slots received:", slots);
      
      if (Array.isArray(slots)) {
        // Sort by start time
        slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
        setTimeSlots(slots);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      showAlert('Failed to load time slots', 'error');
      setError('There was an error loading time slots. The API might be unavailable or experiencing issues.');
      // Still show empty list instead of spinner on error
      setTimeSlots([]);
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  const handleAddTimeSlot = async (startTime: string, endTime: string, isBreak: boolean, breakType: string | null) => {
    try {
      setFormLoading(true);
      setError(null);
      
      console.log('TimeSlotsManagement received:', { startTime, endTime, isBreak, breakType });
      
      // Basic validation
      if (!startTime || !endTime) {
        showAlert('Start time and end time are required', 'error');
        setFormLoading(false);
        return;
      }
      
      // For break periods, breakType is required
      if (isBreak && (breakType === null || breakType === undefined || breakType === '')) {
        showAlert('Break type is required for break periods', 'error');
        setFormLoading(false);
        return;
      }
      
      // For class periods, breakType should be null
      const finalBreakType = isBreak ? breakType : null;
      
      console.log('Calling timetableService.addTimeSlot with:', { 
        startTime, 
        endTime, 
        isBreak, 
        breakType: finalBreakType 
      });
      
      const success = await timetableService.addTimeSlot(
        startTime,
        endTime,
        isBreak,
        finalBreakType
      );

      if (success) {
        await fetchTimeSlots(); // Refresh the list
        setDialogOpen(false);
        showAlert('Time slot added successfully', 'success');
      } else {
        showAlert('Failed to add time slot', 'error');
      }
    } catch (error) {
      console.error('Error adding time slot:', error);
      showAlert('Failed to add time slot', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  return (
    <div className="p-4 bg-[#EEF5FF]">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Time Slots Management</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Time Slots</h2>
          <Button 
            variant="primary"
            onClick={() => setDialogOpen(true)}
            className="flex items-center"
          >
            <span className="mr-1">+</span> Add Time Slot
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium mb-2">Error</p>
            <p>{error}</p>
            <Button 
              variant="primary"
              onClick={fetchTimeSlots}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p className="mb-4">No time slots available yet.</p>
            <p>Click the "Add Time Slot" button to create your first time slot.</p>
          </div>
        ) : (
          <TimeSlotList 
            timeSlots={timeSlots} 
            isAdmin={true}
            onDelete={async (timeSlotId) => {
              try {
                const success = await timetableService.deleteTimeSlot(timeSlotId);
                if (success) {
                  await fetchTimeSlots(); // Refresh the list
                  showAlert('Time slot deleted successfully', 'success');
                }
              } catch (error) {
                console.error('Error deleting time slot:', error);
                showAlert('Failed to delete time slot', 'error');
              }
            }}
          />
        )}
      </div>

      {/* Add Time Slot Dialog */}
      <TimeSlotDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddTimeSlot}
        loading={formLoading}
      />

      {/* Alert notification */}
      {alert && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
            alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <div className="flex justify-between items-center">
            <span>{alert.message}</span>
            <Button 
              variant="outline" 
              onClick={() => setAlert(null)} 
              className="ml-2 py-1 px-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotsManagement; 