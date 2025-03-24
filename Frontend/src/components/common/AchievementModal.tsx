import React from 'react';
import Button from '../ui/Button';

interface AchievementDetails {
  activityType: string;
  activityName: string;
  organization: string;
  heldFrom: string;
  heldTo: string;
  noOfDays: string;
  description: string;
  certificateUrl: string;
}

interface AchievementModalProps {
  show: boolean;
  achievement: AchievementDetails;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  show,
  achievement,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-xl font-bold text-gray-800">Achievement Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-700 font-semibold">Activity Type:</p>
              <p className="text-gray-600">{achievement.activityType}</p>
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Activity Name:</p>
              <p className="text-gray-600">{achievement.activityName}</p>
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Organization:</p>
              <p className="text-gray-600">{achievement.organization}</p>
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Duration:</p>
              <p className="text-gray-600">
                {achievement.heldFrom} to {achievement.heldTo} ({achievement.noOfDays} days)
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 font-semibold">Description:</p>
            <p className="text-gray-600">{achievement.description}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 font-semibold">Certificate:</p>
            <img 
              src={achievement.certificateUrl} 
              alt="Certificate" 
              className="mt-2 max-w-full h-auto"
            />
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal; 