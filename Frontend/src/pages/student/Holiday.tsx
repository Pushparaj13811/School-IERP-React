import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import { holidayApi } from "../../services/api";

// Define a type for API response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Define a type for holiday data
interface HolidayData {
  id: number;
  title?: string;  // From upcoming holidays API
  name?: string;   // From all holidays API
  description: string | null;
  date?: string;   // From upcoming holidays API
  fromDate?: string; // From all holidays API
  toDate: string;
  isRecurring: boolean;
  recurrencePattern: string | null;
  holidayType: {
    id: number;
    name: string;
    color?: string; // Make color optional to handle both API formats
    description?: string;
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
    color?: string;
    description?: string;
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

type HolidayView = 'upcoming' | 'all';

const Holiday: React.FC = () => {
  // State to store holidays
  const [upcomingHolidays, setUpcomingHolidays] = useState<ProcessedHolidayData[]>([]);
  const [allHolidays, setAllHolidays] = useState<ProcessedHolidayData[]>([]);
  const [activeView, setActiveView] = useState<HolidayView>('upcoming');
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

  // Getter for the active holidays based on the selected view
  const activeHolidays = activeView === 'upcoming' ? upcomingHolidays : allHolidays;

  // Fetch holidays from the API
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming holidays
        console.log("Fetching upcoming holidays...");
        const upcomingResponse = await holidayApi.getUpcomingHolidays();
        
        console.log("Upcoming holidays API response:", upcomingResponse.data);
        
        let processedUpcomingHolidays: ProcessedHolidayData[] = [];
        
        if (upcomingResponse.data.status === 'success' && upcomingResponse.data.data.holidays.length > 0) {
          // Check if we received an empty array
          if (Array.isArray(upcomingResponse.data.data.holidays) && upcomingResponse.data.data.holidays.length === 0) {
            console.log("Received empty holidays array from upcoming holidays API");
          }
          
          processedUpcomingHolidays = processHolidayData(upcomingResponse.data.data.holidays);
          console.log("Processed upcoming holidays:", processedUpcomingHolidays);
          setUpcomingHolidays(processedUpcomingHolidays);
          
          // Set the first upcoming holiday as highlighted if available
          if (processedUpcomingHolidays.length > 0 && activeView === 'upcoming') {
            setHighlightedHolidayFromProcessed(processedUpcomingHolidays[0]);
          } else if (processedUpcomingHolidays.length === 0 && activeView === 'upcoming') {
            // Set a default message if no upcoming holidays
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
          toast.error("Failed to load upcoming holidays");
          console.error("API error:", upcomingResponse.data.message);
        }
        
        // Fetch all holidays
        try {
          console.log("Fetching all holidays...");
          const allResponse = await api.get<ApiResponse<{ 
            holidays: HolidayData[], 
            pagination: { totalCount: number; totalPages: number; currentPage: number } 
          }>>('/holidays');
          
          console.log("All holidays API response:", allResponse.data);
          
          if (allResponse.data.success) {
            const processedAllHolidays = processHolidayData(allResponse.data.data.holidays);
            console.log("Processed all holidays:", processedAllHolidays);
            setAllHolidays(processedAllHolidays);
            
            // If we didn't get any upcoming holidays but have all holidays,
            // filter the upcoming ones manually using date ranges
            if (processedUpcomingHolidays.length === 0 && processedAllHolidays.length > 0) {
              console.log("No upcoming holidays from API, filtering from all holidays...");
              const today = new Date();
              console.log("Today's date:", today.toISOString());
              
              const thirtyDaysLater = new Date();
              thirtyDaysLater.setDate(today.getDate() + 30);
              console.log("30 days later date:", thirtyDaysLater.toISOString());
              
              console.log("All holidays to filter:", processedAllHolidays);
              
              // Filter holidays that start in the next 30 days
              const manualUpcomingHolidays = processedAllHolidays.filter(holiday => {
                console.log("Checking holiday for upcoming status:", holiday);
                
                try {
                  // First try parsing from the formatted date (DD/MM/YYYY)
                  let holidayDate: Date | null = null;
                  
                  if (holiday.fromDate.includes('/')) {
                    // Parse DD/MM/YYYY format
                    const parts = holiday.fromDate.split('/');
                    if (parts.length === 3) {
                      const day = parseInt(parts[0]);
                      const month = parseInt(parts[1]) - 1; // Months are 0-based in JavaScript
                      const year = parseInt(parts[2]);
                      
                      holidayDate = new Date(year, month, day);
                      console.log(`Parsed date from DD/MM/YYYY: ${holiday.fromDate} → ${holidayDate.toISOString()}`);
                    }
                  }
                  
                  // If not parsed successfully, try different methods
                  if (!holidayDate || isNaN(holidayDate.getTime())) {
                    // Try direct Date constructor
                    holidayDate = new Date(holiday.fromDate);
                    console.log(`Parsed date directly: ${holiday.fromDate} → ${holidayDate.toISOString()}`);
                  }
                  
                  // Check if date is valid
                  if (!holidayDate || isNaN(holidayDate.getTime())) {
                    console.error("Failed to parse date:", holiday.fromDate);
                    return false;
                  }
                  
                  // Check if it's in the next 30 days
                  const isUpcoming = holidayDate >= today && holidayDate <= thirtyDaysLater;
                  console.log(`Holiday date: ${holidayDate.toISOString()}, Is upcoming: ${isUpcoming}`);
                  return isUpcoming;
                } catch (error) {
                  console.error("Error parsing date for holiday filtering:", error, holiday);
                  return false;
                }
              });
              
              console.log("Manually filtered upcoming holidays:", manualUpcomingHolidays);
              
              if (manualUpcomingHolidays.length > 0) {
                console.log("Setting manually filtered upcoming holidays to state");
                setUpcomingHolidays(manualUpcomingHolidays);
                
                if (activeView === 'upcoming') {
                  setHighlightedHolidayFromProcessed(manualUpcomingHolidays[0]);
                }
              }
            }
            
            // If there are no upcoming holidays but there are all holidays, set the first all holiday as highlighted
            if (upcomingHolidays.length === 0 && processedAllHolidays.length > 0 && activeView === 'all') {
              setHighlightedHolidayFromProcessed(processedAllHolidays[0]);
            } else if (processedAllHolidays.length === 0 && activeView === 'all') {
              // Set a default message if no holidays
              setHighlightedHoliday({
                day: "0",
                month: "No",
                weekday: "holidays",
                date: "No holidays",
                name: "No holidays found",
                description: "There are no holidays in the system.",
                color: "#C32232"
              });
            }
          } else {
            toast.error("Failed to load all holidays");
            console.error("API error:", allResponse.data.message);
          }
        } catch (allError) {
          console.error("Error fetching all holidays:", allError);
          // Don't show toast here if upcoming holidays loaded successfully
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

  // Update highlighted holiday when view changes
  useEffect(() => {
    const holidays = activeView === 'upcoming' ? upcomingHolidays : allHolidays;
    
    if (holidays.length > 0) {
      setHighlightedHolidayFromProcessed(holidays[0]);
    } else {
      // Set a default message if no holidays in this view
      setHighlightedHoliday({
        day: "0",
        month: activeView === 'upcoming' ? "No upcoming" : "No",
        weekday: "holidays",
        date: activeView === 'upcoming' ? "No upcoming holidays" : "No holidays",
        name: "No holidays found",
        description: activeView === 'upcoming' 
          ? "There are no upcoming holidays scheduled." 
          : "There are no holidays in the system.",
        color: "#C32232"
      });
    }
  }, [activeView, upcomingHolidays, allHolidays]);

  // Helper function to set highlighted holiday from processed holiday data
  const setHighlightedHolidayFromProcessed = (holiday: ProcessedHolidayData) => {
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

  // Process holiday data to match the format needed for display
  const processHolidayData = (apiHolidays: HolidayData[]): ProcessedHolidayData[] => {
    console.log("Processing raw holiday data:", JSON.stringify(apiHolidays));
    
    return apiHolidays.map(holiday => {
      try {
        // Handle both API response formats
        const fromDateStr = holiday.date || holiday.fromDate;
        const holidayName = holiday.title || holiday.name || '';
        
        if (!fromDateStr) {
          throw new Error(`Missing date information for holiday: ${JSON.stringify(holiday)}`);
        }
        
        console.log(`Processing holiday: ${holidayName}, date: ${fromDateStr}`);
        
        // Get date values
        const fromDate = new Date(fromDateStr);
        const toDate = new Date(holiday.toDate);
        
        console.log(`Parsed dates - fromDate: ${fromDate.toISOString()}, toDate: ${toDate.toISOString()}`);
        
        // Validate dates
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          throw new Error(`Invalid date format: ${fromDateStr} or ${holiday.toDate}`);
        }
        
        // Create safe holidayType object
        const safeHolidayType = holiday.holidayType || { id: 0, name: 'Default', color: '#C32232' };
        
        const result = {
          id: holiday.id,
          holidayName: holidayName,
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
        
        console.log("Processed holiday result:", result);
        return result;
      } catch (error) {
        console.error('Error processing holiday data:', error, holiday);
        // Return a default object if there's an error
        return {
          id: holiday.id || 0,
          holidayName: holiday.title || holiday.name || 'Unknown Holiday',
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
    setHighlightedHolidayFromProcessed(holiday);
  };

  // Debug API directly
  useEffect(() => {
    const debugAPI = async () => {
      try {
        console.log("=== DIRECT API DEBUG ===");
        
        // Check holiday service using the API service
        console.log("Checking upcoming holidays from API service...");
        try {
          const upcomingResponse = await holidayApi.getUpcomingHolidays();
          console.log("Upcoming holidays API response:", upcomingResponse.data);
          
          if (upcomingResponse.data?.status === 'success' && 
              upcomingResponse.data?.data?.holidays) {
            console.log(`API returned ${upcomingResponse.data.data.holidays.length} upcoming holidays`);
            
            if (upcomingResponse.data.data.holidays.length === 0) {
              console.log("No upcoming holidays returned from API.");
            }
          }
        } catch (upErr) {
          console.error("Error calling upcoming holidays API:", upErr);
        }
        
        // Check all holidays
        console.log("Checking all holidays from API service...");
        try {
          const allResponse = await holidayApi.getHolidays();
          console.log("All holidays API response:", allResponse.data);
          
          if (allResponse.data?.status === 'success' && 
              allResponse.data?.data?.holidays) {
            console.log(`API returned ${allResponse.data.data.holidays.length} total holidays`);
            
            // Try to find upcoming ones
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + 30);
            
            // Manually check which holidays are upcoming
            const manualUpcoming = allResponse.data.data.holidays.filter((h: HolidayData) => {
              try {
                const holidayDate = new Date(h.fromDate || h.date || '');
                const isUpcoming = holidayDate >= today && holidayDate <= futureDate;
                
                if (isUpcoming) {
                  console.log("Found upcoming holiday:", h);
                }
                
                return isUpcoming;
              } catch (dateErr) {
                console.error("Error checking if holiday is upcoming:", dateErr, h);
                return false;
              }
            });
            
            console.log(`Found ${manualUpcoming.length} upcoming holidays by manual filtering`);
            
            if (manualUpcoming.length > 0) {
              console.log("Using these manually filtered holidays to update the UI");
              const processed = processHolidayData(manualUpcoming);
              setUpcomingHolidays(processed);
              
              if (activeView === 'upcoming' && processed.length > 0) {
                setHighlightedHolidayFromProcessed(processed[0]);
              }
            }
          }
        } catch (allErr) {
          console.error("Error calling all holidays API:", allErr);
        }
        
        console.log("=== END DIRECT API DEBUG ===");
      } catch (error) {
        console.error("Debug API error:", error);
      }
    };
    
    // Run after initial data load
    setTimeout(debugAPI, 2000);
  }, []);

  return (
    <div className="p-4 bg-[#EEF5FF]">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C32232]"></div>
        </div>
      ) : (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Holiday Details</h2>
          
          {/* View toggle buttons */}
          <div className="mb-6 flex space-x-4">
            <Button
              variant={activeView === 'upcoming' ? 'outline' : 'primary'}
              className={`px-4 py-2 rounded-lg font-medium transition-colors`}
              onClick={() => setActiveView('upcoming')}
            >
              Upcoming Holidays
            </Button>
            <Button
              variant={activeView === 'all' ? 'outline' : 'primary'}
              className={`px-4 py-2 rounded-lg font-medium transition-colors`}
              onClick={() => setActiveView('all')}
            >
              All Holidays
            </Button>
          </div>

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
                {activeHolidays.length > 0 ? (
                  activeHolidays.map((holiday, index) => (
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
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No holidays to display
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holiday; 