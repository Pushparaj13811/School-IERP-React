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

  const monthlyAttendance: MonthlyAttendance[] = [
    { id: 1, month: "Current Month", present: 9, absent: 2, percentage: "81.82%" },
    { id: 2, month: "Previous Month", present: 9, absent: 2, percentage: "81.82%" },
    { id: 3, month: "Total", present: 9, absent: 2, percentage: "81.82%" },
  ];

  return (
    <div className="container py-4 mt-5"  style={{width:"100vw"}} >
      {/* Subject Wise Attendance */}
      <div className="shadow-sm rounded p-3 mb-4" style={{ background: "#F1F4F9" }}>
        <h4 className="fw-bold mb-3 text-start">Subject Wise Attendance</h4>
        <hr />
        <table className="table table-bordered">
          <thead>
            <tr className="table_columns">
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>S. No.</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Subject Name</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Lecture Conducted</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Present</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Absent</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {subjectAttendance.map((sub, index) => (
              <tr key={sub.id} className="text-center" style={{ backgroundColor: index % 2 === 0 ? "#E9F0FF" : "#D9E4FF" }}>
                <td>{sub.id}</td>
                <td className="text-start">{sub.subject}</td>
                <td>{sub.conducted}</td>
                <td>{sub.present}</td>
                <td>{sub.absent}</td>
                <td>{sub.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attendance Summary */}
      <div className="shadow-sm rounded p-3" style={{ background: "#F1F4F9", }}>
        <h4 className="fw-bold mb-3 text-start">Attendance Summary</h4>
        <hr />
        <table className="table table-bordered">
          <thead>
            <tr style={{ backgroundColor: "#1D1B48", color: "white" }}>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>S. No.</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Month</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Present</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Absent</th>
              <th className="text-center" style={{ backgroundColor: "#1D1B48", color: "white" }}>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {monthlyAttendance.map((data, index) => (
              <tr key={data.id} className="text-center" style={{ backgroundColor: index % 2 === 0 ? "#E9F0FF" : "#D9E4FF" }}>
                <td>{data.id}</td>
                <td>{data.month}</td>
                <td>{data.present}</td>
                <td>{data.absent}</td>
                <td>{data.percentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
