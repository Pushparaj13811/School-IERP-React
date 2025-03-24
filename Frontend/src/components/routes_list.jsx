import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Leave from "../pages/student/Leave";
import LeaveApplicationCreate from "../pages/student/LeaveApplicationCreate";

function Routes() {
    return (
      <>
        <Router>
          <Routes>
            <Route path='/' element = {<StudentDashboard/>} />
            <Route path='/achievement' element = {<Achievement/>} />
            <Route path='/attendance' element = {<Attendance/>} />
            <Route path='/holiday' element = {<Holiday/>} />
            <Route path='/leave' element = {<Leave/>} />
            <Route path='/leave/create' element = {<LeaveApplicationCreate/>} />
          </Routes>
        </Router>
      </>
    )
  }
  
export default Routes;
  