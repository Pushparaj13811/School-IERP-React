import React from 'react';

interface Announcement {
  id: number;
  title: string;
  date: string;
  description: string;
}

const Announcements: React.FC = () => {
  // Sample announcements data
  const announcements: Announcement[] = [
    {
      id: 1,
      title: "Event Name",
      date: "Event Date",
      description: "Event Description........................................................................................."
    },
    {
      id: 2,
      title: "First Term Examination",
      date: "10/02/2025 to 10/02/2025",
      description: "Dear Students, From 10-02-2025 to 15-02-2025 your first terminal exam is starting so study well while raising the bar high. Give your best and work for it.\nBest of luck !"
    },
    {
      id: 3,
      title: "Maha Shivratri",
      date: "26/02/2025",
      description: "On the auspicious occasion of Maha Shivratri we are having holiday on 26/02/2025 Wednesday.There will be no session on this day. Enjoy this great festival with love and tasty foods."
    },
    {
      id: 4,
      title: "Practical Evaluation",
      date: "5/03/2025",
      description: "Practical evaluation will be conducted on March 5th, 2025. Please come prepared with your practical notebooks and materials."
    }
  ];

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Announcements</h2>
        
        <div className="w-full">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="mb-4">
              <div className="bg-[#292648] text-white p-3 rounded-t">
                <h3 className="font-medium">{announcement.title}</h3>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-b">
                <p className="text-gray-700 font-medium mb-2">{announcement.date}</p>
                <p className="text-gray-600 whitespace-pre-line">{announcement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements; 