import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { leaveAPI } from "../../services/api";
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

type TabType = 'my-leaves' | 'student-pending' | 'teacher-pending' | 'processed';

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
  const [activeTab, setActiveTab] = useState<TabType>('my-leaves');
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
          myLeavesData = myLeavesResponse.data.data;
        } else if (Array.isArray(myLeavesResponse.data?.data?.leaveApplications)) {
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
          pendingStudentData = pendingStudentLeavesResponse.data.data;
        } else if (Array.isArray(pendingStudentLeavesResponse.data?.data?.leaveApplications)) {
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
          pendingTeacherData = pendingTeacherLeavesResponse.data.data;
        } else if (Array.isArray(pendingTeacherLeavesResponse.data?.data?.leaveApplications)) {
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
          processedData = processedLeavesResponse.data.data;
        } else if (Array.isArray(processedLeavesResponse.data?.data?.leaveApplications)) {
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

  // Calculate days between dates
  const calculateDays = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'PENDING':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'CANCELLED':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: null
        };
    }
  };

  // Get leave type icon
  const getLeaveTypeIcon = (typeName?: string) => {
    const name = typeName?.toLowerCase() || '';
    if (name.includes('sick') || name.includes('medical')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      );
    } else if (name.includes('personal') || name.includes('casual')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    } else if (name.includes('vacation') || name.includes('annual')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
  };

  // Get applicant info
  const getApplicantInfo = (leave: LeaveApplication) => {
    switch (leave.applicantType) {
      case 'STUDENT':
        return {
          name: leave.student?.name || 'Unknown Student',
          subtitle: leave.student ? `${leave.student.rollNo} • Class ${leave.student.class.name}-${leave.student.section.name}` : '',
          avatar: leave.student?.name?.charAt(0) || 'S',
          color: 'bg-blue-500'
        };
      case 'TEACHER':
        return {
          name: leave.teacher?.name || 'Unknown Teacher',
          subtitle: leave.teacher?.designation?.name || 'Teacher',
          avatar: leave.teacher?.name?.charAt(0) || 'T',
          color: 'bg-amber-500'
        };
      case 'ADMIN':
        return {
          name: leave.admin?.name || 'Unknown Admin',
          subtitle: 'Administrator',
          avatar: leave.admin?.name?.charAt(0) || 'A',
          color: 'bg-purple-500'
        };
      default:
        return {
          name: 'Unknown',
          subtitle: '',
          avatar: '?',
          color: 'bg-gray-500'
        };
    }
  };

  // Summary stats
  const stats = {
    total: myLeaves.length + pendingStudentLeaves.length + pendingTeacherLeaves.length,
    pending: pendingStudentLeaves.length + pendingTeacherLeaves.length,
    studentPending: pendingStudentLeaves.length,
    teacherPending: pendingTeacherLeaves.length,
    processed: processedLeaves.length
  };

  // Tab configuration
  const tabs = [
    { id: 'my-leaves' as TabType, label: 'My Applications', count: myLeaves.length },
    { id: 'student-pending' as TabType, label: 'Student Requests', count: pendingStudentLeaves.length },
    { id: 'teacher-pending' as TabType, label: 'Teacher Requests', count: pendingTeacherLeaves.length },
    { id: 'processed' as TabType, label: 'Processed', count: processedLeaves.length }
  ];

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'my-leaves':
        return myLeaves;
      case 'student-pending':
        return pendingStudentLeaves;
      case 'teacher-pending':
        return pendingTeacherLeaves;
      case 'processed':
        return processedLeaves;
      default:
        return [];
    }
  };

  // Empty state message
  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'my-leaves':
        return "You haven't applied for any leave yet.";
      case 'student-pending':
        return "No pending student leave requests.";
      case 'teacher-pending':
        return "No pending teacher leave requests.";
      case 'processed':
        return "No processed leave applications.";
      default:
        return "No leave applications found.";
    }
  };

  // Render leave card
  const renderLeaveCard = (leave: LeaveApplication) => {
    const statusStyles = getStatusStyles(leave.status);
    const applicant = getApplicantInfo(leave);
    const days = calculateDays(leave.fromDate, leave.toDate);

    return (
      <div
        key={leave.id}
        className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        {/* Card Header */}
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getLeaveTypeIcon(leave.leaveType?.name)}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">{leave.subject}</h3>
                <p className="text-sm text-gray-500">{leave.leaveType?.name || 'General Leave'}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} border`}>
              {statusStyles.icon}
              <span>{leave.status}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {/* Applicant Info - Show only for pending tabs */}
          {(activeTab === 'student-pending' || activeTab === 'teacher-pending' || activeTab === 'processed') && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${applicant.color} flex items-center justify-center text-white text-sm font-medium`}>
                {applicant.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{applicant.name}</p>
                <p className="text-xs text-gray-500 truncate">{applicant.subtitle}</p>
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">From</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(leave.fromDate)}</p>
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">To</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(leave.toDate)}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium text-gray-900">{days} day{days > 1 ? 's' : ''}</span>
          </div>

          {/* Description Preview */}
          <p className="text-sm text-gray-600 line-clamp-2">{leave.description}</p>
        </div>

        {/* Card Footer */}
        <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => handleViewDetails(leave)}
            className="w-full justify-center text-sm font-medium hover:bg-white"
          >
            View Details
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="mt-1 text-gray-600">Manage and process leave applications</p>
          </div>
          <Button
            variant="primary"
            onClick={handleAddLeave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.studentPending}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.teacherPending}</p>
              <p className="text-sm text-gray-500">Teachers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.processed}</p>
              <p className="text-sm text-gray-500">Processed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex border-b-2 items-center bg-primary/5 border border-gray-600 gap-2 px-6 mx-2 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 bg-primary/10 text-indigo-600'
                    : 'hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading leave applications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium">{error}</p>
              <button
                onClick={fetchLeaveApplications}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Try Again
              </button>
            </div>
          ) : getCurrentTabData().length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium">{getEmptyMessage()}</p>
              {activeTab === 'my-leaves' && (
                <button
                  onClick={handleAddLeave}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Apply for Leave
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentTabData().map(renderLeaveCard)}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={handleCloseDetailModal}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getLeaveTypeIcon(selectedLeave.leaveType?.name)}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedLeave.subject}</h2>
                    <p className="text-sm text-gray-500">{selectedLeave.leaveType?.name || 'General Leave'}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetailModal}
                  className="p-2 bg-primary/5 border border-primary/20 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Status Badge */}
                <div className="mb-6">
                  {(() => {
                    const statusStyles = getStatusStyles(selectedLeave.status);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} border`}>
                        {statusStyles.icon}
                        {selectedLeave.status}
                      </span>
                    );
                  })()}
                </div>

                {/* Applicant Info */}
                {selectedLeave.applicantType !== 'ADMIN' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Applicant Information</h3>
                    {(() => {
                      const applicant = getApplicantInfo(selectedLeave);
                      return (
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full ${applicant.color} flex items-center justify-center text-white text-lg font-medium`}>
                            {applicant.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{applicant.name}</p>
                            <p className="text-sm text-gray-500">{applicant.subtitle}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Date Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Leave Duration</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">From Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedLeave.fromDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">To Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedLeave.toDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                      {calculateDays(selectedLeave.fromDate, selectedLeave.toDate)} day{calculateDays(selectedLeave.fromDate, selectedLeave.toDate) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Reason for Leave</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-line">{selectedLeave.description}</p>
                  </div>
                </div>

                {/* Action Section for Pending Leaves */}
                {selectedLeave.status === 'PENDING' && (
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Add Remarks (Optional)</h3>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter any feedback or remarks..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleUpdateStatus(selectedLeave.id, 'REJECTED')}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedLeave.id, 'APPROVED')}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4">
                <Button
                  variant="outline"
                  onClick={handleCloseDetailModal}
                  className="w-full justify-center"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
