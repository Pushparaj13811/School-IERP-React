import React, { useState } from 'react';
import { FaFileDownload, FaFileAlt, FaChartBar, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

const Report: React.FC = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  
  const handleGenerateReport = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };
  
  // Mock list of recent reports
  const recentReports = [
    { id: 1, name: 'Student Attendance - April 2023', date: '05/01/2023', type: 'attendance' },
    { id: 2, name: 'Teacher Performance Report - Q1 2023', date: '04/15/2023', type: 'performance' },
    { id: 3, name: 'Financial Summary - March 2023', date: '04/05/2023', type: 'financial' },
    { id: 4, name: 'Exam Results Analysis - Grade 10', date: '03/28/2023', type: 'exam' },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 font-bold text-lg">
        Generate Reports
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Generation Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4">New Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-1">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                  >
                    <option value="attendance">Attendance Report</option>
                    <option value="performance">Performance Report</option>
                    <option value="financial">Financial Report</option>
                    <option value="exam">Examination Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                  >
                    <option value="">Select Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-medium mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-3 bg-[#fffff0] border border-gray-200 rounded"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 bg-[#1e1c39] text-white font-medium rounded"
                >
                  {loading ? 'Generating...' : (
                    <>
                      <span className="mr-2"><FaFileAlt /></span>
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Report Preview (would be shown after generation) */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
              <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500">
                <span className="text-4xl mb-3"><FaChartBar /></span>
                <p>Select report parameters and click 'Generate Report' to preview</p>
              </div>
            </div>
          </div>
          
          {/* Recent Reports List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-lg p-5 h-full">
              <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
              
              <div className="space-y-3">
                {recentReports.map(report => (
                  <div key={report.id} className="bg-white p-3 rounded shadow-sm">
                    <div className="flex items-start">
                      <span className="mt-1 mr-2">
                        {report.type === 'attendance' && <span className="text-blue-500"><FaUserGraduate /></span>}
                        {report.type === 'performance' && <span className="text-green-500"><FaChalkboardTeacher /></span>}
                        {report.type === 'financial' && <span className="text-purple-500"><FaChartBar /></span>}
                        {report.type === 'exam' && <span className="text-orange-500"><FaFileAlt /></span>}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-gray-500">Generated: {report.date}</p>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700">
                        <FaFileDownload />
                      </button>
                    </div>
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

export default Report; 