import React from 'react';

interface HolidayCardProps {
  name: string;
  from: string;
  to: string;
  description: string;
}

const HolidayCard: React.FC<HolidayCardProps> = ({ name, from, to, description }) => {
  // Function to convert "DD/MM/YYYY" -> "YYYY-MM-DD"
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="shadow-sm rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
      <div className="bg-[#292648] text-white p-4 text-center">
        <div className="uppercase font-medium text-xs mb-1">
          {new Date(formatDate(from)).toLocaleString("en-US", { month: "long", year: "numeric" })}
        </div>
        <div className="text-3xl font-bold mb-1">{from.split("/")[0]}</div>
        <div className="text-xs">
          {new Date(formatDate(from)).toLocaleString("en-US", { weekday: "long" })}
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-bold text-[#292648] text-lg mb-2">{name}</h4>
        <div className="text-sm text-gray-500 mb-2 flex items-center">
          <i className="bi bi-calendar mr-2"></i>
          <span>{from} - {to}</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </div>
    </div>
  );
};

export default HolidayCard; 