import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import api from "../../services/api";

// Define a type for API response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Define a type for holiday data
interface HolidayData {
  id: number;
  title: string;
  description: string | null;
  date: string;
  toDate: string;
  isRecurring: boolean;
  recurrencePattern: string | null;
  holidayType: {
    id: number;
    name: string;
    color: string;
  };
}

// Define a type for the processed holiday data
interface ProcessedHolidayData {
  id: number;
  holidayName: string;
  fromDate: string;
  toDate: string;
  day: string;
  month: string;
  weekday: string;
  date: string;
  description: string;
  color: string;
  holidayType?: {
    id: number;
    name: string;
    color: string;
  };
}

// Define a type for the highlighted holiday
interface HighlightedHoliday {
  day: string;
  month: string;
  weekday: string;
  date: string;
  name: string;
  description: string;
  color?: string;
}

const Holiday: React.FC = () => {
  // State to store holidays
  const [holidays, setHolidays] = useState<ProcessedHolidayData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State to track the currently selected holiday for display in the highlight card
  const [highlightedHoliday, setHighlightedHoliday] = useState<HighlightedHoliday>({
    day: "",
    month: "",
    weekday: "",
    date: "",
    name: "",
    description: "",
    color: "#C32232"
  });

  // Fetch holidays from the API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        // Use the correct endpoint for upcoming holidays
        const response = await api.get<ApiResponse<{ holidays: HolidayData[] }>>('/holidays/upcoming');
        
        if (response.data.success) {
          const processedHolidays = processHolidayData(response.data.data.holidays);
          setHolidays(processedHolidays);
          
          // Set the first holiday as highlighted if available
          if (processedHolidays.length > 0) {
            const firstHoliday = processedHolidays[0];
            setHighlightedHoliday({
              day: firstHoliday.day,
              month: firstHoliday.month,
              weekday: firstHoliday.weekday,
              date: firstHoliday.date,
              name: firstHoliday.holidayName,
              description: firstHoliday.description,
              color: firstHoliday.color
            });
          } else {
            // Set a default message if no holidays
            setHighlightedHoliday({
              day: "0",
              month: "No upcoming",
              weekday: "holidays",
              date: "No upcoming holidays",
              name: "No holidays found",
              description: "There are no upcoming holidays scheduled.",
              color: "#C32232"
            });
          }
        } else {
          toast.error("Failed to load holidays");
          console.error("API error:", response.data.message);
        }
      } catch (error) {
        toast.error("Failed to load holidays");
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  // Process holiday data to match the format needed for display
  const processHolidayData = (apiHolidays: HolidayData[]): ProcessedHolidayData[] => {
    return apiHolidays.map(holiday => {
      try {
        // Get date values
        const fromDate = new Date(holiday.date);
        const toDate = new Date(holiday.toDate);
        
        // Create safe holidayType object
        const safeHolidayType = holiday.holidayType || { id: 0, name: 'Default', color: '#C32232' };
        
        return {
          id: holiday.id,
          holidayName: holiday.title || '',
          fromDate: formatDateToString(fromDate),
          toDate: formatDateToString(toDate),
          day: fromDate.getDate().toString().padStart(2, '0'),
          month: format(fromDate, 'MMM yyyy'),
          weekday: format(fromDate, 'EEEE'),
          date: fromDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          description: holiday.description || "",
          color: safeHolidayType.color || "#C32232",
          holidayType: safeHolidayType
        };
      } catch (error) {
        console.error('Error processing holiday data:', error, holiday);
        // Return a default object if there's an error
        return {
          id: holiday.id || 0,
          holidayName: holiday.title || 'Unknown Holiday',
          fromDate: 'Invalid date',
          toDate: 'Invalid date',
          day: '01',
          month: 'Jan 2023',
          weekday: 'Monday',
          date: 'January 1, 2023',
          description: holiday.description || "",
          color: "#C32232",
          holidayType: { id: 0, name: 'Default', color: '#C32232' }
        };
      }
    });
  };

  // Helper function to format date to DD/MM/YYYY
  const formatDateToString = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Handler for when a holiday row is clicked
  const handleHolidayClick = (holiday: ProcessedHolidayData) => {
    setHighlightedHoliday({
      day: holiday.day,
      month: holiday.month,
      weekday: holiday.weekday,
      date: holiday.date,
      name: holiday.holidayName,
      description: holiday.description,
      color: holiday.color
    });
  };

  return (
    <div className="p-4 bg-[#EEF5FF]">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C32232]"></div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Holiday Details</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Holiday highlight card - left side */}
            <div className="md:col-span-5 bg-[#EDF6FF] rounded-lg overflow-hidden shadow-sm">
              <div className="p-8 text-center">
                <div className="mb-1 text-sm text-gray-600">{highlightedHoliday.month}</div>
                <div className="text-[80px] font-bold text-[#C32232] leading-none mb-1" style={{ color: highlightedHoliday.color }}>{highlightedHoliday.day}</div>
                <div className="mb-4 text-sm text-gray-600">{highlightedHoliday.weekday}</div>
                
                <div className="h-[1px] bg-gray-300 my-4 mx-12"></div>
                
                <div className="mb-2 text-xl font-bold text-gray-800">{highlightedHoliday.date}</div>
                <div className="font-bold text-xl text-[#C32232] mb-4" style={{ color: highlightedHoliday.color }}>{highlightedHoliday.name}</div>
                
                <p className="px-4 text-sm text-gray-600">
                  {highlightedHoliday.description}
                </p>
              </div>
            </div>
            
            {/* Holiday calendar - right side */}
            <div className="overflow-hidden md:col-span-7">
              <div className="bg-[#292648] text-white py-3 px-6 flex justify-between items-center">
                <div className="font-semibold">Holiday Name</div>
                <div className="font-semibold">Holiday Type</div>
                <div className="flex pr-5 mr-8">
                  <div className="pr-10 font-semibold">From Date</div>
                  <div className="font-semibold">To Date</div>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[500px]">
                {holidays.map((holiday, index) => (
                  <div 
                    key={holiday.id} 
                    className={`flex justify-between items-center py-3 px-6 border-b ${
                      index % 2 === 0 ? 'bg-[#EEF5FF]' : 'bg-[#D9E4FF]'
                    } cursor-pointer hover:bg-gray-100 transition-colors`}
                    onClick={() => handleHolidayClick(holiday)}
                  >
                    <div className="text-sm font-medium text-gray-800">{holiday.holidayName}</div>
                    <div className="text-sm font-medium text-gray-800">{holiday.holidayType?.name}</div>
                    <div className="flex">
                      <div className="text-sm text-center text-gray-600 w-28">{holiday.fromDate}</div>
                      <div className="text-sm text-center text-gray-600 w-28">{holiday.toDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holiday; 