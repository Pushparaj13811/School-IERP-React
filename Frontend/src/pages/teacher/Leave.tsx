import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { leaveAPI } from "../../services/api";
import { Tab } from '@headlessui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';

// Import shared components and utilities - eliminates duplicate code
import { PageLoadingState, PageErrorState, StatusBadge } from '../../components/common';
import { extractLeaveData } from '../../utils/apiResponseUtils';
import { formatDate, formatTableDate } from '../../utils/dateUtils';

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
}

const Leave: React.FC = () => {
  const [myLeaves, setMyLeaves] = useState<LeaveApplication[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<LeaveApplication[]>([]);
  const [processedApprovals, setProcessedApprovals] = useState<LeaveApplication[]>([]);
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
      // Fetch my own leave applications using shared utility
      const myLeavesResponse = await leaveAPI.getLeaves({
        applicantType: 'TEACHER'
      });
      const myLeavesData = extractLeaveData<LeaveApplication>(myLeavesResponse);
      setMyLeaves(myLeavesData);

      // Fetch pending student applications for approval
      const pendingApprovalsResponse = await leaveAPI.getLeaves({
        applicantType: 'STUDENT',
        status: 'PENDING'
      });
      const pendingData = extractLeaveData<LeaveApplication>(pendingApprovalsResponse);
      setPendingApprovals(pendingData);

      // Fetch processed student applications (approved/rejected)
      const processedApprovalsResponse = await leaveAPI.getLeaves({
        applicantType: 'STUDENT',
        status: ['APPROVED', 'REJECTED']
      });
      const processedData = extractLeaveData<LeaveApplication>(processedApprovalsResponse);
      setProcessedApprovals(processedData);
    } catch {
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
    } catch {
      toast.error(`Error ${status.toLowerCase()}ing leave application`);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderLeaveCard = (leave: LeaveApplication) => (
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
        {leave.student && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Student: </span>
            <span className="text-sm font-medium text-gray-900">{leave.student.name} ({leave.student.rollNo})</span>
            <div className="text-xs text-gray-500 mt-1">
              Class {leave.student.class.name} - Section {leave.student.section.name}
            </div>
          </div>
        )}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{leave.description}</p>
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            onClick={() => handleViewDetails(leave)}
            className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  const renderActionButtons = () => {
    if (!selectedLeave || selectedLeave.applicantType !== 'STUDENT' || selectedLeave.status !== 'PENDING') {
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
          <button
            onClick={() => handleUpdateStatus(selectedLeave.id, 'REJECTED')}
            disabled={isUpdating}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-300"
          >
            <FaTimes className="mr-2" /> Reject
          </button>
          <button
            onClick={() => handleUpdateStatus(selectedLeave.id, 'APPROVED')}
            disabled={isUpdating}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            <FaCheck className="mr-2" /> Approve
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-500 mt-1">Manage your leave and student applications</p>
          </div>
          <button
            onClick={handleAddLeave}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg shadow-indigo-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6">
          {isLoading ? (
            <PageLoadingState message="Loading leave applications..." />
          ) : error ? (
            <PageErrorState
              title="Error Loading Leave Applications"
              message={error}
              onRetry={() => fetchLeaveApplications()}
            />
          ) : (
            <Tab.Group>
              <Tab.List className="flex p-1 space-x-1 bg-indigo-50 rounded-xl mb-6">
                <Tab
                  className={({ selected }: { selected: boolean }) =>
                    `w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors
                    ${
                      selected
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow'
                        : 'text-indigo-600 hover:bg-indigo-100'
                    }`
                  }
                >
                  My Leave Applications
                </Tab>
                <Tab
                  className={({ selected }: { selected: boolean }) =>
                    `w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors
                    ${
                      selected
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow'
                        : 'text-indigo-600 hover:bg-indigo-100'
                    }`
                  }
                >
                  Pending Approvals ({pendingApprovals.length})
                </Tab>
                <Tab
                  className={({ selected }: { selected: boolean }) =>
                    `w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-colors
                    ${
                      selected
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow'
                        : 'text-indigo-600 hover:bg-indigo-100'
                    }`
                  }
                >
                  Processed Applications
                </Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  {myLeaves.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">You haven't applied for any leave yet</p>
                      <p className="text-sm text-gray-400 mt-1">Click "Apply for Leave" to submit a request</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {myLeaves.map(renderLeaveCard)}
                    </div>
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {pendingApprovals.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No pending leave applications</p>
                      <p className="text-sm text-gray-400 mt-1">All student leave requests have been processed</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {pendingApprovals.map(renderLeaveCard)}
                    </div>
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {processedApprovals.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No processed leave applications</p>
                      <p className="text-sm text-gray-400 mt-1">Approved and rejected applications will appear here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {processedApprovals.map(renderLeaveCard)}
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          )}
        </div>
      </div>

      {/* Leave Detail Modal with approval options */}
      {isDetailModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedLeave.subject}</h2>
                <StatusBadge status={selectedLeave.status} size="sm" />
              </div>
              <button
                onClick={handleCloseDetailModal}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Leave Type</span>
                  <p className="font-medium text-gray-900 mt-1">{selectedLeave.leaveType?.name || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Duration</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatDate(selectedLeave.fromDate)} - {formatDate(selectedLeave.toDate)}
                  </p>
                </div>
              </div>

              {selectedLeave.student && (
                <div className="p-4 bg-indigo-50 rounded-xl mb-6">
                  <span className="text-sm text-indigo-600 font-medium">Student Information</span>
                  <p className="font-medium text-gray-900 mt-2">{selectedLeave.student.name} ({selectedLeave.student.rollNo})</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Class {selectedLeave.student.class.name} - Section {selectedLeave.student.section.name}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedLeave.description}</p>
              </div>

              {renderActionButtons()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave; 