import React from "react";

interface LeaveFormData {
  subject: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  description: string;
}

interface LeaveApplicationFormProps {
  formData: LeaveFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const LeaveApplicationForm: React.FC<LeaveApplicationFormProps> = ({ 
  formData, 
  onChange, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="mb-6 w-full">
        <div className="mb-6">
          <label className="block text-gray-600 mb-2">Kind of Leave</label>
          <input
            type="text"
            name="leaveType"
            value={formData.leaveType}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#292648]"
            placeholder="Sick Leave, Personal Leave, etc."
            required
          />
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
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#292648] text-white px-4 sm:px-6 py-2 rounded-md hover:bg-opacity-90"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default LeaveApplicationForm; 