import React, { useState, useEffect } from "react";
import { leaveAPI } from "../../services/api";

interface LeaveType {
  id: number;
  name: string;
  description?: string;
}

interface LeaveFormData {
  subject: string;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  description: string;
}

interface LeaveApplicationFormProps {
  formData: LeaveFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const LeaveApplicationForm: React.FC<LeaveApplicationFormProps> = ({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel,
  isSubmitting = false
}) => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await leaveAPI.getLeaveTypes();
      if (response.data.status === 'success') {
        setLeaveTypes(response.data.data.leaveTypes);
      } else {
        setError("Failed to fetch leave types");
      }
    } catch (err) {
      console.error("Error fetching leave types:", err);
      setError("An error occurred while fetching leave types");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="mb-6 w-full">
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Leave Type</label>
          {isLoading ? (
            <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
              Loading leave types...
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          ) : (
            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-600 mb-2">From (Date)</label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-2">To (Date)</label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-600 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
          required
        ></textarea>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 sm:px-6 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#292648] text-white px-4 sm:px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default LeaveApplicationForm; 