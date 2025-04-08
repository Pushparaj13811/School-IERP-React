import React from "react";

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

interface AchievementDetailModalProps {
  isOpen: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({ isOpen, achievement, onClose }) => {
  if (!isOpen || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl p-6 bg-[#EEF5FF] rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Achievement Details</h2>
          <button 
            onClick={onClose}
            className="bg-[#292648] text-white px-6 py-2 rounded-md"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="mb-1 text-gray-600">Activity Type</p>
                <p className="font-medium">{achievement.activityType || "22SOECE11630"}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-600">Activity Name</p>
                <p className="font-medium">{achievement.activityName || achievement.title || "Ruchi Pathak"}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-600">Organization</p>
                <p className="font-medium">{achievement.organization || "Female"}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-600">No of Days</p>
                <p className="font-medium">{achievement.noOfDays || "2002-04-01"}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-600">Held From</p>
                <p className="font-medium">{achievement.heldFrom || "Kiran Pathak"}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-600">Held To</p>
                <p className="font-medium">{achievement.heldTo || "Sarina Pathak"}</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-gray-600">Description</p>
              <p className="font-medium">{achievement.description || "7"}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="overflow-hidden border border-orange-400 rounded-lg">
              <img 
                src={achievement.certificateUrl} 
                alt={achievement.title} 
                className="h-auto max-w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button className="bg-[#292648] text-white px-6 py-2 rounded-md">Download</button>
          <button className="bg-[#292648] text-white px-6 py-2 rounded-md">Edit</button>
        </div>
      </div>
    </div>
  );
};

export default AchievementDetailModal; 