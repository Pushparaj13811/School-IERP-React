import React, { useState, useEffect } from 'react';
import {
  FaFileDownload, FaFileAlt, FaFilePdf, FaFileExcel,
  FaUserGraduate,
  FaCalendarAlt,
  FaChartLine,
  FaMoneyBillWave,
  FaGraduationCap
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import reportService, {
  Report, ReportType, ReportFormat, DateRange
} from '../../services/reportService';
import timetableService, { Class, Section } from '../../services/timetableService';
import Button from '../../components/ui/Button';

// Define chart data types for type safety
interface ChartData {
  labels: string[];
  data: number[];
}

interface AttendanceChartData extends ChartData {
  colors: string[];
}

interface PerformanceChartData extends ChartData {
  colors: string[];
}

interface FinancialChartData extends ChartData {
  barColors: string[];
}

interface ExamChartData extends ChartData {
  lineColor: string;
}

type ReportChartData = AttendanceChartData | PerformanceChartData | FinancialChartData | ExamChartData;

const ReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('attendance');
  const [dateRange, setDateRange] = useState<DateRange>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1 < 10 ?
    `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);
  const [isLoadingChartData, setIsLoadingChartData] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ReportChartData | null>(null);
  const [exportFormat, setExportFormat] = useState<ReportFormat>('pdf');

  // Fetch recent reports and classes on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingData(true);
      await Promise.all([
        fetchRecentReports(),
        fetchClasses()
      ]);
      setIsLoadingData(false);
    };

    fetchInitialData();
  }, []);

  // Fetch chart data when report type or filters change
  useEffect(() => {
    if (showPreview) {
      fetchChartData();
    }
  }, [reportType, selectedMonth, selectedYear, dateRange, selectedClass, selectedSection, showPreview]);

  const fetchChartData = async () => {
    try {
      setIsLoadingChartData(true);

      const params = {
        month: selectedMonth,
        year: selectedYear,
        dateRange: dateRange,
        classId: selectedClass || undefined,
        sectionId: selectedSection || undefined,
      };

      // Use the report service to fetch the chart data
      const data = await reportService.getReportChartData(reportType, params);
      setChartData(data);
    } catch (error) {
      console.error(`Error fetching ${reportType} chart data:`, error);
      toast.error(`Failed to load chart data for ${reportType} report`);
      
      // Fallback to empty data with correct structure
      if (reportType === 'attendance') {
        setChartData({
          labels: ['Present', 'Absent', 'Late'],
          data: [0, 0, 0],
          colors: ['#4CAF50', '#F44336', '#FFC107']
        } as AttendanceChartData);
      } else if (reportType === 'performance') {
        setChartData({
          labels: ['A', 'B', 'C', 'D', 'F'],
          data: [0, 0, 0, 0, 0],
          colors: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336']
        } as PerformanceChartData);
      } else if (reportType === 'financial') {
        setChartData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [0, 0, 0, 0, 0, 0],
          barColors: ['#3F51B5', '#3F51B5', '#3F51B5', '#3F51B5', '#3F51B5', '#3F51B5']
        } as FinancialChartData);
      } else if (reportType === 'exam') {
        setChartData({
          labels: ['Math', 'Science', 'English', 'History', 'Art'],
          data: [0, 0, 0, 0, 0],
          lineColor: '#4CAF50'
        } as ExamChartData);
      }
    } finally {
      setIsLoadingChartData(false);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const reports = await reportService.getRecentReports();
      setRecentReports(reports);
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      toast.error('Failed to load recent reports. Using mock data instead.');
      // Already falls back to mock data in the service
    }
  };

  const fetchClasses = async () => {
    try {
      const classesData = await timetableService.getClasses();
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const fetchSections = async (classId: string) => {
    try {
      if (!classId) {
        setSections([]);
        return;
      }

      const sectionsData = await timetableService.getSections(parseInt(classId));
      setSections(sectionsData);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedSection(''); // Reset section when class changes

    if (classId) {
      fetchSections(classId);
    } else {
      setSections([]);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingFile(true);

    try {
      const params = {
        month: selectedMonth,
        year: selectedYear,
        dateRange: dateRange,
        classId: selectedClass || undefined,
        sectionId: selectedSection || undefined,
        format: exportFormat
      };

      const report = await reportService.generateReport(reportType, params);
      
      // Refresh the recent reports list
      fetchRecentReports();

      toast.success(`${report.title} has been generated`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGeneratingFile(false);
    }
  };

  const handleDownloadReport = (report: Report) => {
    reportService.downloadReport(report);
    toast.info(`Downloading ${report.title}`);
  };

  // Get report type icon
  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'attendance':
        return <FaUserGraduate className="text-blue-500" />;
      case 'performance':
        return <FaChartLine className="text-green-500" />;
      case 'financial':
        return <FaMoneyBillWave className="text-purple-500" />;
      case 'exam':
        return <FaGraduationCap className="text-orange-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  // Type guard functions
  const isAttendanceData = (data: ReportChartData): data is AttendanceChartData => {
    return reportType === 'attendance';
  };

  const isPerformanceData = (data: ReportChartData): data is PerformanceChartData => {
    return reportType === 'performance';
  };

  const isFinancialData = (data: ReportChartData): data is FinancialChartData => {
    return reportType === 'financial';
  };

  const isExamData = (data: ReportChartData): data is ExamChartData => {
    return reportType === 'exam';
  };

  // Render chart based on report type
  const renderChartPreview = () => {
    if (!chartData || isLoadingChartData) {
  return (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading chart data...</p>
      </div>
      );
    }

    // Display different chart types based on the report type
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">
          {reportService.getReportTypeName(reportType)} Preview
        </h2>

        {/* Conditional rendering based on chart type */}
        {isAttendanceData(chartData) && (
          <div className="chart-container">
            <div className="pie-chart-simulation flex justify-center">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex flex-col items-center mx-2">
                  <div 
                    className="w-20 h-20 rounded-full mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: chartData.colors[index] }}
                  >
                    {chartData.data[index]}%
                  </div>
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isPerformanceData(chartData) && (
          <div className="chart-container">
            <div className="bar-chart-simulation flex items-end justify-center h-64">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex flex-col items-center mx-2">
                  <div 
                    className="w-12 rounded-t-lg flex items-end justify-center"
                    style={{ 
                      backgroundColor: chartData.colors[index],
                      height: `${Math.max(5, (chartData.data[index] / 100) * 200)}px`
                    }}
                  >
                    <span className="text-white font-bold text-xs mb-1">{chartData.data[index]}</span>
                  </div>
                  <span className="text-sm mt-2">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isFinancialData(chartData) && (
          <div className="chart-container">
            <div className="bar-chart-simulation flex items-end justify-center h-64">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex flex-col items-center mx-2">
                  <div 
                    className="w-12 rounded-t-lg flex items-end justify-center"
                    style={{ 
                      backgroundColor: chartData.barColors[index],
                      height: `${Math.max(5, (chartData.data[index] / Math.max(...chartData.data)) * 200)}px`
                    }}
                  >
                    <span className="text-white font-bold text-xs mb-1">${chartData.data[index]}</span>
                  </div>
                  <span className="text-sm mt-2">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isExamData(chartData) && (
          <div className="chart-container">
            <div className="line-chart-simulation flex flex-col">
              <div className="relative h-64 border-b border-l border-gray-300">
                {/* Placeholder for line chart */}
                <div className="h-full w-full flex items-end">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="flex flex-col items-center mx-2 flex-1">
                      <div 
                        className="w-full rounded-t-lg flex items-end justify-center"
                        style={{ 
                          backgroundColor: chartData.lineColor,
                          height: `${Math.max(5, (chartData.data[index] / 100) * 200)}px`,
                          opacity: 0.7
                        }}
                      >
                        <span className="text-white font-bold text-xs mb-1">{chartData.data[index]}%</span>
                      </div>
                      <span className="text-sm mt-2">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render report options form
  const renderReportForm = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Report Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={reportType === 'attendance' ? 'primary' : 'outline'}
                onClick={() => setReportType('attendance')}
              >
                <FaUserGraduate className="mr-1" /> Attendance
              </Button>
              <Button 
                variant={reportType === 'performance' ? 'primary' : 'outline'}
                onClick={() => setReportType('performance')}
              >
                <FaChartLine className="mr-1" /> Performance
              </Button>
              <Button 
                variant={reportType === 'financial' ? 'primary' : 'outline'}
                onClick={() => setReportType('financial')}
              >
                <FaMoneyBillWave className="mr-1" /> Financial
              </Button>
              <Button 
                variant={reportType === 'exam' ? 'primary' : 'outline'}
                onClick={() => setReportType('exam')}
              >
                <FaGraduationCap className="mr-1" /> Exam
              </Button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              <select
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
              >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
            </div>
          </div>
                </div>
                
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Month Selection */}
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
                  <select
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
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
                
          {/* Year Selection */}
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
                  <select
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
              <option value="2022">2022</option>
              <option value="2023">2023</option>
                    <option value="2024">2024</option>
                  </select>
                </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <div className="flex space-x-2">
              <Button 
                variant={exportFormat === 'pdf' ? 'primary' : 'outline'}
                onClick={() => setExportFormat('pdf')}
              >
                <FaFilePdf className="mr-1" /> PDF
              </Button>
              <Button 
                variant={exportFormat === 'excel' ? 'primary' : 'outline'}
                onClick={() => setExportFormat('excel')}
              >
                <FaFileExcel className="mr-1" /> Excel
              </Button>
              <Button 
                variant={exportFormat === 'csv' ? 'primary' : 'outline'}
                onClick={() => setExportFormat('csv')}
              >
                <FaFileAlt className="mr-1" /> CSV
              </Button>
            </div>
          </div>
              </div>
              
        {/* Class and Section selection - only show for Attendance and Exam reports */}
        {(reportType === 'attendance' || reportType === 'exam') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class (Optional)
              </label>
              <select
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={selectedClass}
                onChange={handleClassChange}
              >
                <option value="">All Classes</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Section Selection - Only show if class is selected */}
            {selectedClass && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section (Optional)
                </label>
                <select
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id.toString()}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            onClick={handleGenerateReport}
            disabled={isGeneratingFile}
          >
            {isGeneratingFile ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FaFileDownload className="mr-2" /> Generate Report
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Render recent reports
  const renderRecentReports = () => {
    if (isLoadingData) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading recent reports...</p>
                      </div>
      );
    }

    if (recentReports.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No recent reports found.</p>
          <p className="text-sm text-gray-400 mt-1">Generate a new report to see it here.</p>
                    </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {recentReports.map((report) => (
            <div key={report.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center">
                {getReportTypeIcon(report.type)}
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">{report.title}</h3>
                  <div className="flex space-x-4 mt-1">
                    <p className="text-xs text-gray-500">
                      <FaFileAlt className="inline mr-1" />
                      {reportService.getFormatName(report.format)}
                    </p>
                    <p className="text-xs text-gray-500">
                      <FaCalendarAlt className="inline mr-1" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleDownloadReport(report)}
              >
                <FaFileDownload className="mr-1" /> Download
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report Generation</h1>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Report Form */}
        <div className="lg:col-span-2">
          {renderReportForm()}
          
          {/* Preview */}
          {showPreview && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-medium mb-4">Preview</h2>
              {renderChartPreview()}
            </div>
          )}
        </div>

        {/* Right column - Recent Reports */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-medium mb-4">Recent Reports</h2>
            {renderRecentReports()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;