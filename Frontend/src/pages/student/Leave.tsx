import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaveDetailModal from "../../components/common/LeaveDetailModal";

interface LeaveApplication {
  id: number;
  subject: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  description: string;
  status?: string;
}

// Sample leave application data
const sampleLeaveApplications: LeaveApplication[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  subject: "Subject",
  leaveType: "Sick Leave",
  fromDate: "2023-01-10",
  toDate: "2023-01-11",
  description: "I am writing to inform you that I am unwell and unable to come to work today. I am experiencing fever and body aches, and my doctor has advised rest for the day. I will keep you updated on my health status and plan to return...",
  status: index % 3 === 0 ? "Approved" : index % 3 === 1 ? "Pending" : "Rejected"
}));

const Leave: React.FC = () => {
  const [leaveApplications] = useState<LeaveApplication[]>(sampleLeaveApplications);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const navigate = useNavigate();

  const handleViewDetails = (leave: LeaveApplication) => {
    setSelectedLeave(leave);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLeave(null);
  };

  const handleAddLeave = () => {
    navigate('/leave/create');
  };

  return (
    <div className="p-4 bg-[#EEF5FF]">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Leave Application</h2>
            <button 
              onClick={handleAddLeave}
              className="bg-[#292648] text-white px-6 py-2 rounded-md"
            >
              Add Leave
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {leaveApplications.map((leave) => (
              <div key={leave.id} className="bg-[#EBF4FF] rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-[#292648] text-white p-3">
                  <h3 className="font-medium">{leave.subject}</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-4">{leave.description}</p>
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => handleViewDetails(leave)}
                      className="text-blue-500 text-sm bg-[#EBF4FF]"
                    >
                      View More ...
                    </button>
                  </div>
                </div>
              </div>
            ))}
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