import React, { useState, useEffect } from "react";
import { format } from "date-fns";
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
  const [dateError, setDateError] = useState<string | null>(null);
  
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // Validate date ranges when dates change
  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      if (formData.toDate < formData.fromDate) {
        setDateError("End date cannot be before start date");
      } else {
        setDateError(null);
      }
    }
  }, [formData.fromDate, formData.toDate]);

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Allow the onChange handler to update the form state
    onChange(e);
    
    // Additional validation logic
    if (name === "fromDate" && value < today) {
      setDateError("Cannot apply for leave in the past");
    } else if (name === "toDate" && formData.fromDate && value < formData.fromDate) {
      setDateError("End date cannot be before start date");
    } else {
      setDateError(null);
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
              onChange={handleDateChange}
              min={today}
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
              onChange={handleDateChange}
              min={formData.fromDate || today}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
              required
            />
          </div>
        </div>
        
        {dateError && (
          <div className="mt-2 text-red-500 text-sm">{dateError}</div>
        )}
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
          disabled={isSubmitting || !!dateError}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default LeaveApplicationForm; 