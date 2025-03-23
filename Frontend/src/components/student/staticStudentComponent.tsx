import React, { useState } from "react";
import "./nav.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const StaticStudentComponent: React.FC = () => {
    const [sidebarVisible, setSidebarVisible] = useState(false);

    return (
        <>
            {/* Navbar */}
            <nav className="container-fluid navbar shadow navbar-expand-lg navbar-dark px-3 fixed-top">
                <button className="btn border-light text-light me-3" onClick={() => setSidebarVisible(!sidebarVisible)}>
                    <i className="bi bi-list"></i>
                </button>
                <Link className="navbar-brands mx-3" to="/">Shree Janahit ERP</Link>
                <button className="navbar-toggler text-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <i className="bi bi-three-dots-vertical"></i>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <div className="d-flex align-items-center">
                        <div className="dropdown me-3">
                            <button className="btn dropdown-toggle text-light" type="button" data-bs-toggle="dropdown">
                                Language
                            </button>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item lang-items" href="#">English</a></li>
                                <li><a className="dropdown-item lang-items" href="#">नेपाली</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <div className={`sideBar text-white pt-2 ${sidebarVisible ? "show" : ""}`} style={{ left: sidebarVisible ? "0" : "-300px" }}>
                <ul className="nav flex-column overflow-auto">
                    <li className="nav-item"><h6 className="text-uppercase mt-3">Home</h6></li>
                    <li className="nav-item nav-item-option"><Link to="/" className="nav-link text-white"><i className="bi bi-speedometer2"></i> Dashboard</Link></li>
                    <li className="nav-item nav-item-option"><Link to="/profile" className="nav-link text-white"><i className="bi bi-person"></i> Profile</Link></li>
                    
                    <li className="nav-item"><h6 className="text-uppercase mt-3">Academics</h6></li>
                    <li className="nav-item nav-item-option"><Link to="/attendance" className="nav-link text-white"><i className="bi bi-calendar-check"></i> Attendance</Link></li>
                    <li className="nav-item nav-item-option"><Link to="/result" className="nav-link text-white"><i className="bi bi-clipboard-data"></i> Results</Link></li>
                    
                    <li className="nav-item"><h6 className="text-uppercase mt-3">Other</h6></li>
                    <li className="nav-item nav-item-option"><Link to="/leave_application" className="nav-link text-white"><i className="bi bi-file-earmark-text"></i> Leave Application</Link></li>
                    <li className="nav-item nav-item-option"><Link to="/holiday" className="nav-link text-white"><i className="bi bi-calendar-event"></i> Holidays</Link></li>
                    <li className="nav-item nav-item-option"><Link to="/achievement" className="nav-link text-white"><i className="bi bi-trophy"></i> Achievements</Link></li>
                    <li className="nav-item nav-item-option"><Link to="/feedback" className="nav-link text-white"><i className="bi bi-chat-left-text"></i> Feedbacks</Link></li>

                    {/* Logout button with proper href */}
                    <li className="nav-item nav-item-option">
                        <a href="../index.jsp" className="nav-link text-white">
                            <i className="bi bi-box-arrow-right"></i> Logout
                        </a>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default StaticStudentComponent;
