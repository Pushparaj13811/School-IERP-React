import React from "react";

interface TimeSlot {
  time: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
}

// Sample time table data
const timeTableData: (TimeSlot | { breakType: string })[] = [
  {
    time: "10:00 - 10:45",
    sunday: "Nepali",
    monday: "Nepali",
    tuesday: "Nepali",
    wednesday: "Nepali",
    thursday: "Nepali",
    friday: "Nepali"
  },
  {
    time: "10:45 - 11:50",
    sunday: "English",
    monday: "English",
    tuesday: "English",
    wednesday: "English",
    thursday: "English",
    friday: "English"
  },
  { breakType: "10 MINUTES BREAK" },
  {
    time: "12:00 - 12:45",
    sunday: "Maths",
    monday: "Maths",
    tuesday: "Maths",
    wednesday: "Maths",
    thursday: "Maths",
    friday: "Maths"
  },
  {
    time: "12:45 - 01:30",
    sunday: "Maths",
    monday: "Maths",
    tuesday: "Maths",
    wednesday: "Maths",
    thursday: "Maths",
    friday: "Maths"
  },
  { breakType: "LUNCH BREAK" },
  {
    time: "02:00 - 02:45",
    sunday: "Social",
    monday: "Social",
    tuesday: "Social",
    wednesday: "Social",
    thursday: "Social",
    friday: "Social"
  },
  {
    time: "02:45 - 03:30",
    sunday: "Computer",
    monday: "Computer",
    tuesday: "Computer",
    wednesday: "Computer",
    thursday: "Computer",
    friday: "Computer"
  },
  {
    time: "03:30 - 04:15",
    sunday: "H.P.E.",
    monday: "H.P.E.",
    tuesday: "H.P.E.",
    wednesday: "H.P.E.",
    thursday: "H.P.E.",
    friday: "H.P.E."
  }
];

const TimeTable: React.FC = () => {
  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Monthly Attendance</h2>

        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead>
              <tr>
                <th className="bg-[#292648] text-white p-3 text-center border-r">
                  Time \ Date
                </th>
                <th className="bg-[#292648] text-white p-3 text-center border-r">
                  Sunday
                </th>
                <th className="bg-[#292648] text-white p-3 text-center border-r">
                  Monday
                </th>
                <th className="bg-[#292648] text-white p-3 text-center border-r">
                  Tuesday
                </th>
                <th className="bg-[#292648] text-white p-3 text-center border-r">
                  Wednesday
                </th>
                <th className="bg-[#292648] text-white p-3 text-center border-r">
                  Thursday
                </th>
                <th className="bg-[#292648] text-white p-3 text-center">
                  Friday
                </th>
              </tr>
            </thead>
            <tbody>
              {timeTableData.map((slot, index) => {
                // If this is a break row
                if ('breakType' in slot) {
                  return (
                    <tr key={index}>
                      <td colSpan={7} className="p-2 text-center font-semibold">
                        {slot.breakType}
                      </td>
                    </tr>
                  );
                }
                
                // Regular time slot row
                const timeSlot = slot as TimeSlot;
                
                return (
                  <tr key={index}>
                    <td className="p-3 border-r border-b bg-blue-100 text-center">{timeSlot.time}</td>
                    <td className="p-3 border-r border-b bg-blue-50 text-center">{timeSlot.sunday}</td>
                    <td className="p-3 border-r border-b bg-blue-50 text-center">{timeSlot.monday}</td>
                    <td className="p-3 border-r border-b bg-blue-50 text-center">{timeSlot.tuesday}</td>
                    <td className="p-3 border-r border-b bg-blue-50 text-center">{timeSlot.wednesday}</td>
                    <td className="p-3 border-r border-b bg-blue-50 text-center">{timeSlot.thursday}</td>
                    <td className="p-3 border-b bg-blue-50 text-center">{timeSlot.friday}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTable; 