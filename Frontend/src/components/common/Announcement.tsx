import React from 'react';

interface AnnouncementProps {
  date: string;
  time: string;
  title: string;
  content: string;
}

const Announcement: React.FC<AnnouncementProps> = ({ date, time, title, content }) => {
  return (
    <div className="p-3 mb-3 bg-gray-100 shadow-sm rounded flex flex-col">
      <div className="flex justify-between">
        <p className="mb-1 text-gray-500">{date}</p>
        <p className="text-gray-500">{time}</p>
      </div>
      <h2 className="font-bold text-xl text-primary">{title}</h2>
      <p className="mb-0 text-gray-500">{content}</p>
    </div>
  );
};

export default Announcement; 