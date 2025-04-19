import React, { useState } from 'react';
import { Subject, Teacher, TimeSlot } from '../../services/timetableService';

interface PeriodDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (dayOfWeek: number, timeSlotId: number, subjectId: number, teacherId: number) => Promise<void>;
  loading: boolean;
  timeSlots: TimeSlot[];
  subjects: Subject[];
  teachers: Teacher[];
}

const PeriodDialog: React.FC<PeriodDialogProps> = ({
  open,
  onClose,
  onAdd,
  loading,
  timeSlots,
  subjects,
  teachers,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');

  if (!open) return null;

  const handleSubmit = async () => {
    if (
      typeof selectedDay === 'number' &&
      selectedTimeSlot !== '' &&
      selectedSubject !== '' &&
      selectedTeacher !== ''
    ) {
      await onAdd(
        selectedDay,
        Number(selectedTimeSlot),
        Number(selectedSubject),
        Number(selectedTeacher)
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Period</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
              <option value={0}>Sunday</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Time Slot</option>
              {timeSlots
                .filter((slot) => !slot.isBreak)
                .map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedTimeSlot || !selectedSubject || !selectedTeacher || loading}
            className={`px-4 py-2 rounded-md text-white ${
              !selectedTimeSlot || !selectedSubject || !selectedTeacher || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#292648] hover:bg-[#3b3664]'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Adding...
              </span>
            ) : (
              'Add Period'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeriodDialog; 