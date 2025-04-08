import React, { useState } from 'react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  certificateUrl: string;
  activityType?: string;
  activityName?: string;
  organization?: string;
  heldFrom?: string;
  heldTo?: string;
  noOfDays?: string;
  testimonial?: string;
}

interface EditAchievementModalProps {
  isOpen: boolean;
  achievement: Achievement | null;
  onClose: () => void;
  onSave: (updated: Achievement) => void;
}

const EditAchievementModal: React.FC<EditAchievementModalProps> = ({ isOpen, achievement, onClose, onSave }) => {
  const [editedAchievement, setEditedAchievement] = useState<Achievement | null>(achievement);

  React.useEffect(() => {
    setEditedAchievement(achievement);
  }, [achievement]);

  if (!isOpen || !editedAchievement) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedAchievement((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = () => {
    if (editedAchievement) {
      onSave(editedAchievement);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Edit Achievement</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            name="activityType"
            value={editedAchievement.activityType || ''}
            onChange={handleChange}
            placeholder="Activity Type"
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="activityName"
            value={editedAchievement.activityName || ''}
            onChange={handleChange}
            placeholder="Activity Name"
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="organization"
            value={editedAchievement.organization || ''}
            onChange={handleChange}
            placeholder="Organization"
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="noOfDays"
            value={editedAchievement.noOfDays || ''}
            onChange={handleChange}
            placeholder="No of Days"
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="heldFrom"
            value={editedAchievement.heldFrom || ''}
            onChange={handleChange}
            placeholder="Held From"
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            name="heldTo"
            value={editedAchievement.heldTo || ''}
            onChange={handleChange}
            placeholder="Held To"
            className="p-2 border rounded-md"
          />
        </div>

        <div className="mt-4">
          <textarea
            name="description"
            value={editedAchievement.description || ''}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border p-2 rounded-md min-h-[100px]"
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 text-white bg-gray-600 rounded-md">
            Close
          </button>
          <button onClick={handleSave} className="px-6 py-2 text-white bg-blue-600 rounded-md">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAchievementModal;
