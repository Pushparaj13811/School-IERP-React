import React, { useState } from "react";
import AchievementCard from "../../components/common/AchievementCard";
import AchievementDetailModal from "../../components/common/AchievementDetailModal";
import AddAchievementModal, { AchievementFormData } from "../../components/common/AddAchievementModal";

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

// Sample achievement data
const sampleAchievements: Achievement[] = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  title: "21 Day NextCode Challenge",
  description: "I solved HTML CSS Bootstratp problem for 21 days given by N........",
  certificateUrl: "https://www.wordtemplates4u.org/wp-content/uploads/2018/12/Achievement-Certificate-Template-02.jpg",
}));

const Achievement: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(sampleAchievements);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleViewDetails = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAchievement(null);
  };

  const handleAddAchievement = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveAchievement = (data: AchievementFormData) => {
    // Create a new achievement with the form data
    const newAchievement: Achievement = {
      id: achievements.length + 1,
      title: data.title || "New Achievement",
      description: data.description || "No description provided",
      certificateUrl: "https://images.pexels.com/photos/5428833/pexels-photo-5428833.jpeg?auto=compress&cs=tinysrgb&w=800",
      activityType: data.activityType,
      activityName: data.title,
      organization: data.organizations,
      heldFrom: data.from,
      heldTo: data.to,
      noOfDays: data.noOfDays,
      testimonial: data.testimonial
    };

    // Add the new achievement to the list
    setAchievements([...achievements, newAchievement]);
  };

  return (
    <div className="p-4 bg-[#EEF5FF]">
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Achievements</h2>
          <button 
            onClick={handleAddAchievement}
            className="bg-[#292648] text-white px-6 py-2 rounded-md"
          >
            Add Achievements
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard 
              key={achievement.id}
              achievement={achievement}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal 
        isOpen={isDetailModalOpen}
        achievement={selectedAchievement}
        onClose={handleCloseDetailModal}
      />

      {/* Add Achievement Modal */}
      <AddAchievementModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAchievement}
      />
    </div>
  );
};

export default Achievement; 