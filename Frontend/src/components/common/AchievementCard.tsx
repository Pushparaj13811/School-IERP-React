import React from "react";

interface Achievement {
  id: number;
  title: string;
  description: string;
  certificateUrl: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  onViewDetails: (achievement: Achievement) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border border-orange-400 rounded-lg overflow-hidden">
        <img 
          src={achievement.certificateUrl} 
          alt={achievement.title} 
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{achievement.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{achievement.description}</p>
        <button 
          onClick={() => onViewDetails(achievement)}
          className="bg-[#292648] text-white px-4 py-2 rounded-md text-sm"
        >
          View File
        </button>
      </div>
    </div>
  );
};

export default AchievementCard; 