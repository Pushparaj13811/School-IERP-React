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
    <div className="overflow-hidden rounded-lg shadow-sm bg-[#EEF5FF]">
      <div className="overflow-hidden border border-orange-400 rounded-lg">
        <img 
          src={achievement.certificateUrl} 
          alt={achievement.title} 
          className="object-cover w-full h-48"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-bold text-gray-800">{achievement.title}</h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">{achievement.description}</p>
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