import React from "react";
import { useNavigate } from "react-router-dom";

interface Stat {
  icon: string;
  title: string;
  count: number;
  bg: string;
  path: string;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats: Stat[] = [
    { icon: "bi-calendar-check", title: "Attendance", count: 120, bg: "primary", path: "/attendance" },
    { icon: "bi-clipboard-check", title: "Result", count: 10, bg: "success", path: "/result" },
    { icon: "bi-calendar-heart", title: "Holidays", count: 150, bg: "secondary", path: "/holiday" },
    { icon: "bi-trophy", title: "Achievements", count: 15, bg: "danger", path: "/achievement" },
  ];

  return (
    <div className="container p-3 d-flex flex-column justify-content-center align-items-start" style={{width:"100vw"}} >
      <div className="container mt-4 p-3 shadow-sm rounded bg-white d-flex flex-column justify-content-center align-items-start">
        <h1 className="heading-font text-right fs-4">Statistics</h1>
        <hr className="border border-secondary border-1 mb-4 w-100" />
        <div className="row w-100">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="col-12 col-sm-6 col-md-3 mb-3 text-white"
              onClick={() => stat.path && navigate(stat.path)}
              style={{ cursor: stat.path ? "pointer" : "default" }}
            >
              <div className={`bg-${stat.bg} bg-opacity-75 p-4 rounded shadow-sm d-flex flex-row justify-content-around align-items-center`}>
                <div className="d-flex flex-column justify-content-center align-items-center text-center">
                  <i className={`bi ${stat.icon} fs-1`}></i>
                  <h4>{stat.title}</h4>
                </div>
                <div className="vr border border-light border-2"></div>
                <div className="d-flex flex-column justify-content-center align-items-center text-center">
                  <h1>{stat.count}</h1>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container p-0">
        <div className="row p-0">
          <div className="col-12 col-md-6 p-3">
            <div className="shadow-sm p-2 rounded bg-white w-100 h-100 text-start">
              <h1 className="heading-font text-right" style= {{fontSize:"24px",fontWeight:"bold"}} >My Details</h1>
              <hr className="border border-secondary border-1 mb-3 w-100" />
              <div className="row">
                <div className="col-12 col-lg-4 d-flex flex-column justify-content-start align-items-center">
                  <img className="p-prc mb-3 rounded-circle border border-4 border-primary h-25 w-75" alt="Profile" src="https://cdn.pixabay.com/photo/2015/06/22/08/40/child-817373_640.jpg" />
                  <div className="d-flex flex-row w-100 justify-content-around">
                    <button className="btn px-lg-3 px-5 text-white" style={{ backgroundColor: "#292648" }}>Edit</button>
                    <button className="btn px-lg-3 px-5 text-white" style={{ backgroundColor: "#292648" }}>Print</button>
                  </div>
                </div>
                <div className="col-12 col-lg-8">
                  <table className="table table-borderless">
                    <tbody>
                      {["Student No.", "Name", "Date of Birth", "Gender", "Father's Name", "Birth Certificate No", "Class", "Section", "Roll No", "House", "Current Address", "Permanent Address"].map((label, index) => (
                        <tr key={index}>
                          <th scope="row">{label}:</th>
                          <td>{"Sample Data"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 p-3">
            <div className="shadow-sm p-2 rounded bg-white w-100 h-100 text-start">
              <h1 className="heading-font text-right primary-color" style= {{fontSize:"24px",fontWeight:"bold"}} >Announcements</h1>
              <hr className="border border-secondary border-1 mb-3 w-100" />
              <div className="d-flex shadow-sm flex-column justfy-content-start overflow-auto" style={{ height: "600px" }}>
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="p-3 mb-3 secondary-bg-color shadow-sm rounded d-flex flex-column">
                    <div className="d-flex flex-row justify-content-between">
                    <p className="mb-1 text-secondary">24th Feb 2025</p>
                      <p className="text-secondary">02:30 PM</p>
                    </div>
                    <h2 className="fw-bold" style={{ fontSize: "20px", color: "#292648" }}>📢 Exam Announcement! 📢</h2>
                    <p className="mb-0 text-secondary">We are excited to announce that your Second Terminal Exam will start from 21st Ashwin to 5th Kartik...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
