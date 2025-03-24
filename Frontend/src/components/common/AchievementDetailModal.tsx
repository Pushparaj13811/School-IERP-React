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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600 mb-1">Activity Type</p>
                <p className="font-medium">{achievement.activityType || "22SOECE11630"}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Activity Name</p>
                <p className="font-medium">{achievement.activityName || achievement.title || "Ruchi Pathak"}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Organization</p>
                <p className="font-medium">{achievement.organization || "Female"}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">No of Days</p>
                <p className="font-medium">{achievement.noOfDays || "2002-04-01"}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Held From</p>
                <p className="font-medium">{achievement.heldFrom || "Kiran Pathak"}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Held To</p>
                <p className="font-medium">{achievement.heldTo || "Sarina Pathak"}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Description</p>
              <p className="font-medium">{achievement.description || "7"}</p>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="border border-orange-400 rounded-lg overflow-hidden">
              <img 
                src={achievement.certificateUrl} 
                alt={achievement.title} 
                className="max-w-full h-auto"
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