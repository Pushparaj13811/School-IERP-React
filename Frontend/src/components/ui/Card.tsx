import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white shadow-sm rounded p-4 ${className}`}>
      {title && (
        <>
          <h2 className="text-xl font-bold heading-font mb-2">{title}</h2>
          <hr className="border border-gray-300 border-1 mb-4 w-full" />
        </>
      )}
      {children}
    </div>
  );
};

export default Card; 