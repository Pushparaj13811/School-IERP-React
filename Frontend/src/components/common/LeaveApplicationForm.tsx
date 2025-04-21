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
  
  // Form IDs for accessibility
  const formId = "leave-application-form";
  const leaveTypeId = "leave-type-select";
  const subjectId = "leave-subject";
  const fromDateId = "leave-from-date";
  const toDateId = "leave-to-date";
  const descriptionId = "leave-description";
  const dateErrorId = "date-error-message";

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

  // Handle keyboard navigation for form submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (!dateError && !isSubmitting) {
        onSubmit(e);
      }
    }
  };

  return (
    <form 
      id={formId}
      onSubmit={onSubmit} 
      className="w-full"
      onKeyDown={handleKeyDown}
      aria-label="Leave Application Form"
    >
      <div className="mb-6 w-full">
        <div className="mb-6">
          <label 
            htmlFor={leaveTypeId} 
            className="block text-gray-600 mb-2"
          >
            Leave Type
          </label>
          {isLoading ? (
            <div 
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
              aria-live="polite"
            >
              Loading leave types...
            </div>
          ) : error ? (
            <div 
              className="text-red-500 text-sm mb-2"
              role="alert"
            >
              {error}
            </div>
          ) : (
            <select
              id={leaveTypeId}
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
              required
              aria-required="true"
              aria-invalid={formData.leaveTypeId ? "false" : "true"}
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
          <label 
            htmlFor={subjectId} 
            className="block text-gray-600 mb-2"
          >
            Subject
          </label>
          <input
            id={subjectId}
            type="text"
            name="subject"
            value={formData.subject}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
            required
            aria-required="true"
            aria-invalid={formData.subject ? "false" : "true"}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              htmlFor={fromDateId} 
              className="block text-gray-600 mb-2"
            >
              From (Date)
            </label>
            <input
              id={fromDateId}
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleDateChange}
              min={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
              required
              aria-required="true"
              aria-invalid={formData.fromDate && !dateError ? "false" : "true"}
              aria-describedby={dateError ? dateErrorId : undefined}
            />
          </div>
          <div>
            <label 
              htmlFor={toDateId} 
              className="block text-gray-600 mb-2"
            >
              To (Date)
            </label>
            <input
              id={toDateId}
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleDateChange}
              min={formData.fromDate || today}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
              required
              aria-required="true"
              aria-invalid={formData.toDate && !dateError ? "false" : "true"}
              aria-describedby={dateError ? dateErrorId : undefined}
            />
          </div>
        </div>
        
        {dateError && (
          <div 
            id={dateErrorId}
            className="mt-2 text-red-500 text-sm"
            role="alert"
            aria-live="assertive"
          >
            {dateError}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <label 
          htmlFor={descriptionId} 
          className="block text-gray-600 mb-2"
        >
          Description
        </label>
        <textarea
          id={descriptionId}
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
          required
          aria-required="true"
          aria-invalid={formData.description ? "false" : "true"}
        ></textarea>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 sm:px-6 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          disabled={isSubmitting}
          aria-label="Cancel application"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#292648] text-white px-4 sm:px-6 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#292648]"
          disabled={isSubmitting || !!dateError}
          aria-label="Submit leave application"
          aria-busy={isSubmitting ? "true" : "false"}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <p>Tip: Press Ctrl+Enter to submit the form quickly.</p>
      </div>
    </form>
  );
};

export default LeaveApplicationForm; 