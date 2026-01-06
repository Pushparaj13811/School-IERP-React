import React, { useState, useEffect } from 'react';
import {
  FaFileDownload,
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaUserGraduate,
  FaCalendarAlt,
  FaChartLine,
  FaGraduationCap,
  FaChartBar,
  FaChartPie,
  FaClock,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import reportService, {
  Report, ReportType, ReportFormat, DateRange
} from '../../services/reportService';
import timetableService, { Class, Section } from '../../services/timetableService';

// Chart data types
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

interface ExamChartData extends ChartData {
  lineColor: string;
}

type ReportChartData = AttendanceChartData | PerformanceChartData | ExamChartData;

// Report type configuration (Financial report removed as not needed)
const reportTypes = [
  {
    id: 'attendance' as ReportType,
    name: 'Attendance',
    description: 'Track student attendance patterns and trends',
    icon: FaUserGraduate,
    color: 'blue',
    bgGradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'performance' as ReportType,
    name: 'Performance',
    description: 'Analyze academic performance metrics',
    icon: FaChartLine,
    color: 'green',
    bgGradient: 'from-green-500 to-green-600'
  },
  {
    id: 'exam' as ReportType,
    name: 'Examination',
    description: 'Examine test scores and grade distributions',
    icon: FaGraduationCap,
    color: 'orange',
    bgGradient: 'from-orange-500 to-orange-600'
  }
];

const ReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('attendance');
  const [dateRange, setDateRange] = useState<DateRange>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1 < 10
      ? `0${new Date().getMonth() + 1}`
      : `${new Date().getMonth() + 1}`
  );
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
  const [showFilters, setShowFilters] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingData(true);
      await Promise.all([fetchRecentReports(), fetchClasses()]);
      setIsLoadingData(false);
    };
    fetchInitialData();
  }, []);

  // Fetch chart data when filters change
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
        sectionId: selectedSection || undefined
      };
      const data = await reportService.getReportChartData(reportType, params);
      setChartData(data);
    } catch (error) {
      console.error(`Error fetching ${reportType} chart data:`, error);
      setDefaultChartData();
    } finally {
      setIsLoadingChartData(false);
    }
  };

  const setDefaultChartData = () => {
    // Set empty data with correct structure - no dummy values
    if (reportType === 'attendance') {
      setChartData({
        labels: ['Present', 'Absent', 'Late'],
        data: [0, 0, 0],
        colors: ['#10B981', '#EF4444', '#F59E0B']
      } as AttendanceChartData);
    } else if (reportType === 'performance') {
      setChartData({
        labels: ['A', 'B', 'C', 'D', 'F'],
        data: [0, 0, 0, 0, 0],
        colors: ['#10B981', '#34D399', '#FBBF24', '#F97316', '#EF4444']
      } as PerformanceChartData);
    } else if (reportType === 'exam') {
      setChartData({
        labels: ['Math', 'Science', 'English', 'History', 'Art'],
        data: [0, 0, 0, 0, 0],
        lineColor: '#F97316'
      } as ExamChartData);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const reports = await reportService.getRecentReports();
      setRecentReports(reports);
    } catch (error) {
      console.error('Error fetching recent reports:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const classesData = await timetableService.getClasses();
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
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
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedSection('');
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
      fetchRecentReports();
      toast.success(`${report.title} has been generated successfully!`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingFile(false);
    }
  };

  const handleDownloadReport = (report: Report) => {
    reportService.downloadReport(report);
    toast.info(`Downloading ${report.title}`);
  };

  const getReportConfig = () => reportTypes.find(r => r.id === reportType) || reportTypes[0];

  const getMonthName = (month: string) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(month) - 1];
  };

  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'excel': return <FaFileExcel className="text-green-600" />;
      case 'csv': return <FaFileCsv className="text-blue-500" />;
      default: return <FaFilePdf className="text-red-500" />;
    }
  };

  // Check if chart data matches current report type
  const isChartDataValid = () => {
    if (!chartData || !chartData.data || chartData.data.length === 0) return false;

    // Check if the data structure matches the report type
    if (reportType === 'attendance' && !('colors' in chartData)) return false;
    if (reportType === 'performance' && !('colors' in chartData)) return false;
    if (reportType === 'exam' && !('lineColor' in chartData)) return false;

    return true;
  };

  // Calculate summary stats from chart data
  const getSummaryStats = () => {
    if (!isChartDataValid()) return [];

    if (reportType === 'attendance' && 'colors' in chartData!) {
      const data = chartData as AttendanceChartData;
      return [
        { label: 'Present Rate', value: `${data.data[0] ?? 0}%`, trend: 'up', color: 'green' },
        { label: 'Absent Rate', value: `${data.data[1] ?? 0}%`, trend: 'down', color: 'red' },
        { label: 'Late Arrivals', value: `${data.data[2] ?? 0}%`, trend: 'neutral', color: 'yellow' }
      ];
    } else if (reportType === 'performance' && 'colors' in chartData!) {
      const data = chartData as PerformanceChartData;
      const avgScore = data.data.length > 0 ? Math.round(data.data.reduce((a, b) => a + b, 0) / data.data.length) : 0;
      return [
        { label: 'A Grade Students', value: `${data.data[0] ?? 0}%`, trend: 'up', color: 'green' },
        { label: 'Average Distribution', value: `${avgScore}%`, trend: 'neutral', color: 'blue' },
        { label: 'Need Improvement', value: `${data.data[4] ?? 0}%`, trend: 'down', color: 'red' }
      ];
    } else if (reportType === 'exam' && 'lineColor' in chartData!) {
      const data = chartData as ExamChartData;
      const avg = data.data.length > 0 ? Math.round(data.data.reduce((a, b) => a + b, 0) / data.data.length) : 0;
      const max = data.data.length > 0 ? Math.max(...data.data) : 0;
      return [
        { label: 'Average Score', value: `${avg}%`, trend: 'up', color: 'orange' },
        { label: 'Highest Subject', value: `${max}%`, trend: 'up', color: 'green' },
        { label: 'Subjects Analyzed', value: data.labels.length.toString(), trend: 'neutral', color: 'blue' }
      ];
    }

    return [];
  };

  // Render summary cards
  const renderSummaryCards = () => {
    const stats = getSummaryStats();

    if (stats.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                {stat.trend === 'up' && <FaArrowUp className={`text-${stat.color}-600`} />}
                {stat.trend === 'down' && <FaArrowDown className={`text-${stat.color}-600`} />}
                {stat.trend === 'neutral' && <FaChartBar className={`text-${stat.color}-600`} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render modern chart visualization
  const renderChart = () => {
    if (!chartData || isLoadingChartData || !isChartDataValid()) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading visualization...</p>
        </div>
      );
    }

    if (reportType === 'attendance' && 'colors' in chartData) {
      const data = chartData as AttendanceChartData;
      const total = data.data.reduce((a, b) => a + b, 0);

      return (
        <div className="flex flex-col items-center">
          {/* Donut Chart Visualization */}
          <div className="relative w-48 h-48 mb-6">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {data.data.map((value, index) => {
                const previousValues = data.data.slice(0, index).reduce((a, b) => a + b, 0);
                const percentage = (value / total) * 100;
                const offset = (previousValues / total) * 100;
                const circumference = 2 * Math.PI * 35;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((offset / 100) * circumference);

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={data.colors[index]}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{data.data[0]}%</span>
              <span className="text-sm text-gray-500">Present</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6">
            {data.labels.map((label, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: data.colors[index] }}
                ></div>
                <span className="text-sm text-gray-600">{label}: {data.data[index]}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (reportType === 'performance' && 'colors' in chartData) {
      const data = chartData as PerformanceChartData;
      const maxValue = Math.max(...data.data);

      return (
        <div className="w-full">
          <div className="flex items-end justify-between gap-2 h-56 px-4">
            {data.labels.map((label, index) => {
              const height = (data.data[index] / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full flex justify-center">
                    <div
                      className="w-full max-w-[48px] rounded-t-lg transition-all duration-300 group-hover:opacity-80 relative"
                      style={{
                        height: `${Math.max(height, 8)}%`,
                        minHeight: '32px',
                        backgroundColor: data.colors[index]
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.data[index]}%
                      </div>
                    </div>
                  </div>
                  <span className="mt-2 text-xs text-gray-600 font-medium">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (reportType === 'exam' && 'lineColor' in chartData) {
      const data = chartData as ExamChartData;
      const maxValue = Math.max(...data.data);

      return (
        <div className="w-full px-4">
          <div className="relative h-56">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[100, 75, 50, 25, 0].map((value) => (
                <div key={value} className="flex items-center">
                  <span className="text-xs text-gray-400 w-8">{value}%</span>
                  <div className="flex-1 border-t border-gray-100"></div>
                </div>
              ))}
            </div>

            {/* Line chart */}
            <svg className="absolute inset-0 ml-8" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={data.lineColor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={data.lineColor} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path
                d={`M 0 ${200 - (data.data[0] / 100) * 200} ${data.data.map((value, index) => {
                  const x = (index / (data.data.length - 1)) * 400;
                  const y = 200 - (value / 100) * 200;
                  return `L ${x} ${y}`;
                }).join(' ')} L 400 200 L 0 200 Z`}
                fill="url(#lineGradient)"
              />

              {/* Line */}
              <path
                d={`M 0 ${200 - (data.data[0] / 100) * 200} ${data.data.map((value, index) => {
                  const x = (index / (data.data.length - 1)) * 400;
                  const y = 200 - (value / 100) * 200;
                  return `L ${x} ${y}`;
                }).join(' ')}`}
                fill="none"
                stroke={data.lineColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {data.data.map((value, index) => {
                const x = (index / (data.data.length - 1)) * 400;
                const y = 200 - (value / 100) * 200;
                return (
                  <g key={index}>
                    <circle cx={x} cy={y} r="6" fill="white" stroke={data.lineColor} strokeWidth="3" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-2 ml-8">
            {data.labels.map((label, index) => (
              <span key={index} className="text-xs text-gray-600 font-medium">{label}</span>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-500 mt-1">Generate and download comprehensive reports</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="text-gray-400" />
                Filters
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {showPreview ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = reportType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`relative p-5 rounded-xl text-left transition-all duration-200 ${
                  isSelected
                    ? `bg-gradient-to-br ${type.bgGradient} text-white shadow-lg scale-[1.02]`
                    : 'bg-white text-gray-700 hover:shadow-md border border-gray-100'
                }`}
              >
                <div className={`inline-flex p-3 rounded-lg mb-3 ${
                  isSelected ? 'bg-white/20' : `bg-${type.color}-100`
                }`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : `text-${type.color}-600`}`} />
                </div>
                <h3 className={`font-semibold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {type.name}
                </h3>
                <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  {type.description}
                </p>
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <FaCheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>

              {/* Class (for attendance/exam) */}
              {(reportType === 'attendance' || reportType === 'exam') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={selectedClass}
                    onChange={handleClassChange}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">All Classes</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id.toString()}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Section */}
              {selectedClass && (reportType === 'attendance' || reportType === 'exam') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Stats */}
            {chartData && renderSummaryCards()}

            {/* Chart Preview */}
            {showPreview && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getReportConfig().name} Overview
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getMonthName(selectedMonth)} {selectedYear} • {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaChartPie className="w-4 h-4" />
                    Live Preview
                  </div>
                </div>
                {renderChart()}
              </div>
            )}

            {/* Export Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h3>

              <div className="flex flex-wrap gap-3 mb-6">
                {(['pdf', 'excel', 'csv'] as ReportFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                      exportFormat === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {getFormatIcon(format)}
                    <span className="font-medium uppercase">{format}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingFile}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                  isGeneratingFile
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${getReportConfig().bgGradient} hover:shadow-lg hover:scale-[1.02]`
                }`}
              >
                {isGeneratingFile ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FaFileDownload className="w-5 h-5" />
                    Generate {getReportConfig().name} Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Recent Reports */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                <FaClock className="text-gray-400" />
              </div>

              {isLoadingData ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-sm text-gray-500">Loading reports...</p>
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFileDownload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No reports yet</p>
                  <p className="text-sm text-gray-400 mt-1">Generate your first report above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReports.slice(0, 5).map((report) => {
                    const reportConfig = reportTypes.find(r => r.id === report.type);
                    const Icon = reportConfig?.icon || FaChartBar;

                    return (
                      <div
                        key={report.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className={`p-2.5 rounded-lg bg-${reportConfig?.color || 'gray'}-100`}>
                          <Icon className={`w-4 h-4 text-${reportConfig?.color || 'gray'}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {report.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              {getFormatIcon(report.format)}
                              {report.format.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="w-3 h-3" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Download"
                        >
                          <FaFileDownload className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
