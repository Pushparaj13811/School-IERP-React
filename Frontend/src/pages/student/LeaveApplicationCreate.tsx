import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaveApplicationForm from "../../components/common/LeaveApplicationForm";

interface LeaveApplication {
  id: number;
  subject: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  description: string;
  status?: string;
}

const LeaveApplicationCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<LeaveApplication, 'id'>>({
    subject: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    description: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would send this data to your backend
    console.log("Submitting leave application:", formData);
    
    // For now, we'll just navigate back to the leave page
    navigate("/leave");
  };

  const handleCancel = () => {
    navigate("/leave");
  };

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Leave Application</h2>
        
        <LeaveApplicationForm 
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default LeaveApplicationCreate; 