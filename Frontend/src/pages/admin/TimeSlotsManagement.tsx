import React, { useState, useEffect } from 'react';
import timetableService, { TimeSlot } from '../../services/timetableService';
import TimeSlotDialog from '../../components/timetable/TimeSlotDialog';
import TimeSlotList from '../../components/timetable/TimeSlotList';
import Button from '../../components/ui/Button';

const TimeSlotsManagement: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch time slots on component mount
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const slots = await timetableService.getTimeSlots();
      // Sort by start time
      slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      showAlert('Failed to load time slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = async (startTime: string, endTime: string, isBreak: boolean, breakType: string) => {
    try {
      setFormLoading(true);
      const success = await timetableService.addTimeSlot(
        startTime,
        endTime,
        isBreak,
        isBreak ? breakType : null
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <TimeSlotList timeSlots={timeSlots} />
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