import React, { useState } from "react";

export interface AchievementFormData {
  activityType: string;
  title: string;
  organizations: string;
  noOfDays: string;
  from: string;
  to: string;
  description: string;
  testimonial: string;
  certificateFile: File | null;
}

interface AddAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AchievementFormData) => void;
}

const AddAchievementModal: React.FC<AddAchievementModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<AchievementFormData>({
    activityType: "",
    title: "",
    organizations: "",
    noOfDays: "",
    from: "",
    to: "",
    description: "",
    testimonial: "",
    certificateFile: null
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Achievement Details</h2>
          <button 
            onClick={onClose}
            className="bg-[#292648] text-white px-6 py-2 rounded-md"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 mb-1">Activity Type</label>
              <input
                type="text"
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292648]"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292648]"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Organizations</label>
              <input
                type="text"
                name="organizations"
                value={formData.organizations}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292648]"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">No of Days</label>
              <input
                type="text"
                name="noOfDays"
                value={formData.noOfDays}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292648]"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">From</label>
              <input
                type="date"
                name="from"
                value={formData.from}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292648]"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">To</label>
              <input
                type="date"
                name="to"
                value={formData.to}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292648]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-gray-600 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292648]"
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Testimonial</label>
              <textarea
                name="testimonial"
                value={formData.testimonial}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#292648]"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-[#292648] text-white px-6 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAchievementModal; 