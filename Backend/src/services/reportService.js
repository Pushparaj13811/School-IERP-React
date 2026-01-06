import { prisma } from '../databases/prismaClient.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { ApiError } from '../utils/apiError.js';

// Get the directory name using ES Module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ReportService {


    /**
     * Create directory if it doesn't exist
     */
    ensureDirectoryExists = (directory) => {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
    };

    /**
     * Base report generation function
     */
    generateBasicReport = async (options) => {
        const { reportType, fileName, format, data, userId } = options;

        // Create reports directory if it doesn't exist
        const reportsDir = path.join(__dirname, '../../reports');
        this.ensureDirectoryExists(reportsDir);

        // Create type specific directory
        const typeDir = path.join(reportsDir, reportType);
        this.ensureDirectoryExists(typeDir);

        let fileExt;
        let filePath;
        let downloadUrl;

        // Generate report in requested format
        switch (format) {
            case 'pdf':
                fileExt = 'pdf';
                filePath = path.join(typeDir, `${fileName}.${fileExt}`);
                await this.generatePDF(filePath, data, reportType);
                break;
            case 'excel':
                fileExt = 'xlsx';
                filePath = path.join(typeDir, `${fileName}.${fileExt}`);
                await this.generateExcel(filePath, data, reportType);
                break;
            case 'csv':
                fileExt = 'csv';
                filePath = path.join(typeDir, `${fileName}.${fileExt}`);
                await this.generateCSV(filePath, data, reportType);
                break;
            default:
                throw new ApiError(400, 'Invalid format specified');
        }

        // Generate download URL
        downloadUrl = `/reports/${reportType}/${fileName}.${fileExt}`;

        // Save report record in database
        const savedReport = await prisma.report.create({
            data: {
                title: fileName,
                type: reportType,
                format: format,
                filePath: filePath,
                fileName: `${fileName}.${fileExt}`,
                downloadUrl: downloadUrl,
                user: {
                    connect: { id: userId }
                }
            }
        });

        return {
            id: savedReport.id.toString(),
            title: savedReport.title,
            type: savedReport.type,
            format: savedReport.format,
            createdAt: savedReport.createdAt.toISOString(),
            downloadUrl: savedReport.downloadUrl
        };
    };

    /**
     * Generate PDF report
     */
    generatePDF = async (filePath, data, reportType) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Add title
        doc.fontSize(25).text(`${reportType.toUpperCase()} REPORT`, {
            align: 'center'
        });

        // Add date
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, {
            align: 'center'
        });

        doc.moveDown(2);

        // Add content based on report type
        switch (reportType) {
            case 'attendance':
                this.addAttendanceContent(doc, data);
                break;
            case 'performance':
                this.addPerformanceContent(doc, data);
                break;
            case 'financial':
                this.addFinancialContent(doc, data);
                break;
            case 'exam':
                this.addExamContent(doc, data);
                break;
        }

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    };

    /**
     * Generate Excel report
     */
    generateExcel = async (filePath, data, reportType) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(reportType);

        // Add title row
        worksheet.mergeCells('A1:E1');
        worksheet.getCell('A1').value = `${reportType.toUpperCase()} REPORT`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Add date row
        worksheet.mergeCells('A2:E2');
        worksheet.getCell('A2').value = `Generated on: ${new Date().toLocaleString()}`;
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        // Add content based on report type
        switch (reportType) {
            case 'attendance':
                this.addAttendanceExcel(worksheet, data);
                break;
            case 'performance':
                this.addPerformanceExcel(worksheet, data);
                break;
            case 'financial':
                this.addFinancialExcel(worksheet, data);
                break;
            case 'exam':
                this.addExamExcel(worksheet, data);
                break;
        }

        await workbook.xlsx.writeFile(filePath);
    };

    /**
     * Generate CSV report
     */
    generateCSV = async (filePath, data, reportType) => {
        let csvWriter;
        switch (reportType) {
            case 'attendance':
                csvWriter = this.createCsvForAttendance(filePath, data);
                break;
            case 'performance':
                csvWriter = this.createCsvForPerformance(filePath, data);
                break;
            case 'financial':
                csvWriter = this.createCsvForFinancial(filePath, data);
                break;
            case 'exam':
                csvWriter = this.createCsvForExam(filePath, data);
                break;
        }

        await csvWriter.writeRecords(data.records);
    };

    // Helper functions for specific report types (implementation skipped for brevity)
    addAttendanceContent = (doc, data) => {
        // Implementation would add attendance-specific content to PDF
        doc.fontSize(14).text('Attendance Summary', { underline: true });
        doc.moveDown(1);

        doc.fontSize(12).text(`Total Students: ${data.totalStudents}`);
        doc.fontSize(12).text(`Average Attendance: ${data.averageAttendance}`);
        doc.fontSize(12).text(`Days in Month: ${data.daysInMonth}`);

        doc.moveDown(1);
        doc.fontSize(14).text('Class-wise Attendance', { underline: true });
        doc.moveDown(1);

        data.classwiseData.forEach((item, index) => {
            doc.fontSize(12).text(`${item.class}: ${item.attendance}`);
        });
    };

    addPerformanceContent = (doc, data) => {
        // Implementation would add performance-specific content to PDF
        doc.fontSize(14).text('Teacher Performance Summary', { underline: true });
        doc.moveDown(1);

        doc.fontSize(12).text(`Total Teachers: ${data.totalTeachers}`);
        doc.fontSize(12).text(`Average Rating: ${data.averageRating}/5.0`);

        doc.moveDown(1);
        doc.fontSize(14).text('Top Performers', { underline: true });
        doc.moveDown(1);

        data.topPerformers.forEach((teacher, index) => {
            doc.fontSize(12).text(`${teacher.name}: ${teacher.rating}/5.0`);
        });
    };

    addFinancialContent = (doc, data) => {
        // Implementation would add financial-specific content to PDF
        doc.fontSize(14).text('Financial Summary', { underline: true });
        doc.moveDown(1);

        doc.fontSize(12).text(`Total Revenue: ${data.totalRevenue}`);
        doc.fontSize(12).text(`Total Expenses: ${data.expenses}`);
        doc.fontSize(12).text(`Balance: ${data.balance}`);

        doc.moveDown(1);
        doc.fontSize(14).text('Revenue Categories', { underline: true });
        doc.moveDown(1);

        data.categories.forEach((category, index) => {
            doc.fontSize(12).text(`${category.category}: ${category.amount}`);
        });
    };

    addExamContent = (doc, data) => {
        // Implementation would add exam-specific content to PDF
        doc.fontSize(14).text('Exam Results Summary', { underline: true });
        doc.moveDown(1);

        doc.fontSize(12).text(`Total Students: ${data.totalStudents}`);
        doc.fontSize(12).text(`Pass Percentage: ${data.passPercentage}`);
        doc.fontSize(12).text(`Distinction: ${data.distinctionPercentage}`);

        doc.moveDown(1);
        doc.fontSize(14).text('Subject-wise Performance', { underline: true });
        doc.moveDown(1);

        data.subjectWisePerformance.forEach((subject, index) => {
            doc.fontSize(12).text(`${subject.subject}: ${subject.average}%`);
        });
    };

    // Excel specific helpers (implementation details omitted for brevity)
    addAttendanceExcel = (worksheet, data) => {
        // Implementation would add attendance data to Excel worksheet
    };

    addPerformanceExcel = (worksheet, data) => {
        // Implementation would add performance data to Excel worksheet
    };

    addFinancialExcel = (worksheet, data) => {
        // Implementation would add financial data to Excel worksheet
    };

    addExamExcel = (worksheet, data) => {
        // Implementation would add exam data to Excel worksheet
    };

    // CSV specific helpers (implementation details omitted for brevity)
    createCsvForAttendance = (filePath, data) => {
        return createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'class', title: 'Class' },
                { id: 'attendance', title: 'Attendance Percentage' }
            ]
        });
    };

    createCsvForPerformance = (filePath, data) => {
        return createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'name', title: 'Teacher Name' },
                { id: 'rating', title: 'Rating' }
            ]
        });
    };

    createCsvForFinancial = (filePath, data) => {
        return createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'category', title: 'Category' },
                { id: 'amount', title: 'Amount' }
            ]
        });
    };

    createCsvForExam = (filePath, data) => {
        return createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'subject', title: 'Subject' },
                { id: 'average', title: 'Average Score' }
            ]
        });
    };

    /**
     * Generate attendance report
     */
    generateAttendanceReport = async (options) => {
        const { month, year, dateRange, classId, sectionId, format, userId } = options;

        try {
            console.info(`Generating attendance report for ${month}/${year}`);

            // Get month name
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = monthNames[parseInt(month) - 1];

            // Generate file name
            let fileName = `Attendance_Report_${monthName}_${year}`;
            if (classId) {
                console.log('Fetching class data...');
                const classData = await prisma.class.findUnique({ where: { id: parseInt(classId) } });
                if (!classData) throw new Error(`Class with ID ${classId} not found`);
                fileName += `_${classData.name}`;

                if (sectionId) {
                    console.log('Fetching section data...');
                    const sectionData = await prisma.section.findUnique({ where: { id: parseInt(sectionId) } });
                    if (!sectionData) throw new Error(`Section with ID ${sectionId} not found`);
                    fileName += `_${sectionData.name}`;
                }
            }
            console.log('Generated filename:', fileName);

            // Fetch attendance data
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of month
            console.log(`Fetching attendance records from ${startDate.toISOString()} to ${endDate.toISOString()}...`);

            // Query attendance for the given period using the correct model name
            const attendanceRecords = await prisma.dailyAttendance.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    ...(classId ? { classId: parseInt(classId) } : {}),
                    ...(sectionId ? { sectionId: parseInt(sectionId) } : {})
                },
                include: {
                    student: {
                        include: {
                            class: true,
                            section: true
                        }
                    }
                }
            });
            console.log(`Fetched ${attendanceRecords.length} attendance records.`);

            // Calculate statistics
            console.log('Calculating statistics...');
            const totalStudents = await prisma.student.count({
                where: {
                    ...(classId ? { classId: parseInt(classId) } : {}),
                    ...(sectionId ? { sectionId: parseInt(sectionId) } : {})
                }
            });
            console.log(`Total students in scope: ${totalStudents}`);

            // Group by class for class-wise attendance
            const classwiseAttendance = {};
            attendanceRecords.forEach(record => {
                if (!record.student || !record.student.class) {
                    console.warn(`Skipping record ID ${record.id}: Missing student or class info`);
                    return;
                }

                const className = record.student.class.name;
                if (!classwiseAttendance[className]) {
                    classwiseAttendance[className] = { present: 0, total: 0 };
                }

                classwiseAttendance[className].total++;
                if (record.status === 'PRESENT') {
                    classwiseAttendance[className].present++;
                }
            });
            console.log('Calculated class-wise attendance:', classwiseAttendance);

            // Format class-wise data
            const classwiseData = Object.keys(classwiseAttendance).map(className => {
                const data = classwiseAttendance[className];
                const percentage = data.total > 0 ? (data.present / data.total * 100).toFixed(2) : '0.00'; // Avoid division by zero
                return {
                    class: className,
                    attendance: `${percentage}%`
                };
            });
            console.log('Formatted class-wise data:', classwiseData);

            // Calculate school-wide average
            const totalPresent = attendanceRecords.filter(r => r.status === 'PRESENT').length;
            const averageAttendance = attendanceRecords.length > 0 
                ? `${((totalPresent / attendanceRecords.length) * 100).toFixed(2)}%` 
                : '0.00%'; // Avoid division by zero
            console.log(`Calculated average attendance: ${averageAttendance}`);

            // Prepare data for report
            const reportData = {
                totalStudents,
                averageAttendance,
                daysInMonth: endDate.getDate(),
                classwiseData,
                // Add raw records for CSV export
                records: classwiseData
            };
            console.log('Prepared report data:', reportData);

            // Generate the report file
            console.log('Calling generateBasicReport...');
            const generatedReport = await this.generateBasicReport({
                reportType: 'attendance',
                fileName,
                format,
                data: reportData,
                userId
            });
            console.log('Report generation successful:', generatedReport);
            return generatedReport;

        } catch (error) {
            console.error('Error details in generateAttendanceReport:', error);
            // Throw a more specific error or the original one
            throw new ApiError(500, `Failed to generate attendance report: ${error.message}`);
        }
    };

    /**
     * Generate performance report
     */
    generatePerformanceReport = async (options) => {
        const { month, year, dateRange, format, userId } = options;

        try {
            console.info(`Generating performance report (based on feedback count) for ${month}/${year}`);

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = monthNames[parseInt(month) - 1];
            console.log('Month name:', monthName);

            const fileName = `Performance_Report_${monthName}_${year}`;
            console.log('Generated filename:', fileName);

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            console.log(`Fetching feedback for teachers from ${startDate.toISOString()} to ${endDate.toISOString()}...`);

            // Query Feedback model instead of non-existent TeacherRating
            const feedbacks = await prisma.feedback.findMany({
                where: {
                    teacherId: { not: null }, // Only feedback linked to teachers
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    teacher: {
                        include: {
                            user: true // Assuming user relation exists for name
                        }
                    }
                }
            });
            console.log(`Fetched ${feedbacks.length} feedback entries for teachers.`);

            console.log('Fetching total teacher count...');
            const totalTeachers = await prisma.teacher.count();
            console.log(`Total teachers: ${totalTeachers}`);

            console.log('Grouping feedback by teacher...');
            const teacherFeedbackCounts = {};
            feedbacks.forEach(feedback => {
                if (!feedback.teacher) {
                    console.warn(`Skipping feedback ID ${feedback.id}: Missing teacher info`);
                    return;
                }
                const teacherId = feedback.teacherId;
                if (!teacherFeedbackCounts[teacherId]) {
                    teacherFeedbackCounts[teacherId] = {
                        name: feedback.teacher.name || `Teacher ID: ${teacherId}`, // Use teacher name directly
                        count: 0
                    };
                }
                teacherFeedbackCounts[teacherId].count++;
            });
            console.log('Grouped teacher feedback counts:', teacherFeedbackCounts);

            const teacherCountsArray = Object.values(teacherFeedbackCounts);
            
            // Sort by feedback count (descending)
            teacherCountsArray.sort((a, b) => b.count - a.count);

            // Get top teachers by feedback count
            const topTeachersByFeedback = teacherCountsArray.slice(0, 5);
            console.log('Top 5 teachers by feedback count:', topTeachersByFeedback);

            // Remove subject performance section as it relied on TeacherRating
            const subjectPerformance = []; // Empty array as placeholder
            console.log('Subject performance section skipped (requires TeacherRating model).');
            
            // Prepare data for report - Adjusted for feedback count
            const reportData = {
                totalTeachers,
                totalFeedbacks: feedbacks.length,
                topTeachersByFeedback,
                subjectPerformance, // Keep structure, but it's empty
                // Add raw records for CSV export
                records: teacherCountsArray // Use the counts array
            };
            console.log('Prepared report data:', reportData);

            console.log('Calling generateBasicReport...');
            const generatedReport = await this.generateBasicReport({
                reportType: 'performance',
                fileName,
                format,
                data: reportData,
                userId
            });
            console.log('Report generation successful:', generatedReport);
            return generatedReport;

        } catch (error) {
            console.error('Error details in generatePerformanceReport:', error);
            throw new ApiError(500, `Failed to generate performance report: ${error.message}`);
        }
    };

    /**
     * Generate financial report
     * Note: No FinancialTransaction model exists, so we generate enrollment-based report
     */
    generateFinancialReport = async (options) => {
        const { month, year, dateRange, format, userId } = options;

        try {
            console.info(`Generating financial report (enrollment-based) for ${month}/${year}`);

            // Get month name
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = monthNames[parseInt(month) - 1];

            // Generate file name
            const fileName = `Financial_Report_${monthName}_${year}`;

            // Fetch enrollment data as proxy for financial metrics
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of month

            // Count students enrolled during this period
            const newStudents = await prisma.student.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            // Get total students
            const totalStudents = await prisma.student.count();

            // Get class-wise enrollment
            const classEnrollment = await prisma.class.findMany({
                select: {
                    name: true,
                    _count: {
                        select: { students: true }
                    }
                }
            });

            // Format category data (class-wise enrollment)
            const categoryData = classEnrollment.map(cls => ({
                category: cls.name,
                amount: `${cls._count.students} students`
            }));

            // Prepare data for report
            const reportData = {
                totalRevenue: `${totalStudents} Total Students`,
                expenses: `${newStudents} New Enrollments`,
                balance: `${totalStudents - newStudents} Existing Students`,
                categories: categoryData,
                // Add raw records for CSV export
                records: categoryData
            };

            // Generate the report file
            return await this.generateBasicReport({
                reportType: 'financial',
                fileName,
                format,
                data: reportData,
                userId
            });

        } catch (error) {
            console.error(`Error generating financial report: ${error.message}`);
            throw new ApiError(500, 'Failed to generate financial report');
        }
    };

    /**
     * Generate exam report using SubjectResult model
     */
    generateExamReport = async (options) => {
        const { month, year, classId, sectionId, format, userId } = options;

        try {
            console.info(`Generating exam report for ${month}/${year}`);

            // Get month name
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = monthNames[parseInt(month) - 1];

            // Generate file name
            let fileName = `Exam_Report_${monthName}_${year}`;
            if (classId) {
                const classData = await prisma.class.findUnique({ where: { id: parseInt(classId) } });
                if (classData) {
                    fileName += `_${classData.name}`;
                }

                if (sectionId) {
                    const sectionData = await prisma.section.findUnique({ where: { id: parseInt(sectionId) } });
                    if (sectionData) {
                        fileName += `_${sectionData.name}`;
                    }
                }
            }

            // Build query for subject results using academicYear
            const academicYear = `${year}-${parseInt(year) + 1}`; // e.g., "2024-2025"

            let resultQuery = {
                academicYear: academicYear
            };

            // Add class and section filters if provided
            if (classId) {
                resultQuery.student = {
                    classId: parseInt(classId)
                };
            }

            if (sectionId) {
                resultQuery.student = {
                    ...resultQuery.student,
                    sectionId: parseInt(sectionId)
                };
            }

            // Fetch subject results
            const subjectResults = await prisma.subjectResult.findMany({
                where: resultQuery,
                include: {
                    subject: true,
                    student: true
                }
            });

            // Calculate statistics
            const totalStudents = await prisma.student.count({
                where: {
                    ...(classId ? { classId: parseInt(classId) } : {}),
                    ...(sectionId ? { sectionId: parseInt(sectionId) } : {})
                }
            });

            // Calculate pass percentage (passMarks field is used)
            const passedResults = subjectResults.filter(result => result.totalMarks >= result.passMarks);
            const passPercentage = subjectResults.length > 0
                ? `${((passedResults.length / subjectResults.length) * 100).toFixed(2)}%`
                : '0.00%';

            // Calculate distinction percentage (75%+ of fullMarks)
            const distinctionResults = subjectResults.filter(result =>
                result.fullMarks > 0 && (result.totalMarks / result.fullMarks) * 100 >= 75
            );
            const distinctionPercentage = subjectResults.length > 0
                ? `${((distinctionResults.length / subjectResults.length) * 100).toFixed(2)}%`
                : '0.00%';

            // Group by subject
            const subjectScores = {};
            subjectResults.forEach(result => {
                if (!result.subject) return;

                const subjectName = result.subject.name;
                if (!subjectScores[subjectName]) {
                    subjectScores[subjectName] = {
                        totalObtained: 0,
                        totalFull: 0,
                        count: 0
                    };
                }

                subjectScores[subjectName].totalObtained += result.totalMarks;
                subjectScores[subjectName].totalFull += result.fullMarks;
                subjectScores[subjectName].count++;
            });

            // Format subject-wise data
            const subjectWisePerformance = Object.keys(subjectScores).map(subject => {
                const data = subjectScores[subject];
                const average = data.totalFull > 0
                    ? ((data.totalObtained / data.totalFull) * 100).toFixed(2)
                    : '0.00';
                return {
                    subject,
                    average
                };
            });

            // Sort by average score (descending)
            subjectWisePerformance.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

            // Prepare data for report
            const reportData = {
                totalStudents,
                passPercentage,
                distinctionPercentage,
                subjectWisePerformance,
                // Add raw records for CSV export
                records: subjectWisePerformance
            };

            // Generate the report file
            return await this.generateBasicReport({
                reportType: 'exam',
                fileName,
                format,
                data: reportData,
                userId
            });

        } catch (error) {
            console.error(`Error generating exam report: ${error.message}`);
            throw new ApiError(500, 'Failed to generate exam report');
        }
    };

    /**
     * Get recent reports for a user
     */
    getRecentReportsByUserId = async (userId) => {
        try {
            const reports = await prisma.report.findMany({
                where: {
                    userId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10 // Get the 10 most recent reports
            });

            return reports.map(report => ({
                id: report.id,
                title: report.title,
                type: report.type,
                format: report.format,
                createdAt: report.createdAt,
                downloadUrl: report.downloadUrl
            }));
        } catch (error) {
            console.error(`Error getting recent reports: ${error.message}`);
            throw new ApiError(500, 'Failed to get recent reports');
        }
    };

    /**
     * Get report by ID
     */
    getReportById = async (reportId) => {
        try {
            const report = await prisma.report.findUnique({
                where: {
                    id: parseInt(reportId)
                }
            });

            if (!report) {
                throw new ApiError(404, 'Report not found');
            }

            return report;
        } catch (error) {
            console.error(`Error getting report: ${error.message}`);
            throw new ApiError(500, 'Failed to get report');
        }
    };

    // --- NEW METHODS TO GET REPORT DATA --- 

    getAttendanceReportData = async (options) => {
        const { month, year, classId, sectionId } = options;
        try {
            console.log('Fetching data for attendance report...');
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const attendanceRecords = await prisma.dailyAttendance.findMany({
                where: {
                    date: { gte: startDate, lte: endDate },
                    ...(classId ? { classId: parseInt(classId) } : {}),
                    ...(sectionId ? { sectionId: parseInt(sectionId) } : {})
                },
                include: { student: { include: { class: true } } }
            });
            
            const totalStudents = await prisma.student.count({
                where: {
                    ...(classId ? { classId: parseInt(classId) } : {}),
                    ...(sectionId ? { sectionId: parseInt(sectionId) } : {})
                }
            });

            const classwiseAttendance = {};
            attendanceRecords.forEach(record => {
                if (!record.student?.class) return;
                const className = record.student.class.name;
                if (!classwiseAttendance[className]) {
                    classwiseAttendance[className] = { present: 0, total: 0 };
                }
                classwiseAttendance[className].total++;
                if (record.status === 'PRESENT') {
                    classwiseAttendance[className].present++;
                }
            });

            const classwiseData = Object.keys(classwiseAttendance).map(className => {
                const data = classwiseAttendance[className];
                const percentage = data.total > 0 ? (data.present / data.total * 100) : 0;
                return { name: className, percentage: parseFloat(percentage.toFixed(2)) }; // Return percentage as number
            });

            const totalPresent = attendanceRecords.filter(r => r.status === 'PRESENT').length;
            const averageAttendance = attendanceRecords.length > 0 
                ? parseFloat(((totalPresent / attendanceRecords.length) * 100).toFixed(2))
                : 0;

            console.log('Attendance data fetched successfully.');
            return {
                totalStudents,
                averageAttendance,
                daysInMonth: endDate.getDate(),
                classwiseData // Array of { name: string, percentage: number }
            };
        } catch (error) {
            console.error(`Error fetching attendance report data: ${error.message}`);
            throw new ApiError(500, 'Failed to fetch attendance report data');
        }
    };

    getPerformanceReportData = async (options) => {
        const { month, year } = options;
        try {
            console.log('Fetching data for performance report (feedback count)...');
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const feedbacks = await prisma.feedback.findMany({
                where: {
                    teacherId: { not: null },
                    createdAt: { gte: startDate, lte: endDate }
                },
                include: { teacher: true }
            });

            const totalTeachers = await prisma.teacher.count();

            const teacherFeedbackCounts = {};
            feedbacks.forEach(feedback => {
                if (!feedback.teacher) return;
                const teacherId = feedback.teacherId;
                if (!teacherFeedbackCounts[teacherId]) {
                    teacherFeedbackCounts[teacherId] = {
                        name: feedback.teacher.name || `Teacher ID: ${teacherId}`,
                        count: 0
                    };
                }
                teacherFeedbackCounts[teacherId].count++;
            });

            const teacherCountsArray = Object.values(teacherFeedbackCounts)
                .sort((a, b) => b.count - a.count); // Sort here for convenience

            console.log('Performance data fetched successfully.');
            return {
                totalTeachers,
                totalFeedbacks: feedbacks.length,
                teacherFeedbackCounts: teacherCountsArray // Array of { name: string, count: number }
            };
        } catch (error) {
            console.error(`Error fetching performance report data: ${error.message}`);
            throw new ApiError(500, 'Failed to fetch performance report data');
        }
    };

    /**
     * Get chart data for visualizations
     */
    getChartData = async (type, options) => {
        try {
            const { month, year, dateRange, classId, sectionId } = options;
            
            switch (type) {
                case 'attendance':
                    return await this.getAttendanceChartData(month, year, classId, sectionId);
                case 'performance':
                    return await this.getPerformanceChartData(month, year, classId, sectionId);
                case 'financial':
                    return await this.getFinancialChartData(year, dateRange);
                case 'exam':
                    return await this.getExamChartData(month, year, classId, sectionId);
                default:
                    throw new ApiError(400, `Unsupported report type: ${type}`);
            }
        } catch (error) {
            console.error(`Error generating chart data for ${type}:`, error);
            throw new ApiError(500, `Failed to generate chart data for ${type}`);
        }
    };

    /**
     * Get attendance chart data - Returns data in frontend expected format
     */
    getAttendanceChartData = async (month, year, classId, sectionId) => {
        // Format the start and end dates for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month

        // Build the query for attendance records
        let attendanceQuery = {
            date: {
                gte: startDate,
                lte: endDate
            }
        };

        // Add class and section filters if provided
        if (classId) {
            attendanceQuery.classId = classId;
        }
        if (sectionId) {
            attendanceQuery.sectionId = sectionId;
        }

        // Fetch attendance data for the month
        const attendanceRecords = await prisma.dailyAttendance.findMany({
            where: attendanceQuery
        });

        // Count by status
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;

        attendanceRecords.forEach(record => {
            if (record.status === 'PRESENT') {
                presentCount++;
            } else if (record.status === 'ABSENT') {
                absentCount++;
            } else if (record.status === 'LATE') {
                lateCount++;
            }
        });

        const total = presentCount + absentCount + lateCount;

        // Calculate percentages
        const presentPercent = total > 0 ? Math.round((presentCount / total) * 100) : 0;
        const absentPercent = total > 0 ? Math.round((absentCount / total) * 100) : 0;
        const latePercent = total > 0 ? Math.round((lateCount / total) * 100) : 0;

        // Return in frontend expected format
        return {
            labels: ['Present', 'Absent', 'Late'],
            data: [presentPercent, absentPercent, latePercent],
            colors: ['#10B981', '#EF4444', '#F59E0B']
        };
    };

    // Calculate overall attendance rate from daily stats
    calculateAttendanceRate = (dailyStats) => {
        let totalPresent = 0;
        let totalStudentDays = 0;
        
        Object.values(dailyStats).forEach(stats => {
            totalPresent += stats.present;
            totalStudentDays += stats.totalStudents;
        });
        
        return totalStudentDays > 0 ? (totalPresent / totalStudentDays) * 100 : 0;
    };

    /**
     * Get performance chart data - Returns grade distribution based on SubjectResult model
     */
    getPerformanceChartData = async (month, year, classId, sectionId) => {
        // Build query for subject results - use academicYear and term instead of date
        // Since SubjectResult doesn't have createdAt for filtering by month, we'll use academicYear
        const academicYear = `${year}-${parseInt(year) + 1}`; // e.g., "2024-2025"

        let resultQuery = {
            academicYear: academicYear
        };

        // Add class and section filters if provided
        if (classId) {
            resultQuery.student = {
                classId: parseInt(classId)
            };
        }

        if (sectionId) {
            resultQuery.student = {
                ...resultQuery.student,
                sectionId: parseInt(sectionId)
            };
        }

        // Fetch subject results data using the correct model
        const results = await prisma.subjectResult.findMany({
            where: resultQuery,
            include: {
                student: true,
                grade: true
            }
        });

        // Calculate grade distribution based on percentage (totalMarks / fullMarks)
        let gradeA = 0; // 90-100%
        let gradeB = 0; // 75-89%
        let gradeC = 0; // 60-74%
        let gradeD = 0; // 40-59%
        let gradeF = 0; // 0-39%

        results.forEach(result => {
            const percentage = result.fullMarks > 0
                ? (result.totalMarks / result.fullMarks) * 100
                : 0;

            if (percentage >= 90) {
                gradeA++;
            } else if (percentage >= 75) {
                gradeB++;
            } else if (percentage >= 60) {
                gradeC++;
            } else if (percentage >= 40) {
                gradeD++;
            } else {
                gradeF++;
            }
        });

        const total = results.length;

        // Calculate percentages (if no data, show zeros)
        const aPercent = total > 0 ? Math.round((gradeA / total) * 100) : 0;
        const bPercent = total > 0 ? Math.round((gradeB / total) * 100) : 0;
        const cPercent = total > 0 ? Math.round((gradeC / total) * 100) : 0;
        const dPercent = total > 0 ? Math.round((gradeD / total) * 100) : 0;
        const fPercent = total > 0 ? Math.round((gradeF / total) * 100) : 0;

        // Return in frontend expected format
        return {
            labels: ['A (90%+)', 'B (75-89%)', 'C (60-74%)', 'D (40-59%)', 'F (<40%)'],
            data: [aPercent, bPercent, cPercent, dPercent, fPercent],
            colors: ['#10B981', '#34D399', '#FBBF24', '#F97316', '#EF4444']
        };
    };

    // Calculate average score across all subjects
    calculateAverageScore = (performanceData) => {
        if (performanceData.length === 0) return 0;
        
        const sum = performanceData.reduce((total, item) => total + item.averagePercentage, 0);
        return Math.round((sum / performanceData.length) * 10) / 10; // Round to 1 decimal place
    };

    /**
     * Get financial chart data - Returns student enrollment by month as proxy for revenue
     * Note: No FinancialTransaction model exists, so we use student enrollment data
     */
    getFinancialChartData = async (year, dateRange) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Since there's no financial model, we'll show student enrollment trends
        // which can represent potential fee collection
        const currentMonth = new Date().getMonth();
        const labels = [];
        const data = [];

        // Get last 6 months of student enrollment data
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const targetYear = monthIndex > currentMonth ? parseInt(year) - 1 : parseInt(year);

            const startDate = new Date(targetYear, monthIndex, 1);
            const endDate = new Date(targetYear, monthIndex + 1, 0);

            // Count students enrolled by createdAt date
            const studentCount = await prisma.student.count({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            labels.push(monthNames[monthIndex]);
            data.push(studentCount);
        }

        // Return in frontend expected format
        // Note: This shows student enrollment per month, not actual financial data
        return {
            labels: labels,
            data: data,
            barColors: ['#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6']
        };
    };

    /**
     * Get exam chart data - Returns subject-wise average scores using SubjectResult model
     */
    getExamChartData = async (month, year, classId, sectionId) => {
        // Build query for subject results using academicYear
        const academicYear = `${year}-${parseInt(year) + 1}`; // e.g., "2024-2025"

        let resultQuery = {
            academicYear: academicYear
        };

        // Add class and section filters if provided
        if (classId) {
            resultQuery.student = {
                classId: parseInt(classId)
            };
        }

        if (sectionId) {
            resultQuery.student = {
                ...resultQuery.student,
                sectionId: parseInt(sectionId)
            };
        }

        // Fetch subject results with subject information
        const subjectResults = await prisma.subjectResult.findMany({
            where: resultQuery,
            include: {
                subject: {
                    select: {
                        name: true
                    }
                },
                student: true
            }
        });

        // Group results by subject and calculate average scores
        const subjectScores = {};

        subjectResults.forEach(result => {
            if (!result.subject) return;

            const subjectName = result.subject.name;
            if (!subjectScores[subjectName]) {
                subjectScores[subjectName] = {
                    totalObtained: 0,
                    totalFull: 0,
                    count: 0
                };
            }

            subjectScores[subjectName].totalObtained += result.totalMarks;
            subjectScores[subjectName].totalFull += result.fullMarks;
            subjectScores[subjectName].count++;
        });

        // Calculate average percentage for each subject
        const labels = [];
        const data = [];

        Object.keys(subjectScores).forEach(subject => {
            const scores = subjectScores[subject];
            const avgPercentage = scores.totalFull > 0
                ? Math.round((scores.totalObtained / scores.totalFull) * 100)
                : 0;
            labels.push(subject);
            data.push(avgPercentage);
        });

        // If no data, fetch available subjects from the database
        if (labels.length === 0) {
            const subjects = await prisma.subject.findMany({
                take: 5,
                select: { name: true }
            });

            if (subjects.length > 0) {
                return {
                    labels: subjects.map(s => s.name),
                    data: subjects.map(() => 0),
                    lineColor: '#F97316'
                };
            }

            // Fallback if no subjects exist
            return {
                labels: ['No Data'],
                data: [0],
                lineColor: '#F97316'
            };
        }

        // Return in frontend expected format
        return {
            labels: labels,
            data: data,
            lineColor: '#F97316'
        };
    };
}

export default ReportService;