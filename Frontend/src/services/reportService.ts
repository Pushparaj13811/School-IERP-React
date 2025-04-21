import { toast } from 'react-toastify';
import api from '../utils/axios';
import { saveAs } from 'file-saver';

// Define report types
export type ReportType = 'attendance' | 'performance' | 'financial' | 'exam';
export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type DateRange = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Report data structure
export interface Report {
  id: string;
  title: string;
  type: ReportType;
  format: ReportFormat;
  downloadUrl: string;
  createdAt: string;
  fileSize?: string;
}

// Report request parameters
export interface ReportParams {
  month?: string;
  year?: string;
  dateRange?: DateRange;
  classId?: string;
  sectionId?: string;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
}

// Chart data types for visualization
export interface ChartData {
  labels: string[];
  data: number[];
}

export interface AttendanceChartData extends ChartData {
  colors: string[];
}

export interface PerformanceChartData extends ChartData {
  colors: string[];
}

export interface FinancialChartData extends ChartData {
  barColors: string[];
}

export interface ExamChartData extends ChartData {
  lineColor: string;
}

export type ReportChartData = AttendanceChartData | PerformanceChartData | FinancialChartData | ExamChartData;

// Chart data request parameters
export interface ChartDataParams {
  month?: string;
  year?: string;
  dateRange?: DateRange;
  classId?: string | undefined;
  sectionId?: string | undefined;
  startDate?: string;
  endDate?: string;
}

// Class to represent a report data for different report types
export interface AttendanceReportData {
  totalStudents: number;
  averageAttendance: string;
  daysInMonth: number;
  classwiseData: { class: string; attendance: string }[];
}

export interface PerformanceReportData {
  totalTeachers: number;
  averageRating: string;
  topPerformers: { name: string; rating: string }[];
  subjectPerformance: { subject: string; rating: string }[];
}

export interface FinancialReportData {
  totalRevenue: string;
  expenses: string;
  balance: string;
  categories: { category: string; amount: string }[];
}

export interface ExamReportData {
  totalStudents: number;
  passPercentage: string;
  distinctionPercentage: string;
  subjectWisePerformance: { subject: string; average: string }[];
}

// API response format
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// --- NEW DATA INTERFACES ---
// Interface for the data returned by getAttendanceReportData
export interface AttendanceReportDisplayData {
  totalStudents: number;
  averageAttendance: number; // Changed to number
  daysInMonth: number;
  classwiseData: Array<{ name: string; percentage: number }>;
}

// Interface for the data returned by getPerformanceReportData
export interface PerformanceReportDisplayData {
  totalTeachers: number;
  totalFeedbacks: number;
  teacherFeedbackCounts: Array<{ name: string; count: number }>;
}

// Define interfaces for raw API response data
export interface RawAttendanceData {
  present?: number;
  absent?: number;
  late?: number;
  labels?: string[];
  data?: number[];
  colors?: string[];
  // For the API structure from getAttendanceReportData
  totalStudents?: number;
  averageAttendance?: number;
  daysInMonth?: number;
  classwiseData?: Array<{ name: string; percentage: number }>;
}

export interface RawPerformanceData {
  gradeDistribution?: {
    A?: number;
    B?: number;
    C?: number;
    D?: number;
    F?: number;
  };
  labels?: string[];
  data?: number[];
  colors?: string[];
  // For API structure from getPerformanceReportData
  totalTeachers?: number;
  totalFeedbacks?: number;
  teacherFeedbackCounts?: Array<{ name: string; count: number }>;
}

export interface RawFinancialData {
  monthlyRevenue?: Record<string, number>;
  labels?: string[];
  data?: number[];
  barColors?: string[];
  // For API structure from financial data
  totalRevenue?: string;
  expenses?: string;
  balance?: string;
  categories?: Array<{ category: string; amount: string }>;
}

export interface RawExamData {
  subjectScores?: Record<string, number>;
  labels?: string[];
  data?: number[];
  lineColor?: string;
  // For API structure from exam data
  totalStudents?: number;
  passPercentage?: string;
  distinctionPercentage?: string;
  subjectWisePerformance?: Array<{ subject: string; average: string }>;
}

