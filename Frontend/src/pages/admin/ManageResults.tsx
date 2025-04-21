import React, { useState, useEffect } from 'react';
import { academicAPI, resultAPI } from '../../services/api';
import { FaLock, FaUnlock } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import ConfirmationModal from '../../components/common/ConfirmationModal';

// Define types
interface Class {
  id: number;
  name: string;
}

interface Section {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Student {
  name: string;
  rollNo: string;
}

// Define a type for the raw API response
interface ResultResponse {
  id: number;
  studentId: number;
  subjectId: number;
  academicYear: string;
  term: string;
  fullMarks?: number;
  passMarks?: number;
  theoryMarks?: number;
  practicalMarks?: number;
  totalMarks?: number;
  isLocked?: boolean;
  isAbsent?: boolean;
  student?: {
    name: string;
    rollNo: string;
  };
  subject?: {
    name: string;
  };
}

interface SubjectResult {
  id: number;
  studentId: number;
  subjectId: number;
  academicYear: string;
  term: string;
  totalMarks: number;
  isLocked: boolean;
  student: Student;
  subject: {
    name: string;
  };
}

const ManageResults: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYear, setAcademicYear] = useState<string>(new Date().getFullYear().toString());
  const [term, setTerm] = useState<string>("First");
  
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'lock' | 'unlock';
    count: number;
  }>({
    isOpen: false,
    action: 'unlock',
    count: 0
  });

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await academicAPI.getClasses();
        if (response.data?.status === 'success') {
          setClasses(response.data.data.classes);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to load classes');
      }
    };

    fetchClasses();
  }, []);

  // Fetch sections when class is selected
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedClass) return;
      
      try {
        const response = await academicAPI.getSections(selectedClass);
        if (response.data?.status === 'success') {
          setSections(response.data.data.sections);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        setError('Failed to load sections');
      }
    };

    fetchSections();
  }, [selectedClass]);

  // Fetch subjects when class is selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass) return;
      
      try {
        const response = await academicAPI.getSubjectsByClass(selectedClass);
        
        // Handle different response formats
        if ('status' in response.data && response.data.status === 'success' && response.data.data?.subjects) {
          // New API format with status and nested subjects
          setSubjects(response.data.data.subjects);
        } else if ('success' in response.data && response.data.success && Array.isArray(response.data.data)) {
          // Old API format with success flag and direct subjects array
          setSubjects(response.data.data);
        } else {
          // Handle unexpected response format
          console.error('Unexpected subjects API response format:', response.data);
          setSubjects([]);
          setError('Failed to parse subjects data. Check console for details.');
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError('Failed to load subjects');
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  // Fetch results when all criteria are selected
  const fetchResults = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await resultAPI.getResults({
        classId: selectedClass,
        sectionId: selectedSection,
        subjectId: selectedSubject,
        academicYear,
        term
      });

      if (response.data?.status === 'success' && Array.isArray(response.data.data.results)) {
        // Transform API response to match our expected type
        const subjectResults = (response.data.data.results as unknown[]).map(item => {
          const result = item as ResultResponse;
          return {
            id: result.id,
            studentId: result.studentId,
            subjectId: result.subjectId,
            academicYear: result.academicYear,
            term: result.term,
            totalMarks: result.totalMarks || 0,
            isLocked: result.isLocked !== undefined ? result.isLocked : true,
            student: {
              name: result.student?.name || '',
              rollNo: result.student?.rollNo || ''
            },
            subject: {
              name: result.subject?.name || ''
            }
          };
        });
        
        setResults(subjectResults);
      } else {
        setResults([]);
        setError('No results found for the selected criteria');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load results');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection && selectedSubject) {
      fetchResults();
    }
  }, [selectedClass, selectedSection, selectedSubject, academicYear, term]);

  const handleToggleLock = async (id: number, currentLockStatus: boolean) => {
    try {
      setSuccessMessage(null);
      setError(null);
      
      const response = await resultAPI.toggleResultLock(id.toString(), !currentLockStatus);
      
      if (response.data?.status === 'success') {
        // Update the results list with the new lock status
        setResults(prevResults => 
          prevResults.map(result => 
            result.id === id 
              ? { ...result, isLocked: !currentLockStatus } 
              : result
          )
        );
        
        const action = currentLockStatus ? 'unlocked' : 'locked';
        setSuccessMessage(`Result ${action} successfully`);
      }
    } catch (error) {
      console.error('Error toggling lock status:', error);
      setError('Failed to update lock status');
    }
  };

  // Update handleUnlockAll function to use the modal
  const handleUnlockAll = async () => {
    if (!results.length) {
      setError('No results to unlock');
      return;
    }

    // Only proceed with results that are currently locked
    const lockedResults = results.filter(result => result.isLocked);
    if (!lockedResults.length) {
      setSuccessMessage('All results are already unlocked');
      return;
    }

    // Open confirmation modal instead of window.confirm
    setConfirmModal({
      isOpen: true,
      action: 'unlock',
      count: lockedResults.length
    });
  };

  // Update handleLockAll function to use the modal
  const handleLockAll = async () => {
    if (!results.length) {
      setError('No results to lock');
      return;
    }

    // Only proceed with results that are currently unlocked
    const unlockedResults = results.filter(result => !result.isLocked);
    if (!unlockedResults.length) {
      setSuccessMessage('All results are already locked');
      return;
    }

    // Open confirmation modal instead of window.confirm
    setConfirmModal({
      isOpen: true,
      action: 'lock',
      count: unlockedResults.length
    });
  };

  // Add a function to handle the confirmation
  const handleConfirmAction = async () => {
    if (confirmModal.action === 'unlock') {
      await processUnlockAll();
    } else {
      await processLockAll();
    }
    
    // Close the modal
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Extract the unlock logic to a separate function
  const processUnlockAll = async () => {
    const lockedResults = results.filter(result => result.isLocked);
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Process all results in sequence
      let successCount = 0;
      let errorCount = 0;

      for (const result of lockedResults) {
        try {
          await resultAPI.toggleResultLock(result.id.toString(), false);
          successCount++;
        } catch (err) {
          console.error(`Error unlocking result ID ${result.id}:`, err);
          errorCount++;
        }
      }

      // Update all results in state
      if (successCount > 0) {
        setResults(prevResults => 
          prevResults.map(result => 
            result.isLocked ? { ...result, isLocked: false } : result
          )
        );
        
        setSuccessMessage(`Successfully unlocked ${successCount} results${errorCount > 0 ? ` (failed: ${errorCount})` : ''}`);
      } else {
        setError('Failed to unlock any results');
      }
    } catch (error) {
      console.error('Error in bulk unlock operation:', error);
      setError('Failed to complete the unlock operation');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract the lock logic to a separate function
  const processLockAll = async () => {
    const unlockedResults = results.filter(result => !result.isLocked);
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Process all results in sequence
      let successCount = 0;
      let errorCount = 0;

      for (const result of unlockedResults) {
        try {
          await resultAPI.toggleResultLock(result.id.toString(), true);
          successCount++;
        } catch (err) {
          console.error(`Error locking result ID ${result.id}:`, err);
          errorCount++;
        }
      }

      // Update all results in state
      if (successCount > 0) {
        setResults(prevResults => 
          prevResults.map(result => 
            !result.isLocked ? { ...result, isLocked: true } : result
          )
        );
        
        setSuccessMessage(`Successfully locked ${successCount} results${errorCount > 0 ? ` (failed: ${errorCount})` : ''}`);
      } else {
        setError('Failed to lock any results');
      }
    } catch (error) {
      console.error('Error in bulk lock operation:', error);
      setError('Failed to complete the lock operation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Subject Results</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedClass || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              setSelectedClass(value);
              setSelectedSection(null);
              setSelectedSubject(null);
            }}
          >
            <option value="">Select a class</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Section
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedSection || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              setSelectedSection(value);
              setSelectedSubject(null);
            }}
            disabled={!selectedClass || sections.length === 0}
          >
            <option value="">Select a section</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedSubject || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              setSelectedSubject(value);
            }}
            disabled={!selectedClass || !selectedSection || subjects.length === 0}
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Term
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            <option value="First">First Term</option>
            <option value="Second">Second Term</option>
            <option value="Final">Final Term</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button
            variant="primary"
            onClick={fetchResults}
          >
            {isLoading ? 'Loading...' : 'Search Results'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading results...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {results.length} Result{results.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleLockAll}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <FaLock /> Lock All Results
              </Button>
              <Button
                variant="primary"
                onClick={handleUnlockAll}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <FaUnlock /> Unlock All Results
              </Button>
            </div>
          </div>
          <table className="w-full border-collapse table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Roll No</th>
                <th className="px-4 py-2 text-left">Student Name</th>
                <th className="px-4 py-2 text-left">Subject</th>
                <th className="px-4 py-2 text-left">Marks</th>
                <th className="px-4 py-2 text-left">Term</th>
                <th className="px-4 py-2 text-left">Academic Year</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{result.student?.rollNo}</td>
                  <td className="px-4 py-2">{result.student?.name}</td>
                  <td className="px-4 py-2">{result.subject?.name}</td>
                  <td className="px-4 py-2">{result.totalMarks}</td>
                  <td className="px-4 py-2">{result.term}</td>
                  <td className="px-4 py-2">{result.academicYear}</td>
                  <td className="px-4 py-2">
                    {result.isLocked ? (
                      <span className="flex items-center text-red-600">
                        <FaLock className="mr-1" /> Locked
                      </span>
                    ) : (
                      <span className="flex items-center text-green-600">
                        <FaUnlock className="mr-1" /> Unlocked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggleLock(result.id, result.isLocked)}
                      className={`px-3 py-1 text-sm text-white rounded-md ${
                        result.isLocked 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {result.isLocked ? 'Unlock' : 'Lock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedClass && selectedSection && selectedSubject ? (
        <div className="text-center p-8 text-gray-500">
          No results found. Please adjust your search criteria.
        </div>
      ) : null}

      {/* Add the Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmModal.action === 'unlock' ? 'Unlock Results' : 'Lock Results'}
        message={`Are you sure you want to ${confirmModal.action} all ${confirmModal.count} results for the selected class, section, and subject?`}
        confirmLabel={confirmModal.action === 'unlock' ? 'Unlock' : 'Lock'}
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default ManageResults; 