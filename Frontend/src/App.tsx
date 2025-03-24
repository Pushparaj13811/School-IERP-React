import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageLayout from "./components/layout/PageLayout";

// Import student pages
import Dashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Attendance from './pages/student/Attendance';
import Holiday from './pages/student/Holiday';
import Achievement from './pages/student/Achievement';
import Result from './pages/student/Result';
import Leave from './pages/student/Leave';
import LeaveApplicationCreate from './pages/student/LeaveApplicationCreate';
import Feedback from './pages/student/Feedback';
import TimeTable from './pages/student/TimeTable';
import Announcements from './pages/student/Announcements';

// Import bootstrap icons
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <Router>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/holiday" element={<Holiday />} />
          <Route path="/achievement" element={<Achievement />} />
          <Route path="/result" element={<Result />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/leave/create" element={<LeaveApplicationCreate />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/time-table" element={<TimeTable />} />
          <Route path="/announcements" element={<Announcements />} />
          {/* Other routes will be added as the pages are refactored */}
        </Routes>
      </PageLayout>
    </Router>
  );
}

export default App;
