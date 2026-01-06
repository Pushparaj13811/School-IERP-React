import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LeaveDetailModal from "../../components/common/LeaveDetailModal";
import { leaveAPI, userAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../utils/roles";

// Import shared components and utilities - eliminates duplicate code
import { PageLoadingState, PageErrorState, StatusBadge } from '../../components/common';
import { extractLeaveData } from '../../utils/apiResponseUtils';
import { formatTableDate } from '../../utils/dateUtils';

// Define the interface for leave applications
interface LeaveType {
  id: number;
  name: string;
  description?: string;
}

interface LeaveApplication {
  id: number;
  subject: string;
  leaveType?: LeaveType;
  fromDate: string;
  toDate: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  studentId?: number;
  student?: {
    id: number;
    name: string;
    rollNo?: string;
    class?: {
      id: number;
      name: string;
    };
    section?: {
      id: number;
      name: string;
    };
  };
}

const Leave: React.FC = () => {
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ name: string, class: string, section: string } | null>(null);
  const [filterWarning, setFilterWarning] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { studentId } = useParams<{ studentId?: string }>();
  
  useEffect(() => {
    fetchLeaveApplications();
  }, [studentId]);
  
  const fetchLeaveApplications = async () => {
    setIsLoading(true);
    setError(null);
    setFilterWarning(null);
    
    try {
      // Determine which student ID to use
      const targetStudentId = studentId ? parseInt(studentId) : user?.student?.id;
      
      if (!targetStudentId) {
        setError("Student information not available");
        setIsLoading(false);
        return;
      }
      
      // If viewing as parent with studentId param, fetch student details
      if (studentId && user?.role === UserRole.PARENT) {
        try {
          const studentResponse = await userAPI.getStudentById(parseInt(studentId));
          if (studentResponse.data?.status === 'success' && studentResponse.data?.data?.student) {
            const student = studentResponse.data.data.student;
            setStudentInfo({
              name: student.name,
              class: student.class?.name || '',
              section: student.section?.name || ''
            });
          }
        } catch {
          // Student info fetch failed silently
        }
      }
      
      // Fetch leaves specifically for the targetStudentId
      const response = await leaveAPI.getLeaves({
        studentId: targetStudentId
      });
      
      // Handle both old and new API response formats using shared utility
      const leaveData = extractLeaveData<LeaveApplication>(response);
      
      if (leaveData.length > 0) {
        // Double-check filtering for the specific student in case the API doesn't filter properly
        const filteredLeaves = leaveData.filter(leave => {
          // When viewing as parent, filter by the application's studentId property directly
          if (leave.studentId) {
            return Number(leave.studentId) === Number(targetStudentId);
          }

          // Try student object property if it exists
          if (leave.student) {
            return Number(leave.student.id) === Number(targetStudentId);
          }

          // If we're the student viewing our own leaves
          if (!studentId) {
            return true;
          }

          // If we can't determine the student, don't include it when filtering for a specific student
          return false;
        });
        
        // If we filtered out leaves and we're viewing as a parent, show a warning
        if (studentId && leaveData.length > filteredLeaves.length) {
          setFilterWarning(`Filtered out ${leaveData.length - filteredLeaves.length} leave applications that didn't belong to this student.`);
        }
        
        setLeaveApplications(filteredLeaves);
      } else {
        setLeaveApplications([]);
      }
    } catch {
      toast.error("Failed to fetch leave applications");
      setError("Failed to load leave applications. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLeave(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Applications</h1>
            {studentInfo && (
              <p className="text-gray-500 mt-1">
                {studentInfo.name} - {studentInfo.class} {studentInfo.section}
              </p>
            )}
          </div>
          {!studentId && (
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200"
              onClick={() => navigate('/leave/create')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Apply for Leave
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          {filterWarning && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 text-amber-800 text-sm">
              <p className="font-medium">{filterWarning}</p>
              <p className="mt-1 text-amber-600">Only showing leave applications for this specific student.</p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <PageLoadingState message="Loading leave applications..." />
            </div>
          )}

          {error && (
            <PageErrorState
              title="Error Loading Leave Applications"
              message={error}
              onRetry={() => fetchLeaveApplications()}
            />
          )}

          {!isLoading && !error && leaveApplications.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No leave applications found</p>
              <p className="text-sm text-gray-400 mt-1">Your leave applications will appear here</p>
            </div>
          )}

          {!isLoading && !error && leaveApplications.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {leaveApplications.map((leave) => (
                <div key={leave.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex justify-between items-center">
                    <h3 className="font-medium truncate">{leave.subject}</h3>
                    <StatusBadge status={leave.status} size="sm" />
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Leave Type: </span>
                      <span className="text-sm font-medium text-gray-900">{leave.leaveType?.name || 'N/A'}</span>
                    </div>
                    <div className="mb-3 flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-500">From: </span>
                        <span className="text-sm font-medium text-gray-900">{formatTableDate(leave.fromDate)}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">To: </span>
                        <span className="text-sm font-medium text-gray-900">{formatTableDate(leave.toDate)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{leave.description}</p>
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleViewDetails(leave)}
                        className="text-indigo-600 bg-primary/10 border border-primary text-sm font-medium hover:text-indigo-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Leave Detail Modal */}
      <LeaveDetailModal 
        isOpen={isDetailModalOpen}
        leave={selectedLeave}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default Leave;