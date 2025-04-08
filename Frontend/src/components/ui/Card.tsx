import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white shadow-sm rounded  p-4 ${className}`}>
      {title && (
        <>
          <h2 className="mb-2 text-xl font-bold heading-font">{title}</h2>
          <hr className="w-full mb-4 border border-gray-300 border-1" />
        </>
      )}
      {children}
    </div>
  );
};

export default Card; 