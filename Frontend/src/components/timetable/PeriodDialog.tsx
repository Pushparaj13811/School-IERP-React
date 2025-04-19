import React, { useState } from 'react';
import Button from '../ui/Button';
import { Subject, Teacher, TimeSlot } from '../../services/timetableService';

interface PeriodDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  selectedTimeSlot: number | '';
  setSelectedTimeSlot: (timeSlotId: number | '') => void;
  selectedSubject: number | '';
  setSelectedSubject: (subjectId: number | '') => void;
  selectedTeacher: number | '';
  setSelectedTeacher: (teacherId: number | '') => void;
  onAddPeriod: () => Promise<void>;
  loading: boolean;
  timeSlots: TimeSlot[];
  subjects: Subject[];
  teachers: Teacher[];
}

const PeriodDialog: React.FC<PeriodDialogProps> = ({
  open,
  onClose,
  selectedDay,
  setSelectedDay,
  selectedTimeSlot,
  setSelectedTimeSlot,
  selectedSubject,
  setSelectedSubject,
  selectedTeacher,
  setSelectedTeacher,
  onAddPeriod,
  loading,
  timeSlots,
  subjects,
  teachers,
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!open) return null;

  const validateForm = (): boolean => {
    if (selectedTimeSlot === '') {
      setValidationError('Please select a time slot');
      return false;
    }
    
    if (selectedSubject === '') {
      setValidationError('Please select a subject');
      return false;
    }
    
    if (selectedTeacher === '') {
      setValidationError('Please select a teacher');
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await onAddPeriod();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Period</h3>
          <Button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </Button>
        </div>
        
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {validationError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot <span className="text-red-500">*</span>
            </label>
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
            {timeSlots.filter(slot => !slot.isBreak).length === 0 && (
              <div className="text-xs text-red-500 mt-1">
                No time slots available. Please add time slots first.
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
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
            {subjects.length === 0 && (
              <div className="text-xs text-red-500 mt-1">
                No subjects available.
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {teachers.length === 0 && (
              <div className="text-xs text-red-500 mt-1">
                No teachers available.
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-2">
          <Button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedTimeSlot || !selectedSubject || !selectedTeacher || loading}
            className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#292648] hover:bg-[#3b3664]'}`}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Adding...
              </span>
            ) : (
              'Add Period'    
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeriodDialog; 