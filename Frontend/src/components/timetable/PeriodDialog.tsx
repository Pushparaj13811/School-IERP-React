import React, { useState, useEffect } from 'react';
import { Subject, Teacher, TimeSlot } from '../../services/timetableService';
import Button from '../ui/Button';

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
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setValidationError(null);
    }
  }, [open]);

  // Clear values when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedDay(1);
      setSelectedTimeSlot('');
      setSelectedSubject('');
      setSelectedTeacher('');
      setValidationError(null);
    }
  }, [open]);

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
      await onAdd(
        selectedDay,
        Number(selectedTimeSlot),
        Number(selectedSubject),
        Number(selectedTeacher)
      );
    }
  };

  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(Number(e.target.value));
    setValidationError(null);
  };

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeSlot(e.target.value === '' ? '' : Number(e.target.value));
    setValidationError(null);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value === '' ? '' : Number(e.target.value));
    setValidationError(null);
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeacher(e.target.value === '' ? '' : Number(e.target.value));
    setValidationError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Period</h3>
          <Button onClick={onClose} variant="danger">
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
              onChange={handleDayChange}
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
            <div className="text-xs text-gray-500 mt-1">
              You are adding a period for {getDayName(selectedDay)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTimeSlot}
              onChange={handleTimeSlotChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError && selectedTimeSlot === '' ? 'border-red-500' : 'border-gray-300'
              }`}
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
              onChange={handleSubjectChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError && selectedSubject === '' ? 'border-red-500' : 'border-gray-300'
              }`}
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
              onChange={handleTeacherChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError && selectedTeacher === '' ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.email ? `(${teacher.email})` : ''}
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
            variant="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedTimeSlot || !selectedSubject || !selectedTeacher || loading}
            variant="primary"
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