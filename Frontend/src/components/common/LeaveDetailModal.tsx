import React from "react";

interface LeaveApplication {
  id: number;
  subject: string;
  leaveType?: {
    id: number;
    name: string;
    description?: string;
  };
  fromDate: string;
  toDate: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

interface LeaveDetailModalProps {
  isOpen: boolean;
  leave: LeaveApplication | null;
  onClose: () => void;
}

const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({ isOpen, leave, onClose }) => {
  if (!isOpen || !leave) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 rounded-lg bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{leave.subject}</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(leave.status)}`}>
              {leave.status}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="bg-[#292648] text-white px-6 py-2 rounded-md"
          >
            Close
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-2">
            <span className="text-gray-500">Leave Type:</span>
            <span className="ml-2 font-medium">{leave.leaveType?.name || 'N/A'}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-500">From:</span>
            <span className="ml-2 font-medium">{formatDate(leave.fromDate)}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-500">To:</span>
            <span className="ml-2 font-medium">{formatDate(leave.toDate)}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Description:</h3>
          <p className="text-gray-700 whitespace-pre-line">{leave.description}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailModal; 