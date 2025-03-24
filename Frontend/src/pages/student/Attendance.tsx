import React from 'react';
import Table from '../../components/ui/Table';

interface SubjectAttendance {
  id: number;
  subject: string;
  conducted: number;
  present: number;
  absent: number;
  percentage: string;
}

interface MonthlyAttendance {
  id: number;
  month: string;
  present: number;
  absent: number;
  percentage: string;
}

const Attendance: React.FC = () => {
  const subjectAttendance: SubjectAttendance[] = [
    { id: 1, subject: "Nepali", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
    { id: 2, subject: "English", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
    { id: 3, subject: "Maths", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
    { id: 4, subject: "Social", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
    { id: 5, subject: "Science", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
    { id: 6, subject: "Moral Science", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
    { id: 7, subject: "Computer", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
    { id: 8, subject: "Occupation Business and Technology", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
    { id: 9, subject: "Health and Physical Education", conducted: 16, present: 9, absent: 2, percentage: "81.82%" },
  ];

  const subjectColumns = [
    { header: "S. No.", accessor: "id" },
    { header: "Subject Name", accessor: "subject", className: "text-start" },
    { header: "Lecture Conducted", accessor: "conducted" },
    { header: "Present", accessor: "present" },
    { header: "Absent", accessor: "absent" },
    { header: "Attendance %", accessor: "percentage" },
  ];

  const monthlyAttendance: MonthlyAttendance[] = [
    { id: 1, month: "Current Month", present: 9, absent: 2, percentage: "81.82%" },
    { id: 2, month: "Previous Month", present: 9, absent: 2, percentage: "81.82%" },
    { id: 3, month: "Total", present: 9, absent: 2, percentage: "81.82%" },
  ];

  const monthlyColumns = [
    { header: "S. No.", accessor: "id" },
    { header: "Month", accessor: "month" },
    { header: "Present", accessor: "present" },
    { header: "Absent", accessor: "absent" },
    { header: "Attendance %", accessor: "percentage" },
  ];

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance</h2>
        
        <div className="w-full mb-6">
          <Table 
            title="Subject Wise Attendance"
            columns={subjectColumns}
            data={subjectAttendance}
          />
        </div>
        
        <div className="w-full">
          <Table 
            title="Attendance Summary"
            columns={monthlyColumns}
            data={monthlyAttendance}
          />
        </div>
      </div>
    </div>
  );
};

export default Attendance; 