import React from 'react';
import Button from '../ui/Button';
import { ClassTeacherAssignment, Timetable, Period, TimeSlot } from '../../services/timetableService';
import TimetableGrid from './TimetableGrid';

interface TimetableRow {
  timeSlot: TimeSlot;
  [key: string]: Period | TimeSlot | null;
}

interface ClassTeacherManagerProps {
  isClassTeacher: boolean;
  classTeacherAssignments: ClassTeacherAssignment[];
  selectedAssignment: ClassTeacherAssignment | null;
  timetable: Timetable | null;
  loading: boolean;
  periodGrid: TimetableRow[] | null;
  onAssignmentChange: (assignmentId: number) => Promise<void>;
  onCreateTimetable: () => Promise<void>;
  onOpenPeriodDialog: () => void;
  onDeletePeriod: (periodId: number) => Promise<void>;
}

const ClassTeacherManager: React.FC<ClassTeacherManagerProps> = ({
  isClassTeacher,
  classTeacherAssignments,
  selectedAssignment,
  timetable,
  loading,
  periodGrid,
  onAssignmentChange,
  onCreateTimetable,
  onOpenPeriodDialog,
  onDeletePeriod
}) => {
  if (!isClassTeacher) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Class Teacher - Timetable Management</h2>
      
      {classTeacherAssignments.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
          <select
            value={selectedAssignment?.id || ''}
            onChange={(e) => onAssignmentChange(Number(e.target.value))}
            className="w-full md:w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classTeacherAssignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.class.name} - {assignment.section.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {selectedAssignment && (
        <>
          {!timetable ? (
            <div className="mb-4">
              <div className="p-4 mb-4 bg-blue-50 text-blue-800 rounded-md">
                No timetable exists for {selectedAssignment.class.name} - {selectedAssignment.section.name} yet.
                <p className="mt-2">You can either create a new timetable or add periods directly.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  variant="primary"
                  onClick={onCreateTimetable}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#292648] hover:bg-[#3b3664]'}`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      Creating...
                    </span>
                  ) : (
                    'Create Empty Timetable'
                  )}
                </Button>
                <Button
                  variant="primary"
                  onClick={onOpenPeriodDialog}
                  className="px-4 py-2 bg-[#292648] text-white rounded-md hover:bg-[#3b3664] flex items-center"
                >
                  <span className="mr-1">+</span> Add Period
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <h3 className="text-lg font-medium mb-2 md:mb-0">
                  Timetable for {timetable.class?.name} - {timetable.section?.name}
                </h3>
                <Button
                  onClick={onOpenPeriodDialog}
                  className="px-4 py-2 bg-[#292648] text-white rounded-md hover:bg-[#3b3664] flex items-center"
                >
                  <span className="mr-1">+</span> Add Period
                </Button>
              </div>
              
              <TimetableGrid periodGrid={periodGrid} onDeletePeriod={onDeletePeriod} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassTeacherManager; 