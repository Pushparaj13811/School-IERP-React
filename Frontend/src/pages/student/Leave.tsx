import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LeaveDetailModal from "../../components/common/LeaveDetailModal";
import { leaveAPI, userAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../utils/roles";

interface LeaveApplication {
  id: number;
  subject: string;
  leaveType: {
    id: number;
    name: string;
    description?: string;
  };
  fromDate: string;
  toDate: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

const Leave: React.FC = () => {
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ name: string, class: string, section: string } | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { studentId } = useParams<{ studentId?: string }>();
  
  useEffect(() => {
    fetchLeaveApplications();
  }, [studentId]);
  
  const fetchLeaveApplications = async () => {
    setIsLoading(true);
    setError(null);
    
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
        } catch (err) {
          console.error('Error fetching student info:', err);
        }
      }
      
      const response = await leaveAPI.getLeaves({
        studentId: targetStudentId
      });
      
      if (response.data?.status === 'success' && Array.isArray(response.data?.data?.leaveApplications)) {
        setLeaveApplications(response.data?.data?.leaveApplications as LeaveApplication[]);
      } else {
        setLeaveApplications([]);
      }
    } catch (err) {
      console.error("Error fetching leave applications:", err);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Leave Applications</h2>
            {studentInfo && (
              <p className="text-gray-600">
                {studentInfo.name} - {studentInfo.class} {studentInfo.section}
              </p>
            )}
          </div>
          
          {!studentId && (
            <button
              className="px-4 py-2 bg-[#292648] text-white rounded-lg hover:bg-blue-700 transition"
              onClick={() => navigate('/leave/create')}
            >
              Apply for Leave
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading leave applications...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 p-4 rounded-md mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!isLoading && !error && leaveApplications.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No leave applications found.</p>
          </div>
        )}

        {!isLoading && !error && leaveApplications.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {leaveApplications.map((leave) => (
              <div key={leave.id} className="bg-[#EBF4FF] rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#292648] text-white p-3 flex justify-between items-center">
                  <h3 className="font-medium">{leave.subject}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Leave Type: </span>
                    <span className="text-sm font-medium">{leave.leaveType?.name || 'N/A'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">From: </span>
                    <span className="text-sm font-medium">{new Date(leave.fromDate).toLocaleDateString()}</span>
                    <span className="text-sm text-gray-500 ml-3">To: </span>
                    <span className="text-sm font-medium">{new Date(leave.toDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{leave.description}</p>
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={() => handleViewDetails(leave)}
                      className="text-blue-500 text-sm bg-[#EBF4FF]"
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