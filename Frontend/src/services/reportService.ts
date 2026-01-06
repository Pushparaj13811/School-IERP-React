import { toast } from 'react-toastify';
import api from '../utils/axios';
import { saveAs } from 'file-saver';

// Define report types
export type ReportType = 'attendance' | 'performance' | 'exam';
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

export interface ExamChartData extends ChartData {
  lineColor: string;
}

export type ReportChartData = AttendanceChartData | PerformanceChartData | ExamChartData;

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

class ReportService {
  async generateReport(type: ReportType, params: ReportParams): Promise<Report> {
    try {
      const response = await api.post<ApiResponse<Report>>(`/reports/${type}`, params);
      return response.data.data;
    } catch {
      throw new Error('Failed to generate report');
    }
  }

  async getRecentReports(): Promise<Report[]> {
    try {
      const response = await api.get<ApiResponse<Report[]>>('/reports/recent');
      return response.data.data || [];
    } catch {
      return [];
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
    } catch {
      toast.error('Failed to download report');
      throw new Error('Failed to download report');
    }
  }

  /**
   * Get chart data for visualization based on report type
   */
  async getReportChartData(type: ReportType, params: ChartDataParams): Promise<ReportChartData> {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    if (params.dateRange) queryParams.append('dateRange', params.dateRange);
    if (params.classId) queryParams.append('classId', params.classId);
    if (params.sectionId) queryParams.append('sectionId', params.sectionId);

    const queryString = queryParams.toString();

    // Make API call to fetch chart data
    const response = await api.get<ApiResponse<ReportChartData>>(`/reports/chart/${type}?${queryString}`);

    if (!response.data || !response.data.data) {
      throw new Error(`Failed to fetch ${type} chart data`);
    }

    // Return the data directly - backend now returns in correct format
    return response.data.data;
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
    } catch {
      toast.error('Failed to fetch attendance data for display');
      throw new Error('Failed to fetch attendance report data');
    }
  }

  async getPerformanceReportData(params: { month: string; year: string }): Promise<PerformanceReportDisplayData> {
    try {
      const response = await api.get<ApiResponse<PerformanceReportDisplayData>>('/reports/data/performance', { params });
      return response.data.data;
    } catch {
      toast.error('Failed to fetch performance data for display');
      throw new Error('Failed to fetch performance report data');
    }
  }

}

export default new ReportService();