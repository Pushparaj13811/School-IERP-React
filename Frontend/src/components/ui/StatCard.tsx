import React from 'react';

interface StatCardProps {
  icon: string;
  title: string;
  count: number;
  bgColor: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, count, bgColor, onClick }) => {
  const bgColorMap: Record<string, string> = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    secondary: 'bg-gray-500',
    danger: 'bg-red-500',
  };
  
  const bgClass = bgColorMap[bgColor] || 'bg-blue-500';
  
  return (
    <div 
      className={`${bgClass} bg-opacity-75 p-4 rounded shadow-sm flex flex-row justify-around items-center text-white cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex flex-col justify-center items-center text-center">
        <i className={`bi ${icon} text-4xl`}></i>
        <h4 className="text-lg font-medium">{title}</h4>
      </div>
      <div className="border-l-2 border-white h-16"></div>
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="text-3xl font-bold">{count}</h1>
      </div>
    </div>
  );
};

export default StatCard; 