import React, { useState, useEffect } from 'react';
import timetableService, { Class, Section, Subject, Teacher, TimeSlot, Timetable } from '../../services/timetableService';
import PeriodDialog from '../../components/timetable/PeriodDialog';
import TimeSlotDialog from '../../components/timetable/TimeSlotDialog';
import TimetableGrid from '../../components/timetable/TimetableGrid';
import TimeSlotList from '../../components/timetable/TimeSlotList';
import Button from '../../components/ui/Button';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div className="p-4">{children}</div>}
    </div>
  );
}

const ManageTimetable: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Form states
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedSection, setSelectedSection] = useState<number | ''>('');
  const [academicYear, setAcademicYear] = useState<string>('2023-2024');
  const [term, setTerm] = useState<string>('First Term');
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);

  // Period form states
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);

  // Time slot form states
  const [timeSlotDialogOpen, setTimeSlotDialogOpen] = useState(false);

  // Alert states
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreatingTimetable, setIsCreatingTimetable] = useState<boolean>(false);
  const [isAddingTimeSlot, setIsAddingTimeSlot] = useState<boolean>(false);
  const [isAddingPeriod, setIsAddingPeriod] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Additional form states
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        setFetchError(null);

        let classesData: Class[] = [];
        let subjectsData: Subject[] = [];
        let teachersData: Teacher[] = [];
        let timeSlotsData: TimeSlot[] = [];

        // Fetch each data type separately to better isolate any issues
        try {
          classesData = await timetableService.getClasses();
          setClasses(classesData || []);
        } catch (classError) {
          console.error('Error fetching classes:', classError);
          setFetchError('Failed to load classes');
        }

        try {
          subjectsData = await timetableService.getSubjects();
          setSubjects(subjectsData || []);
        } catch (subjectError) {
          console.error('Error fetching subjects:', subjectError);
        }

        try {
          teachersData = await timetableService.getTeachers();
          setTeachers(teachersData || []);
        } catch (teacherError) {
          console.error('Error fetching teachers:', teacherError);
        }

        try {
          timeSlotsData = await timetableService.getTimeSlots();
          setTimeSlots(timeSlotsData || []);
        } catch (timeSlotError) {
          console.error('Error fetching time slots:', timeSlotError);
        }

        // Ensure we set initialLoading to false regardless of individual fetch results
        setInitialLoading(false);
      } catch (error) {
        console.error('Error in fetchInitialData:', error);
        setAlert({
          open: true,
          message: 'Error fetching data. Please try again.',
          severity: 'error',
        });
        setInitialLoading(false);
        setFetchError('Failed to load data');
      }
    };

    fetchInitialData();

    // Add a safety timeout to ensure initialLoading is set to false after 5 seconds
    const safetyTimer = setTimeout(() => {
      setInitialLoading(false);
    }, 5000);

    return () => clearTimeout(safetyTimer);
  }, []);

  // Fetch sections when class is selected
  useEffect(() => {
    const fetchSections = async () => {
      if (selectedClass) {
        try {
          setLoading(true);
          const sectionsData = await timetableService.getSections(Number(selectedClass));
          setSections(sectionsData || []);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching sections:', error);
          setAlert({
            open: true,
            message: 'Error fetching sections. Please try again.',
            severity: 'error',
          });
          setLoading(false);
        }
      } else {
        setSections([]);
      }
    };

    fetchSections();
  }, [selectedClass]);

  // Fetch timetables when class or section changes
  useEffect(() => {
    const fetchTimetable = async () => {
      if (selectedClass && selectedSection) {
        try {
          setLoading(true);
          const timetableData = await timetableService.getTimetable(
            Number(selectedClass),
            Number(selectedSection),
            academicYear,
            term
          );
          console.log('Timetable data received:', timetableData);
          setSelectedTimetable(timetableData);
          setLoading(false);
        } catch (error) {
            console.error('Error fetching timetable:', error);
          setLoading(false);
          // Show an alert when we get a 500 error, but allow creation
          const apiError = error as { response?: { status: number } };
          if (apiError.response && apiError.response.status === 500) {
            setAlert({
              open: true,
              message: 'Could not find existing timetable. You can create a new one.',
              severity: 'error',
            });
          }
        }
      }
    };

    if (selectedClass && selectedSection) {
      fetchTimetable();
    }
  }, [selectedClass, selectedSection, academicYear, term]);

  // Force update component when classes are loaded
  useEffect(() => {
    if (classes.length > 0 && initialLoading) {
      setInitialLoading(false);
    }
  }, [classes, initialLoading]);

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(event.target.value === '' ? '' : Number(event.target.value));
    setSelectedSection('');
    setSelectedTimetable(null);
  };

  const handleSectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSection(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleAcademicYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAcademicYear(event.target.value);
  };

  const handleTermChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTerm(event.target.value);
  };

  const createTimetable = async () => {
    if (!selectedClass || !selectedSection) {
      setAlert({
        open: true,
        message: 'Please select class and section',
        severity: 'error',
      });
      return;
    }

    try {
      setIsCreatingTimetable(true);

      const timetableData = await timetableService.createTimetable(
        Number(selectedClass),
        Number(selectedSection),
          academicYear,
        term
      );

      if (timetableData) {
      setSelectedTimetable(timetableData);
      setAlert({
        open: true,
        message: 'Timetable created successfully',
        severity: 'success',
      });
      }

      setIsCreatingTimetable(false);
    } catch (error) {
      console.error('Error creating timetable:', error);
      
      // More descriptive error message
      const errorMessage = error instanceof Error ? error.message : 'Error creating timetable. Please try again.';
      setAlert({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      setIsCreatingTimetable(false);
    }
  };

  const handleOpenPeriodDialog = () => {
    setPeriodDialogOpen(true);
  };

  const handleClosePeriodDialog = () => {
    setPeriodDialogOpen(false);
  };

  const handleOpenTimeSlotDialog = () => {
    setTimeSlotDialogOpen(true);
  };

  const handleCloseTimeSlotDialog = () => {
    setTimeSlotDialogOpen(false);
  };

  const handleAddPeriod = async (
    dayOfWeek: number,
    timeSlotId: number,
    subjectId: number,
    teacherId: number
  ) => {
    if (!selectedTimetable) {
      setAlert({
        open: true,
        message: 'No timetable selected',
        severity: 'error',
      });
      return;
    }

    try {
      setIsAddingPeriod(true);

      const success = await timetableService.addPeriod(
        selectedTimetable.id,
        dayOfWeek,
        timeSlotId,
        subjectId,
        teacherId,
        Number(selectedClass),
        Number(selectedSection)
      );

      if (success && selectedTimetable) {
      // Refresh timetable data
        const updatedTimetable = await timetableService.getTimetableById(selectedTimetable.id);
        if (updatedTimetable) {
          setSelectedTimetable(updatedTimetable);
        }
      }

      handleClosePeriodDialog();
      setIsAddingPeriod(false);
    } catch (error) {
      console.error('Error adding period:', error);
      setAlert({
        open: true,
        message: 'Error adding period. Please try again.',
        severity: 'error',
      });
      setIsAddingPeriod(false);
    }
  };

  const handleAddTimeSlot = async (
    startTime: string,
    endTime: string,
    isBreak: boolean,
    breakType: string | null
  ) => {
    try {
      setIsAddingTimeSlot(true);

      // Validate inputs
    if (!startTime || !endTime) {
      setAlert({
        open: true,
          message: 'Please provide both start and end times',
        severity: 'error',
      });
        setIsAddingTimeSlot(false);
      return;
    }

      // Validate time format (optional)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        setAlert({
          open: true,
          message: 'Please enter valid times in HH:MM format',
          severity: 'error',
        });
        setIsAddingTimeSlot(false);
        return;
      }

      // Validate break type if it's a break
      if (isBreak && !breakType) {
        setAlert({
          open: true,
          message: 'Please provide a break type',
          severity: 'error',
        });
        setIsAddingTimeSlot(false);
        return;
      }

      const success = await timetableService.addTimeSlot(
          startTime,
          endTime,
          isBreak,
        breakType
      );

      if (success) {
      // Refresh time slots
        const timeSlotsData = await timetableService.getTimeSlots();
      setTimeSlots(timeSlotsData);
      setAlert({
        open: true,
          message: `Time slot ${startTime}-${endTime} added successfully`,
        severity: 'success',
      });
      }

      handleCloseTimeSlotDialog();
      setIsAddingTimeSlot(false);
    } catch (error) {
      console.error('Error adding time slot:', error);
      setAlert({
        open: true,
        message: 'Failed to add time slot. Please check your inputs and try again.',
        severity: 'error',
      });
      setIsAddingTimeSlot(false);
    }
  };

  const handleDeletePeriod = async (periodId: number) => {
    try {
      setLoading(true);
      
      const success = await timetableService.deletePeriod(periodId);
      
      if (success && selectedTimetable) {
      // Refresh timetable data
        const updatedTimetable = await timetableService.getTimetableById(selectedTimetable.id);
        if (updatedTimetable) {
          setSelectedTimetable(updatedTimetable);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error deleting period:', error);
      setAlert({
        open: true,
        message: 'Error deleting period. Please try again.',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  // Organize periods by day and time for display
  const periodGrid = selectedTimetable ?
    timetableService.organizePeriodsForDisplay(selectedTimetable, timeSlots) :
    null;

  return (
    <div className="p-4 bg-[#EEF5FF]">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Timetables</h1>

      <div className="border-b border-gray-200 mb-4">
        <div className="flex gap-5">
          <Button variant="primary" onClick={() => handleTabChange(0)}>
            Manage Timetables
          </Button>
          <Button variant="primary" onClick={() => handleTabChange(1)}>
            Time Slots
          </Button>
        </div>
      </div>

      <TabPanel value={tabValue} index={0}>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Create or Edit Timetable</h2>
          {fetchError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {fetchError}. Please try refreshing the page.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={initialLoading && classes.length === 0}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {initialLoading && classes.length === 0 ? (
                <div className="text-sm text-gray-500 mt-1">Loading classes...</div>
              ) : classes.length === 0 ? (
                <div className="text-sm text-red-500 mt-1">No classes available</div>
              ) : (
                <div className="text-sm text-green-500 mt-1">{classes.length} classes loaded</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={handleSectionChange}
                disabled={!selectedClass || loading}
                className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${(!selectedClass || loading) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Section</option>
                {sections && sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
              {loading && selectedClass && (
                <div className="text-sm text-gray-500 mt-1">Loading sections...</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={handleAcademicYearChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
              <select
                value={term}
                onChange={handleTermChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <button 
                onClick={createTimetable}
                disabled={!selectedClass || !selectedSection || isCreatingTimetable}
                className={`px-4 py-2 rounded-md text-white ${!selectedClass || !selectedSection || isCreatingTimetable ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#292648] hover:bg-[#3b3664]'}`}
              >
                {isCreatingTimetable ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    {selectedTimetable ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  selectedTimetable ? 'Update Timetable' : 'Create Timetable'
                )}
              </button>
            </div>
          </div>
        </div>

        {selectedTimetable && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <h3 className="text-lg font-medium mb-2 md:mb-0">
                Timetable for {selectedTimetable.class?.name} - {selectedTimetable.section?.name} ({academicYear}, {term})
              </h3>
              <button
                onClick={handleOpenPeriodDialog}
                className="px-4 py-2 bg-[#292648] text-white rounded-md hover:bg-[#3b3664] flex items-center"
              >
                <span className="mr-1">+</span> Add Period
              </button>
            </div>

            <TimetableGrid
              periodGrid={periodGrid}
              onDeletePeriod={handleDeletePeriod}
            />
          </div>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <h2 className="text-lg font-bold mb-2 md:mb-0">Manage Time Slots</h2>
            <button
              onClick={handleOpenTimeSlotDialog}
              className="px-4 py-2 bg-[#292648] text-white rounded-md hover:bg-[#3b3664] flex items-center"
            >
              <span className="mr-1">+</span> Add Time Slot
            </button>
          </div>

          <TimeSlotList 
            timeSlots={timeSlots} 
            isAdmin={true} 
            onDelete={async (timeSlotId) => {
              try {
                setLoading(true);
                const success = await timetableService.deleteTimeSlot(timeSlotId);
                if (success) {
                  // Refresh time slots
                  const timeSlotsData = await timetableService.getTimeSlots();
                  setTimeSlots(timeSlotsData);
                  setAlert({
                    open: true,
                    message: 'Time slot deleted successfully',
                    severity: 'success',
                  });
                }
                setLoading(false);
              } catch (error) {
                console.error('Error deleting time slot:', error);
                setAlert({
                  open: true,
                  message: 'Failed to delete time slot',
                  severity: 'error',
                });
                setLoading(false);
              }
            }}
          />
        </div>
      </TabPanel>

      {/* Period Dialog */}
      <PeriodDialog
        open={periodDialogOpen}
        onClose={handleClosePeriodDialog}
        onAddPeriod={async () => {
          if (selectedDay && selectedTimeSlot && selectedSubject && selectedTeacher) {
            const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(selectedDay);
            await handleAddPeriod(dayIndex, Number(selectedTimeSlot), Number(selectedSubject), Number(selectedTeacher));
          }
        }}
        loading={isAddingPeriod}
        timeSlots={timeSlots}
        subjects={subjects}
        teachers={teachers}
        selectedDay={selectedDay || 'Monday'}
        setSelectedDay={setSelectedDay}
        selectedTimeSlot={selectedTimeSlot}
        setSelectedTimeSlot={setSelectedTimeSlot}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedTeacher={selectedTeacher}
        setSelectedTeacher={setSelectedTeacher}
      />

      {/* Time Slot Dialog */}
      <TimeSlotDialog
        open={timeSlotDialogOpen}
        onClose={handleCloseTimeSlotDialog}
        onAdd={handleAddTimeSlot}
        loading={isAddingTimeSlot}
      />

      {/* Alert notification */}
      {alert.open && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${alert.severity === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex justify-between items-center">
            <span>{alert.message}</span>
            <button 
              onClick={() => setAlert({ ...alert, open: false })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTimetable; 