import React, { useState } from "react";

// Define a type for holiday data
interface HolidayData {
  holidayName: string;
  fromDate: string;
  toDate: string;
  day: string;
  month: string;
  weekday: string;
  date: string;
  description: string;
}

// Define a type for the highlighted holiday
interface HighlightedHoliday {
  day: string;
  month: string;
  weekday: string;
  date: string;
  name: string;
  description: string;
}

// Holiday calendar data with more detailed information
const holidayCalendar: HolidayData[] = [
  { 
    holidayName: "Holi 2nd Day - Dhuleti", 
    fromDate: "14/03/2025", 
    toDate: "14/03/2025",
    day: "14",
    month: "Mar 2025",
    weekday: "Friday",
    date: "March 14, 2025",
    description: "The second day of Holi festival, known as Dhuleti, is celebrated with colored powders and water, symbolizing the arrival of spring and the victory of good over evil."
  },
  { 
    holidayName: "3rd Saturday Holiday", 
    fromDate: "15/03/2025", 
    toDate: "15/03/2025",
    day: "15",
    month: "Mar 2025",
    weekday: "Saturday",
    date: "March 15, 2025",
    description: "A regular holiday occurring on the third Saturday of the month as per the school calendar."
  },
  { 
    holidayName: "Ramzan-Id", 
    fromDate: "31/03/2025", 
    toDate: "31/03/2025",
    day: "31",
    month: "Mar 2025",
    weekday: "Monday",
    date: "March 31, 2025",
    description: "Ramzan-Id marks the end of Ramadan, the Islamic holy month of fasting. It's a day of feasting, prayer, and celebration for Muslims worldwide."
  },
  { 
    holidayName: "Shree Ram Navami", 
    fromDate: "06/04/2025", 
    toDate: "06/04/2025",
    day: "06",
    month: "Apr 2025",
    weekday: "Sunday",
    date: "April 6, 2025",
    description: "Ram Navami celebrates the birth of Lord Rama, the seventh avatar of Vishnu. The festival honors his life, teachings, and his victory of good over evil."
  },
  { 
    holidayName: "3rd Saturday Holiday", 
    fromDate: "12/04/2025", 
    toDate: "12/04/2025",
    day: "12",
    month: "Apr 2025",
    weekday: "Saturday",
    date: "April 12, 2025",
    description: "A regular holiday occurring on the third Saturday of the month as per the school calendar."
  },
  { 
    holidayName: "Dr. Babasaheb Ambedkar's Jayanti", 
    fromDate: "14/04/2025", 
    toDate: "14/04/2025",
    day: "14",
    month: "Apr 2025",
    weekday: "Monday",
    date: "April 14, 2025",
    description: "This day commemorates the birth anniversary of Dr. B.R. Ambedkar, the chief architect of the Indian Constitution and a prominent social reformer."
  },
  { 
    holidayName: "3rd Saturday Holiday", 
    fromDate: "17/05/2025", 
    toDate: "17/05/2025",
    day: "17",
    month: "May 2025",
    weekday: "Saturday",
    date: "May 17, 2025",
    description: "A regular holiday occurring on the third Saturday of the month as per the school calendar."
  },
  { 
    holidayName: "3rd Saturday Holiday", 
    fromDate: "21/06/2025", 
    toDate: "21/06/2025",
    day: "21",
    month: "Jun 2025",
    weekday: "Saturday",
    date: "June 21, 2025",
    description: "A regular holiday occurring on the third Saturday of the month as per the school calendar."
  },
  { 
    holidayName: "3rd Saturday Holiday", 
    fromDate: "19/07/2025", 
    toDate: "19/07/2025",
    day: "19",
    month: "Jul 2025",
    weekday: "Saturday",
    date: "July 19, 2025",
    description: "A regular holiday occurring on the third Saturday of the month as per the school calendar."
  },
  { 
    holidayName: "Raksha Bandhan", 
    fromDate: "09/08/2025", 
    toDate: "09/08/2025",
    day: "09",
    month: "Aug 2025",
    weekday: "Saturday",
    date: "August 9, 2025",
    description: "Raksha Bandhan is a Hindu festival celebrating the bond between brothers and sisters. Sisters tie a protective thread (rakhi) on their brothers' wrists, receiving gifts and protection in return."
  },
  { 
    holidayName: "Janmashtami", 
    fromDate: "14/08/2025", 
    toDate: "20/08/2025",
    day: "14",
    month: "Aug 2025",
    weekday: "Thursday",
    date: "August 14-20, 2025",
    description: "Janmashtami celebrates the birth of Lord Krishna, the eighth avatar of Vishnu. It is observed with devotional songs, dances, fasting, and night vigils."
  },
  { 
    holidayName: "Independence Day", 
    fromDate: "15/08/2025", 
    toDate: "15/08/2025",
    day: "15",
    month: "Aug 2025",
    weekday: "Friday",
    date: "August 15, 2025",
    description: "Independence Day commemorates India's independence from British rule on August 15, 1947. It's celebrated with flag hoisting, parades, and cultural programs across the country."
  },
  { 
    holidayName: "3rd Saturday Holiday", 
    fromDate: "20/09/2025", 
    toDate: "20/09/2025",
    day: "20",
    month: "Sep 2025",
    weekday: "Saturday",
    date: "September 20, 2025",
    description: "A regular holiday occurring on the third Saturday of the month as per the school calendar."
  },
  { 
    holidayName: "Gandhi Jayanti & Dussehra", 
    fromDate: "02/10/2025", 
    toDate: "02/10/2025",
    day: "02",
    month: "Oct 2025",
    weekday: "Thursday",
    date: "October 2, 2025",
    description: "This day marks both Gandhi Jayanti, the birth anniversary of Mahatma Gandhi, and Dussehra, which celebrates Lord Rama's victory over Ravana, symbolizing the triumph of good over evil."
  },
  { 
    holidayName: "3rd Saturday Holiday", 
    fromDate: "11/10/2025", 
    toDate: "11/10/2025",
    day: "11",
    month: "Oct 2025",
    weekday: "Saturday",
    date: "October 11, 2025",
    description: "A regular holiday occurring on the third Saturday of the month as per the school calendar."
  },
  { 
    holidayName: "Diwali Holiday", 
    fromDate: "20/10/2025", 
    toDate: "02/11/2025",
    day: "20-02",
    month: "Oct-Nov 2025",
    weekday: "Monday-Sunday",
    date: "October 20 - November 2, 2025",
    description: "Diwali, the festival of lights, celebrates the victory of light over darkness and good over evil. The extended holiday period includes multiple celebrations like Dhanteras, Naraka Chaturdashi, Lakshmi Puja, and Bhai Dooj."
  },
];

