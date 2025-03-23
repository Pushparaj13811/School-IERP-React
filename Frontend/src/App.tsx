import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import './App.css';
import Achievement from './components/student/achievement';
import StudentDashboard from './components/student/student-dashboard';
import Attendance from './components/student/attendance';
import Holiday from './components/student/holiday';
import Feedback from './components/student/feedback';
import StaticStudentComponent from './components/student/staticStudentComponent';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Profile from './components/student/profile';
import LeaveApplication from './components/student/leave';
import StudentResult from './components/student/result';


function App() {
  return (
    <>
    
    <BrowserRouter>
    <StaticStudentComponent/>
      <Routes>
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/achievement" element={<Achievement />} />
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/holiday" element={<Holiday />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leave_application" element={<LeaveApplication />} />
        <Route path="/result" element={<StudentResult />} />
      </Routes>
    </BrowserRouter>
    
    </>
  );
}

export default App;
