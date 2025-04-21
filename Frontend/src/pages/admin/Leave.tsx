import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { leaveAPI } from "../../services/api";
import { Tab } from '@headlessui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Button from '../../components/ui/Button';

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
  applicantType: 'STUDENT' | 'TEACHER' | 'ADMIN';
  student?: {
    id: number;
    name: string;
    rollNo: string;
    class: {
      id: number;
      name: string;
    };
    section: {
      id: number;
      name: string;
    };
  };
  teacher?: {
    id: number;
    name: string;
    designation: {
      id: number;
      name: string;
    };
  };
  admin?: {
    id: number;
    name: string;
  };
}

const Leave: React.FC = () => {
  const [myLeaves, setMyLeaves] = useState<LeaveApplication[]>([]);
  const [pendingStudentLeaves, setPendingStudentLeaves] = useState<LeaveApplication[]>([]);
  const [pendingTeacherLeaves, setPendingTeacherLeaves] = useState<LeaveApplication[]>([]);
  const [processedLeaves, setProcessedLeaves] = useState<LeaveApplication[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [remarks, setRemarks] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveApplications();
  }, []);

  const fetchLeaveApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch admin's own leave applications
      const myLeavesResponse = await leaveAPI.getLeaves({
        applicantType: 'ADMIN'
      });
      
      if (myLeavesResponse.data.status === 'success') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let myLeavesData: any[] = [];
        if (Array.isArray(myLeavesResponse.data?.data)) {
          // New response format: data.data is the array directly
          myLeavesData = myLeavesResponse.data.data;
        } else if (Array.isArray(myLeavesResponse.data?.data?.leaveApplications)) {
          // Old response format: data.data.leaveApplications is the array
          myLeavesData = myLeavesResponse.data.data.leaveApplications;
        }
        setMyLeaves(myLeavesData as LeaveApplication[]);
      }

      // Fetch pending student applications
      const pendingStudentLeavesResponse = await leaveAPI.getLeaves({
        applicantType: 'STUDENT',
        status: 'PENDING'
      });
      
      if (pendingStudentLeavesResponse.data.status === 'success') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pendingStudentData: any[] = [];
        if (Array.isArray(pendingStudentLeavesResponse.data?.data)) {
          // New response format
          pendingStudentData = pendingStudentLeavesResponse.data.data;
        } else if (Array.isArray(pendingStudentLeavesResponse.data?.data?.leaveApplications)) {
          // Old response format
          pendingStudentData = pendingStudentLeavesResponse.data.data.leaveApplications;
        }
        setPendingStudentLeaves(pendingStudentData as LeaveApplication[]);
      }

      // Fetch pending teacher applications
      const pendingTeacherLeavesResponse = await leaveAPI.getLeaves({
        applicantType: 'TEACHER',
        status: 'PENDING'
      });
      
      if (pendingTeacherLeavesResponse.data.status === 'success') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pendingTeacherData: any[] = [];
        if (Array.isArray(pendingTeacherLeavesResponse.data?.data)) {
          // New response format
          pendingTeacherData = pendingTeacherLeavesResponse.data.data;
        } else if (Array.isArray(pendingTeacherLeavesResponse.data?.data?.leaveApplications)) {
          // Old response format
          pendingTeacherData = pendingTeacherLeavesResponse.data.data.leaveApplications;
        }
        setPendingTeacherLeaves(pendingTeacherData as LeaveApplication[]);
      }

      // Fetch processed applications (approved/rejected) for all types
      const processedLeavesResponse = await leaveAPI.getLeaves({
        status: ['APPROVED', 'REJECTED']
      });
      
      if (processedLeavesResponse.data.status === 'success') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let processedData: any[] = [];
        if (Array.isArray(processedLeavesResponse.data?.data)) {
          // New response format
          processedData = processedLeavesResponse.data.data;
        } else if (Array.isArray(processedLeavesResponse.data?.data?.leaveApplications)) {
          // Old response format
          processedData = processedLeavesResponse.data.data.leaveApplications;
        }
        setProcessedLeaves(processedData as LeaveApplication[]);
      }
    } catch (err) {
      console.error("Error fetching leave applications:", err);
      setError("An error occurred while fetching leave applications");
      toast.error("Failed to load leave applications");
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
    setRemarks("");
  };

  const handleAddLeave = () => {
    navigate('/leave/create');
  };

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    setIsUpdating(true);
    try {
      const response = await leaveAPI.updateLeaveStatus(id, {
        status,
        remarks: remarks || undefined
      });
      
      if (response.data.status === 'success') {
        toast.success(`Leave application ${status.toLowerCase()} successfully`);
        await fetchLeaveApplications();
        handleCloseDetailModal();
      } else {
        toast.error(`Failed to ${status.toLowerCase()} leave application`);
      }
    } catch (err) {
      console.error(`Error ${status.toLowerCase()}ing leave application:`, err);
      toast.error(`Error ${status.toLowerCase()}ing leave application`);
    } finally {
      setIsUpdating(false);
    }
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

  const getApplicantDetails = (leave: LeaveApplication) => {
    switch (leave.applicantType) {
      case 'STUDENT':
        return leave.student ? (
          <div className="mb-2">
            <span className="text-sm text-gray-500">Student: </span>
            <span className="text-sm font-medium">{leave.student.name} ({leave.student.rollNo})</span>
            <div className="text-xs text-gray-500 mt-1">
              Class {leave.student.class.name} - Section {leave.student.section.name}
            </div>
          </div>
        ) : null;
      case 'TEACHER':
        return leave.teacher ? (
          <div className="mb-2">
            <span className="text-sm text-gray-500">Teacher: </span>
            <span className="text-sm font-medium">{leave.teacher.name}</span>
            <div className="text-xs text-gray-500 mt-1">
              {leave.teacher.designation?.name || 'No designation'}
            </div>
          </div>
        ) : null;
      case 'ADMIN':
        return leave.admin ? (
          <div className="mb-2">
            <span className="text-sm text-gray-500">Admin: </span>
            <span className="text-sm font-medium">{leave.admin.name}</span>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  const renderLeaveCard = (leave: LeaveApplication) => (
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
        {getApplicantDetails(leave)}
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{leave.description}</p>
        <div className="flex justify-end mt-2">
          <Button
            variant='primary'
            onClick={() => handleViewDetails(leave)}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );

  const renderApplicantDetails = (leave: LeaveApplication) => {
    switch (leave.applicantType) {
      case 'STUDENT':
        return leave.student ? (
          <div className="mb-2">
            <span className="text-gray-500">Student:</span>
            <span className="ml-2 font-medium">{leave.student.name} ({leave.student.rollNo})</span>
            <div className="ml-2 text-sm text-gray-500 mt-1">
              Class {leave.student.class.name} - Section {leave.student.section.name}
            </div>
          </div>
        ) : null;
      case 'TEACHER':
        return leave.teacher ? (
          <div className="mb-2">
            <span className="text-gray-500">Teacher:</span>
            <span className="ml-2 font-medium">{leave.teacher.name}</span>
            <div className="ml-2 text-sm text-gray-500 mt-1">
              {leave.teacher.designation?.name || 'No designation'}
            </div>
          </div>
        ) : null;
      case 'ADMIN':
        return leave.admin ? (
          <div className="mb-2">
            <span className="text-gray-500">Admin:</span>
            <span className="ml-2 font-medium">{leave.admin.name}</span>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    if (!selectedLeave || selectedLeave.status !== 'PENDING') {
      return null;
    }

    return (
      <div className="mt-6">
        <h3 className="font-medium mb-2">Add Remarks (Optional):</h3>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
          placeholder="Enter any remarks or feedback"
          rows={3}
        />
        <div className="flex justify-end space-x-3">
          <Button
            variant='danger'
            onClick={() => handleUpdateStatus(selectedLeave.id, 'REJECTED')}
            disabled={isUpdating}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-300"
          >
            <FaTimes className="mr-2" /> Reject
          </Button>
          <Button
            variant='primary'
            onClick={() => handleUpdateStatus(selectedLeave.id, 'APPROVED')}
            disabled={isUpdating}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            <FaCheck className="mr-2" /> Approve
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-[#EEF5FF]">  
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
          <Button
            variant='primary'
            onClick={handleAddLeave}
          >
            Apply for Leave
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading leave applications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-md mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <Tab.Group>
            <Tab.List className="flex p-1 space-x-1 bg-[#EBF4FF] rounded-xl mb-6">
              <Tab
                className={({ selected }: { selected: boolean }) =>
                  `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                  ${
                    selected
                      ? 'bg-primary text-white shadow'
                      : 'text-blue-50 hover:bg-primary/90'
                  }`
                }
              >
                My Leave Applications
              </Tab>
              <Tab
                className={({ selected }: { selected: boolean }) =>
                  `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                  ${
                    selected
                      ? 'bg-primary text-white shadow'
                      : 'text-blue-50 hover:bg-primary/90'
                  }`
                }
              >
                Student Approvals ({pendingStudentLeaves.length})
              </Tab>
              <Tab
                className={({ selected }: { selected: boolean }) =>
                  `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                  ${
                    selected
                      ? 'bg-primary text-white shadow'
                      : 'text-blue-50 hover:bg-primary/90'
                  }`
                }
              >
                Teacher Approvals ({pendingTeacherLeaves.length})
              </Tab>
              <Tab
                className={({ selected }: { selected: boolean }) =>
                  `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                  ${
                    selected
                      ? 'bg-primary text-white shadow'
                      : 'text-blue-50 hover:bg-primary/90'
                  }`
                }
              >
                Processed Applications
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                {myLeaves.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">You haven't applied for any leave yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {myLeaves.map(renderLeaveCard)}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel>
                {pendingStudentLeaves.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No pending student leave applications to approve.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {pendingStudentLeaves.map(renderLeaveCard)}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel>
                {pendingTeacherLeaves.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No pending teacher leave applications to approve.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {pendingTeacherLeaves.map(renderLeaveCard)}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel>
                {processedLeaves.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No processed leave applications.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {processedLeaves.map(renderLeaveCard)}
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>

      {/* Leave Detail Modal with approval options */}
      {isDetailModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedLeave.subject}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedLeave.status)}`}>
                  {selectedLeave.status}
                </span>
              </div>
              <Button
                onClick={handleCloseDetailModal}
                variant='danger'
              >
                Close
              </Button>
            </div>

            <div className="mb-6">
              <div className="mb-2">
                <span className="text-gray-500">Leave Type:</span>
                <span className="ml-2 font-medium">{selectedLeave.leaveType?.name || 'N/A'}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500">From:</span>
                <span className="ml-2 font-medium">
                  {new Date(selectedLeave.fromDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500">To:</span>
                <span className="ml-2 font-medium">
                  {new Date(selectedLeave.toDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              {renderApplicantDetails(selectedLeave)}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Description:</h3>
              <p className="text-gray-700 whitespace-pre-line">{selectedLeave.description}</p>
            </div>

            {renderActionButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave; 