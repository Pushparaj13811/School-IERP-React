import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function Routes() {
    return (
      <>
        <Router>
          <Routes>
            <Route path='/' element = {<StudentDashboard/>} />
            <Route path='/achievement' element = {<Achievement/>} />
            <Route path='/attendance' element = {<Attendance/>} />
            <Route path='/holiday' element = {<Holiday/>} />
          </Routes>
        </Router>
      </>
    )
  }
  
  export default Routes;
  