import React, { useState } from "react";

interface HolidayItem {
  id: number;
  name: string;
  from: string;
  to: string;
  description: string;
}

const Holiday: React.FC = () => {
  const holidays: HolidayItem[] = [
    { id: 1, name: "Holi 2nd Day - Dhuleti", from: "14/03/2025", to: "14/03/2025", description: "A festival of colors celebrated in India with joy and enthusiasm." },
    { id: 2, name: "3rd Saturday Holiday", from: "15/03/2025", to: "15/03/2025", description: "A scheduled holiday observed on the third Saturday of every month." },
    { id: 3, name: "Ramzan-Id", from: "31/03/2025", to: "31/03/2025", description: "An Islamic festival marking the end of Ramadan, celebrated with prayers and feasting." },
    { id: 4, name: "Shree Ram Navami", from: "06/04/2025", to: "06/04/2025", description: "The birthday of Lord Rama, celebrated with devotion and fasting." },
    { id: 5, name: "Dr. Babasaheb Ambedkar's Jayanti", from: "14/04/2025", to: "14/04/2025", description: "Honoring the birth anniversary of Dr. B.R. Ambedkar, the architect of the Indian Constitution." },
    { id: 6, name: "Raksha Bandhan", from: "09/08/2025", to: "09/08/2025", description: "A festival celebrating the bond between brothers and sisters." },
    { id: 7, name: "Janmashtami", from: "14/08/2025", to: "20/08/2025", description: "The birth anniversary of Lord Krishna, celebrated with fasting and devotional songs." },
    { id: 8, name: "Independence Day", from: "15/08/2025", to: "15/08/2025", description: "Celebrating India's independence with flag hoisting and patriotic events." },
    { id: 9, name: "Gandhi Jayanti & Dussehra", from: "02/10/2025", to: "02/10/2025", description: "Honoring Mahatma Gandhi and celebrating the victory of good over evil." },
    { id: 10, name: "Diwali Holiday", from: "20/10/2025", to: "02/11/2025", description: "The festival of lights, symbolizing victory of light over darkness." },
  ];

  const [selectedHoliday, setSelectedHoliday] = useState<HolidayItem | null>(holidays[0]);

  // Function to convert "DD/MM/YYYY" -> "YYYY-MM-DD"
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-3 text-start">Holiday Details</h3>
      <hr />
      <br />
      <div className="row">
        <div className="col-md-4">
          {selectedHoliday && (
            <div className="shadow-sm rounded p-4 text-center" style={{ backgroundColor: "#EBF4FF" }}>
              <h5 className="text-uppercase fw-bold">
                {new Date(formatDate(selectedHoliday.from)).toLocaleString("en-US", { month: "short", year: "numeric" })}
              </h5>
              <h1 className="fw-bold text-danger">{selectedHoliday.from.split("/")[0]}</h1>
              <h6 className="text-muted">
                {new Date(formatDate(selectedHoliday.from)).toLocaleString("en-US", { weekday: "long" })}
              </h6>
              <hr />
              <h5 className="fw-bold">{selectedHoliday.from} - {selectedHoliday.to}</h5>
              <h4 className="fw-bold text-danger">{selectedHoliday.name}</h4>
              <p className="text-muted">{selectedHoliday.description}</p>
            </div>
          )}
        </div>

        <div className="col-md-8">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th className="text-center" style={{ backgroundColor: "#292648", color: "white" }}>Holiday Name</th>
                <th className="text-center" style={{ backgroundColor: "#292648", color: "white" }}>From Date</th>
                <th className="text-center" style={{ backgroundColor: "#292648", color: "white" }}>To Date</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday, index) => (
                <tr
                  key={holiday.id}
                  className="text-center"
                  style={{ cursor: "pointer", backgroundColor: index % 2 === 0 ? "#E9F0FF" : "#D9E4FF" }}
                  onClick={() => setSelectedHoliday(holiday)}
                >
                  <td>{holiday.name}</td>
                  <td>{holiday.from}</td>
                  <td>{holiday.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Holiday;
