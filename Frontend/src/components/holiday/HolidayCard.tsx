import React from 'react';
import { format, parseISO } from 'date-fns';

interface HolidayCardProps {
  title: string;
  fromDate: string;
  toDate: string;
  description?: string;
  typeName: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

/**
 * HolidayCard component - Displays holiday information in a card format
 */
const HolidayCard: React.FC<HolidayCardProps> = ({ 
  title, 
  fromDate, 
  toDate, 
  description, 
  typeName,
  isRecurring,
  recurrencePattern
}) => {
  // Format dates for display
  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };
  
  // Calculate duration in days
  const calculateDuration = () => {
    try {
      const startDate = parseISO(fromDate);
      const endDate = parseISO(toDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      return diffDays;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 1;
    }
  };
  
  const duration = calculateDuration();
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="bg-[#292648] p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium">
              {format(parseISO(fromDate), 'MMMM yyyy')}
            </div>
            <div className="text-4xl font-bold">
              {format(parseISO(fromDate), 'dd')}
            </div>
            <div className="text-sm">
              {format(parseISO(fromDate), 'EEEE')}
            </div>
          </div>
          <div className="text-right">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              {typeName}
            </span>
            {isRecurring && (
              <span className="ml-1 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                Recurring
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-md font-bold mb-2 text-[#292648] truncate">
          {title}
        </h3>
        
        <div className="flex items-center mb-2 text-gray-600 text-sm">
          <div className="mr-4">
            <span className="font-medium">From: {formatDisplayDate(fromDate)}</span>
          </div>
          <div>
            <span className="font-medium">To: {formatDisplayDate(toDate)}</span>
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {description}
          </p>
        )}
        
        <div className="mt-2 flex justify-between items-center">
          <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded-full">
            {duration} {duration === 1 ? 'day' : 'days'}
          </span>
          
          {isRecurring && recurrencePattern && (
            <div className="group relative">
              <span className="text-xs text-purple-500 italic cursor-help">
                {recurrencePattern}
              </span>
              <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded p-2 whitespace-nowrap">
                Recurring: {recurrencePattern}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayCard; 