// Default highlighted holiday data (Maha Shivratri)
const defaultHighlightedHoliday: HighlightedHoliday = {
  day: "26",
  month: "Feb 2025",
  weekday: "Wednesday",
  date: "February 26, 2025",
  name: "Maha Shivratri",
  description: "Maha Shivratri is a Hindu festival that honors the god Shiva and celebrates his marriage to Parvati. It's also a time to remember Shiva's cosmic dance, the tandava, and to overcome ignorance and darkness."
};

const Holiday: React.FC = () => {
  // State to track the currently selected holiday for display in the highlight card
  const [highlightedHoliday, setHighlightedHoliday] = useState(defaultHighlightedHoliday);

  // Handler for when a holiday row is clicked
  const handleHolidayClick = (holiday: HolidayData) => {
    setHighlightedHoliday({
      day: holiday.day,
      month: holiday.month,
      weekday: holiday.weekday,
      date: holiday.date,
      name: holiday.holidayName,
      description: holiday.description
    });
  };

  return (
    <div className="p-4 bg-[#EEF5FF]">
      {/* Holiday Details Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Holiday Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Holiday highlight card - left side */}
          <div className="md:col-span-5 bg-[#F8FAFF] rounded-lg overflow-hidden shadow-sm">
            <div className="text-center p-8">
              <div className="text-sm text-gray-600 mb-1">{highlightedHoliday.month}</div>
              <div className="text-[80px] font-bold text-[#C32232] leading-none mb-1">{highlightedHoliday.day}</div>
              <div className="text-sm text-gray-600 mb-4">{highlightedHoliday.weekday}</div>
              
              <div className="h-[1px] bg-gray-300 my-4 mx-12"></div>
              
              <div className="font-bold text-xl text-gray-800 mb-2">{highlightedHoliday.date}</div>
              <div className="font-bold text-xl text-[#C32232] mb-4">{highlightedHoliday.name}</div>
              
              <p className="text-sm text-gray-600 px-4">
                {highlightedHoliday.description}
              </p>
            </div>
          </div>
          
          {/* Holiday calendar - right side */}
          <div className="md:col-span-7 overflow-hidden">
            <div className="bg-[#292648] text-white py-3 px-6 flex justify-between items-center">
              <div className="font-semibold">Holiday Name</div>
              <div className="flex">
                <div className="font-semibold px-4">From Date</div>
                <div className="font-semibold">To Date</div>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[500px]">
              {holidayCalendar.map((holiday, index) => (
                <div 
                  key={index} 
                  className={`flex justify-between items-center py-3 px-6 border-b ${
                    index % 2 === 0 ? 'bg-[#EEF5FF]' : 'bg-white'
                  } cursor-pointer hover:bg-gray-100 transition-colors`}
                  onClick={() => handleHolidayClick(holiday)}
                >
                  <div className="text-sm font-medium text-gray-800">{holiday.holidayName}</div>
                  <div className="flex">
                    <div className="text-sm text-gray-600 w-28 text-center">{holiday.fromDate}</div>
                    <div className="text-sm text-gray-600 w-28 text-center">{holiday.toDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holiday; 