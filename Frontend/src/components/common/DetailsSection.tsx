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
    <div className="p-4 shadow-sm bg-white rounded text-start">
      <h2 className="text-dark font-bold text-xl">{title}</h2>
      <hr className="border border-gray-800 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
        {details.map((detail, index) => (
          <div key={index} className="flex">
            <strong className="w-1/3 text-gray-900">{detail.label}:</strong>
            <p className="w-2/3 text-gray-500">{detail.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailsSection; 