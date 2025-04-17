import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import LeaveApplicationForm from "../../components/common/LeaveApplicationForm";
import { leaveAPI } from "../../services/api";

interface LeaveFormData {
  subject: string;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  description: string;
}

const LeaveApplicationCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LeaveFormData>({
    subject: "",
    leaveTypeId: 0,
    fromDate: "",
    toDate: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leaveTypeId) {
      toast.error("Please select a leave type");
      return;
    }

    // Extra validation for dates
    const today = format(new Date(), "yyyy-MM-dd");
    if (formData.fromDate < today) {
      toast.error("Cannot apply for leave in the past");
      return;
    }

    if (formData.toDate < formData.fromDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await leaveAPI.createLeave({
        leaveTypeId: Number(formData.leaveTypeId),
        subject: formData.subject,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        description: formData.description
      });
      
      if (response.data.status === 'success') {
        toast.success("Leave application submitted successfully");
        navigate("/leave");
      } else {
        toast.error("Failed to submit leave application");
      }
    } catch (error) {
      console.error("Error submitting leave application:", error);
      toast.error("An error occurred while submitting your leave application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/leave");
  };

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">New Leave Application</h2>
        
        <LeaveApplicationForm 
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default LeaveApplicationCreate; 