import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import ReportService from '../services/reportService.js';

const reportService = new ReportService();
// Generate attendance report
export const generateAttendanceReport = asyncHandler(async (req, res) => {
  const { 
    month, 
    year, 
    dateRange, 
    classId, 
    sectionId,
    format = 'pdf'
  } = req.body;
  const userId = req.user.id; // Get userId from the request

  console.log('[Controller] User ID for file gen:', userId);

  if (!userId) {
    throw new ApiError(401, 'User ID not found in request');
  }

  if (!month || !year) {
    throw new ApiError(400, 'Month and year are required');
  }

  const report = await reportService.generateAttendanceReport({
    month, 
    year, 
    dateRange, 
    classId, 
    sectionId,
    format,
    userId // Pass userId here
  });

  return res.status(200).json(
    new ApiResponse(200, report, 'Attendance report generated successfully')
  );
});

// Generate performance report
export const generatePerformanceReport = asyncHandler(async (req, res) => {
  const { 
    month, 
    year, 
    dateRange, 
    format = 'pdf'
  } = req.body;

  const userId = req.user.id;
  console.log('[Controller] User ID for file gen:', userId);

  if (!userId) {
    throw new ApiError(401, 'User ID not found in request');
  }

  if (!month || !year) {
    throw new ApiError(400, 'Month and year are required');
  }

  const report = await reportService.generatePerformanceReport({
    month, 
    year, 
    dateRange,
    format,
    userId
  });

  return res.status(200).json(
    new ApiResponse(200, report, 'Performance report generated successfully')
  );
});

// Generate financial report
export const generateFinancialReport = asyncHandler(async (req, res) => {
  const { 
    month, 
    year, 
    dateRange,
    format = 'pdf'
  } = req.body;

  const userId = req.user.id;
  console.log('[Controller] User ID for file gen:', userId);

  if (!userId) {
    throw new ApiError(401, 'User ID not found');
  }

  if (!month || !year) {
    throw new ApiError(400, 'Month and year required');
  }

  const report = await reportService.generateFinancialReport({
    month, 
    year, 
    dateRange,
    format,
    userId
  });

  return res.status(200).json(
    new ApiResponse(200, report, 'Financial report generated')
  );
});

// Generate exam results report
export const generateExamReport = asyncHandler(async (req, res) => {
  const { 
    month, 
    year, 
    classId, 
    sectionId,
    format = 'pdf'
  } = req.body;

  const userId = req.user.id;
  console.log('[Controller] User ID for file gen:', userId);

  if (!userId) {
    throw new ApiError(401, 'User ID not found');
  }

  if (!month || !year) {
    throw new ApiError(400, 'Month and year required');
  }

  const report = await reportService.generateExamReport({
    month, 
    year, 
    classId, 
    sectionId,
    format,
    userId
  });

  return res.status(200).json(
    new ApiResponse(200, report, 'Exam report generated')
  );
});

// Get user's recent reports
export const getRecentReports = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const reports = await reportService.getRecentReportsByUserId(userId);

  return res.status(200).json(
    new ApiResponse(200, reports, 'Recent reports fetched successfully')
  );
});

// Download a report
export const downloadReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  
  if (!reportId) {
    throw new ApiError(400, 'Report ID is required');
  }

  const report = await reportService.getReportById(reportId);
  
  if (!report) {
    throw new ApiError(404, 'Report not found');
  }

  // Check if user is allowed to download (e.g., if report.userId === req.user.id or req.user.role === ADMIN)
  // Add authorization logic here if needed

  return res.download(report.filePath, report.fileName, (err) => {
    if (err) {
      console.error("Error sending report file:", err);
      // Avoid sending response headers again if already sent
      if (!res.headersSent) {
        throw new ApiError(500, 'Error downloading report file');
      }
    }
  });
});

// --- NEW Data Fetching Controllers ---
export const getAttendanceReportDataController = asyncHandler(async (req, res) => {
  const { month, year, classId, sectionId } = req.query; // Get params from query string
  if (!month || !year) throw new ApiError(400, 'Month and year query parameters are required');

  const data = await reportService.getAttendanceReportData({ month, year, classId, sectionId });
  return res.status(200).json(new ApiResponse(200, data, 'Attendance report data fetched successfully'));
});

export const getPerformanceReportDataController = asyncHandler(async (req, res) => {
  const { month, year } = req.query; // Get params from query string
  if (!month || !year) throw new ApiError(400, 'Month and year query parameters are required');

  const data = await reportService.getPerformanceReportData({ month, year });
  return res.status(200).json(new ApiResponse(200, data, 'Performance report data fetched successfully'));
});

// Add controllers for financial and exam data later if needed 

// Get chart data for visualizations
export const getChartDataController = asyncHandler(async (req, res) => {
  const { type } = req.params; // 'attendance', 'performance', 'financial', or 'exam'
  
  if (!type) {
    throw new ApiError(400, 'Report type is required');
  }
  
  // Get query parameters
  const { month, year, dateRange, classId, sectionId } = req.query;
  
  // Validate required parameters based on report type
  if (['attendance', 'performance', 'exam'].includes(type) && (!month || !year)) {
    throw new ApiError(400, 'Month and year query parameters are required');
  }
  
  if (type === 'financial' && !year) {
    throw new ApiError(400, 'Year query parameter is required for financial charts');
  }
  
  const options = {
    month: parseInt(month),
    year: parseInt(year),
    dateRange,
    classId: classId ? parseInt(classId) : undefined,
    sectionId: sectionId ? parseInt(sectionId) : undefined
  };
  
  const data = await reportService.getChartData(type, options);
  
  return res.status(200).json(
    new ApiResponse(200, data, `${type} chart data fetched successfully`)
  );
}); 


/**
 * Get chart data for reports visualization
 * @route GET /api/v1/reports/chart/:type
 */
export const getChartData = asyncHandler(async (req, res) => {
    try {
        const { type } = req.params;
        const { month, year, dateRange, classId, sectionId } = req.query;
        
        // Validate required parameters based on report type
        if (!type) {
            throw new ApiError(400, 'Report type is required');
        }
        
        // Different report types need different parameters
        if (['attendance', 'performance', 'exam'].includes(type) && (!month || !year)) {
            throw new ApiError(400, 'Month and year are required for this report type');
        }
        
        if (type === 'financial' && !year && !dateRange) {
            throw new ApiError(400, 'Year or date range is required for financial reports');
        }
        
        // Parse numeric parameters
        const options = {
            month: month ? parseInt(month) : undefined,
            year: year ? parseInt(year) : undefined,
            dateRange,
            classId: classId ? parseInt(classId) : undefined,
            sectionId: sectionId ? parseInt(sectionId) : undefined
        };
        
        // Get chart data from service
        const chartData = await reportService.getChartData(type, options);
        
        // Return success response with chart data
        return res.status(200).json({
            success: true,
            message: `Chart data for ${type} report retrieved successfully`,
            data: chartData
        });
    } catch (error) {
        console.error('Error in getChartData controller:', error);
        
        // Handle ApiError instances
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        
        // Handle other errors
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve chart data'
        });
    }
}); 