class ReportService {
  async generateReport(type: ReportType, params: ReportParams): Promise<Report> {
    try {
      const response = await api.post<ApiResponse<Report>>(`/reports/${type}`, params);
      return response.data.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  async getRecentReports(): Promise<Report[]> {
    try {
      const response = await api.get<ApiResponse<Report[]>>('/reports/recent');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      // For development, return mock data if API fails
      return this.getMockReports();
    }
  }

  async downloadReport(report: Report): Promise<void> {
    try {
      const reportId = report.id;
      const response = await api.get(`/reports/download/${reportId}`, {
        responseType: 'blob'
      });
      
      // Use file-saver to save the blob
      const filename = `${report.title}.${report.format.toLowerCase()}`;
      saveAs(new Blob([response.data as BlobPart]), filename);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
      throw new Error('Failed to download report');
    }
  }

  /**
   * Get chart data for visualization based on report type
   */
  async getReportChartData(type: ReportType, params: ChartDataParams): Promise<ReportChartData> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.month) queryParams.append('month', params.month);
      if (params.year) queryParams.append('year', params.year);
      if (params.dateRange) queryParams.append('dateRange', params.dateRange);
      if (params.classId) queryParams.append('classId', params.classId);
      if (params.sectionId) queryParams.append('sectionId', params.sectionId);
      
      const queryString = queryParams.toString();
      
      // Make API call to fetch chart data
      const response = await fetch(`/api/v1/reports/chart/${type}?${queryString}`);
      const result = await response.json();
      
      if (result.status !== 'success' || !result.data) {
        throw new Error(`Failed to fetch ${type} chart data`);
      }
      
      // Process the chart data based on report type
      switch (type) {
        case 'attendance':
          return this.processAttendanceChartData(result.data);
        case 'performance':
          return this.processPerformanceChartData(result.data);
        case 'financial':
          return this.processFinancialChartData(result.data);
        case 'exam':
          return this.processExamChartData(result.data);
        default:
          throw new Error(`Unsupported report type: ${type}`);
      }
    } catch (error) {
      console.error(`Error fetching ${type} chart data:`, error);
      
      // If API fails, return mock data as fallback
      console.warn(`Falling back to mock data for ${type} chart`);
      return this.getMockChartData(type);
    }
  }

  /**
   * Process raw attendance data into chart format
   */
  private processAttendanceChartData(data: RawAttendanceData): AttendanceChartData {
    // If API returns data in the exact format we need, return as is
    if (data.labels && data.data && data.colors) {
      return {
        labels: data.labels,
        data: data.data,
        colors: data.colors
      };
    }

    // If API returns data from getAttendanceReportData
    if (data.classwiseData && data.classwiseData.length > 0) {
      return {
        labels: data.classwiseData.map(item => item.name),
        data: data.classwiseData.map(item => item.percentage),
        colors: data.classwiseData.map(() => this.getRandomColor())
      };
    }

    // If API returns data in present/absent/late format
    return {
      labels: ['Present', 'Absent', 'Late'],
      data: [
        data.present || 0,
        data.absent || 0,
        data.late || 0
      ],
      colors: ['#4CAF50', '#F44336', '#FFC107']
    };
  }

  /**
   * Process raw performance data into chart format
   */
  private processPerformanceChartData(data: RawPerformanceData): PerformanceChartData {
    // If API returns data in the exact format we need, return as is
    if (data.labels && data.data && data.colors) {
      return {
        labels: data.labels,
        data: data.data,
        colors: data.colors
      };
    }

    // If API returns data from getPerformanceReportData
    if (data.teacherFeedbackCounts && data.teacherFeedbackCounts.length > 0) {
      // Take top 5 teachers
      const topTeachers = data.teacherFeedbackCounts.slice(0, 5);
      return {
        labels: topTeachers.map(teacher => teacher.name),
        data: topTeachers.map(teacher => teacher.count),
        colors: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'].slice(0, topTeachers.length)
      };
    }

    // Example data might have: { gradeDistribution: { A: 30, B: 35, C: 20, D: 10, F: 5 } }
    const grades = data.gradeDistribution || {};
    
    return {
      labels: ['A', 'B', 'C', 'D', 'F'],
      data: [
        grades.A || 0,
        grades.B || 0,
        grades.C || 0,
        grades.D || 0,
        grades.F || 0
      ],
      colors: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336']
    };
  }

  /**
   * Process raw financial data into chart format
   */
  private processFinancialChartData(data: RawFinancialData): FinancialChartData {
    // If API returns data in the exact format we need, return as is
    if (data.labels && data.data && data.barColors) {
      return {
        labels: data.labels,
        data: data.data,
        barColors: data.barColors
      };
    }

    // If API returns categories data
    if (data.categories && data.categories.length > 0) {
      return {
        labels: data.categories.map(cat => cat.category),
        data: data.categories.map(cat => parseFloat(cat.amount.replace(/[^0-9.-]+/g, ""))),
        barColors: data.categories.map(() => '#3F51B5')
      };
    }

    // If API returns data in a different format, transform it
    // Example data might have monthlyRevenue: { Jan: 5000, Feb: 6000, ... }
    const monthlyRevenue = data.monthlyRevenue || {};
    const months = Object.keys(monthlyRevenue).slice(0, 6); // Take up to 6 months
    
    return {
      labels: months.length > 0 ? months : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: months.length > 0 
        ? months.map(month => monthlyRevenue[month] || 0)
        : [0, 0, 0, 0, 0, 0],
      barColors: Array(months.length || 6).fill('#3F51B5')
    };
  }

  /**
   * Process raw exam data into chart format
   */
  private processExamChartData(data: RawExamData): ExamChartData {
    // If API returns data in the exact format we need, return as is
    if (data.labels && data.data && data.lineColor) {
      return {
        labels: data.labels,
        data: data.data,
        lineColor: data.lineColor
      };
    }

    // If API returns subject performance data
    if (data.subjectWisePerformance && data.subjectWisePerformance.length > 0) {
      return {
        labels: data.subjectWisePerformance.map(sub => sub.subject),
        data: data.subjectWisePerformance.map(sub => parseFloat(sub.average)),
        lineColor: '#4CAF50'
      };
    }

    // If API returns data in a different format, transform it
    // Example data might have: { subjectScores: { Math: 85, Science: 78, ... } }
    const subjectScores = data.subjectScores || {};
    const subjects = Object.keys(subjectScores);
    
    return {
      labels: subjects.length > 0 ? subjects : ['Math', 'Science', 'English', 'History', 'Art'],
      data: subjects.length > 0 
        ? subjects.map(subject => subjectScores[subject] || 0)
        : [0, 0, 0, 0, 0],
      lineColor: '#4CAF50'
    };
  }

  /**
   * Get mock chart data for development when API fails
   */
  private getMockChartData(type: ReportType): ReportChartData {
    switch (type) {
      case 'attendance':
        return {
          labels: ['Present', 'Absent', 'Late'],
          data: [75, 15, 10],
          colors: ['#4CAF50', '#F44336', '#FFC107']
        } as AttendanceChartData;
        
      case 'performance':
        return {
          labels: ['A', 'B', 'C', 'D', 'F'],
          data: [30, 35, 20, 10, 5],
          colors: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336']
        } as PerformanceChartData;
        
      case 'financial':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [5000, 6000, 4500, 5500, 7000, 6500],
          barColors: ['#3F51B5', '#3F51B5', '#3F51B5', '#3F51B5', '#3F51B5', '#3F51B5']
        } as FinancialChartData;
        
      case 'exam':
        return {
          labels: ['Math', 'Science', 'English', 'History', 'Art'],
          data: [85, 78, 92, 88, 95],
          lineColor: '#4CAF50'
        } as ExamChartData;
        
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }
  
  /**
   * Format month and year for display
   */
  formatMonthYear(month: string, year: string): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  }
  
  /**
   * Get report type formatted name
   */
  getReportTypeName(type: ReportType): string {
    const reportTypeNames = {
      attendance: 'Attendance Report',
      performance: 'Performance Report',
      financial: 'Financial Report',
      exam: 'Examination Report'
    };
    
    return reportTypeNames[type] || 'Unknown Report Type';
  }
  
  /**
   * Get report format display name
   */
  getFormatName(format: ReportFormat): string {
    const formatNames: Record<ReportFormat, string> = {
      pdf: 'PDF',
      excel: 'Excel',
      csv: 'CSV'
    };
    
    return formatNames[format] || 'Unknown Format';
  }
  
  // --- NEW methods for fetching report DISPLAY DATA ---
  async getAttendanceReportData(params: { month: string; year: string; classId?: string; sectionId?: string }): Promise<AttendanceReportDisplayData> {
    try {
      const response = await api.get<ApiResponse<AttendanceReportDisplayData>>('/reports/data/attendance', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attendance report data:', error);
      toast.error('Failed to fetch attendance data for display');
      throw new Error('Failed to fetch attendance report data');
    }
  }

  async getPerformanceReportData(params: { month: string; year: string }): Promise<PerformanceReportDisplayData> {
    try {
      const response = await api.get<ApiResponse<PerformanceReportDisplayData>>('/reports/data/performance', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching performance report data:', error);
      toast.error('Failed to fetch performance data for display');
      throw new Error('Failed to fetch performance report data');
    }
  }

  // Mock data for development only
  private getMockReports(): Report[] {
    return [
      {
        id: '1',
        title: 'Attendance Report - May 2024',
        type: 'attendance',
        format: 'pdf',
        downloadUrl: '/reports/attendance_may_2024.pdf',
        createdAt: new Date().toISOString(),
        fileSize: '245 KB'
      },
      {
        id: '2',
        title: 'Performance Report - Q2 2024',
        type: 'performance',
        format: 'excel',
        downloadUrl: '/reports/performance_q2_2024.xlsx',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        fileSize: '1.2 MB'
      },
      {
        id: '3',
        title: 'Financial Summary - April 2024',
        type: 'financial',
        format: 'csv',
        downloadUrl: '/reports/financial_april_2024.csv',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        fileSize: '87 KB'
      }
    ];
  }

  /**
   * Generate a random color for charts when needed
   */
  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

export default new ReportService();