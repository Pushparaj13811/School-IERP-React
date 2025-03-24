import React from 'react';

interface DetailItem {
  label: string;
  value: string;
}

interface DetailsSectionProps {
  title: string;
  details: DetailItem[];
}

const DetailsSection: React.FC<DetailsSectionProps> = ({ title, details }) => {
  return (
    <div className="p-6 shadow-sm bg-white rounded-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <div className="h-px bg-gray-200 w-full mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {details.map((detail, index) => (
          <div key={index} className="flex flex-col">
            <span className="text-sm text-gray-500 font-medium">{detail.label}</span>
            <span className="text-base text-gray-800">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailsSection; 