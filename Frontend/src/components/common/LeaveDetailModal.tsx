import React from "react";

interface LeaveApplication {
  id: number;
  subject: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  description: string;
  status?: string;
}

interface LeaveDetailModalProps {
  isOpen: boolean;
  leave: LeaveApplication | null;
  onClose: () => void;
}

const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({ isOpen, leave, onClose }) => {
  if (!isOpen || !leave) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 rounded-lg bg-[#EBF4FF]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">{leave.leaveType}</h2>
          <button 
            onClick={onClose}
            className="bg-[#292648] text-white px-6 py-2 rounded-md"
          >
            Close
          </button>
        </div>

        <div className="mb-6">
          <h3 className="mb-1 font-medium">Appointment with Doctor</h3>
          <p className="text-sm">
            From <span className="font-medium">10th Jam 2025</span> to <span className="font-medium">11th Jan 2025</span>
          </p>
        </div>

        <div className="text-gray-600">
          <p className="mb-4 ">
            I am writing to inform you that I am unwell and unable to come to work today. I am experiencing fever 
            and body aches, and my doctor has advised rest for the day. I am writing to inform you that I am 
            unwell and unable to come to work today. I am experiencing fever and body aches, and my doctor has 
            advised rest for the day.
          </p>
          <p className="mb-4">
            I am writing to inform you that I am unwell and unable to come to work today. I am experiencing fever 
            and body aches, and my doctor has advised rest for the day.
          </p>
          <p>I will keep you updated on my health status and plan to return...</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailModal; 