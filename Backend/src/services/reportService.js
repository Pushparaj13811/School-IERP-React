import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
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
     */
    generateFinancialReport = async (options) => {
        const { month, year, dateRange, format, userId } = options;

        try {
            console.info(`Generating financial report for ${month}/${year}`);

            // Get month name
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthName = monthNames[parseInt(month) - 1];

            // Generate file name
            const fileName = `Financial_Report_${monthName}_${year}`;

            // Fetch financial data
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of month

            // Query financial transactions for the given period
            const revenues = await prisma.financialTransaction.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    type: 'INCOME'
                }
            });

            const expenses = await prisma.financialTransaction.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    type: 'EXPENSE'
                }
            });

            // Calculate statistics
            const totalRevenue = revenues.reduce((sum, transaction) => sum + transaction.amount, 0);
            const totalExpenses = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
            const balance = totalRevenue - totalExpenses;

            // Group by category
            const categories = await prisma.financialTransaction.groupBy({
                by: ['category'],
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    type: 'INCOME'
                },
                _sum: {
                    amount: true
                }
            });

            // Format category data
            const categoryData = categories.map(category => ({
                category: category.category,
                amount: `$${category._sum.amount.toFixed(2)}`
            }));

            // Prepare data for report
            const reportData = {
                totalRevenue: `$${totalRevenue.toFixed(2)}`,
                expenses: `$${totalExpenses.toFixed(2)}`,
                balance: `$${balance.toFixed(2)}`,
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
     * Generate exam report
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
                fileName += `_${classData.name}`;

                if (sectionId) {
                    const sectionData = await prisma.section.findUnique({ where: { id: parseInt(sectionId) } });
                    fileName += `_${sectionData.name}`;
                }
            }

            // Fetch exam data
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Last day of month

            // Get exams in the given period
            const exams = await prisma.exam.findMany({
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    ...(classId ? { classId: parseInt(classId) } : {}),
                    ...(sectionId ? { sectionId: parseInt(sectionId) } : {})
                },
                include: {
                    results: {
                        include: {
                            student: true
                        }
                    },
                    subject: true
                }
            });

            // Calculate statistics
            const totalStudents = await prisma.student.count({
                where: {
                    ...(classId ? { classId: parseInt(classId) } : {}),
                    ...(sectionId ? { sectionId: parseInt(sectionId) } : {})
                }
            });

            // Process results
            let allResults = [];
            exams.forEach(exam => {
                allResults = [...allResults, ...exam.results];
            });

            // Calculate pass percentage
            const passingScore = 40; // Assume 40% is passing
            const passedCount = allResults.filter(result => (result.marksObtained / result.totalMarks) * 100 >= passingScore).length;
            const passPercentage = `${((passedCount / allResults.length) * 100).toFixed(2)}%`;

            // Calculate distinction percentage
            const distinctionScore = 75; // Assume 75% is distinction
            const distinctionCount = allResults.filter(result => (result.marksObtained / result.totalMarks) * 100 >= distinctionScore).length;
            const distinctionPercentage = `${((distinctionCount / allResults.length) * 100).toFixed(2)}%`;

            // Group by subject
            const subjectResults = {};
            exams.forEach(exam => {
                if (!exam.subject) return;

                const subjectName = exam.subject.name;
                if (!subjectResults[subjectName]) {
                    subjectResults[subjectName] = {
                        totalMarks: 0,
                        marksObtained: 0,
                        count: 0
                    };
                }

                exam.results.forEach(result => {
                    subjectResults[subjectName].totalMarks += result.totalMarks;
                    subjectResults[subjectName].marksObtained += result.marksObtained;
                    subjectResults[subjectName].count++;
                });
            });

            // Format subject-wise data
            const subjectWisePerformance = Object.keys(subjectResults).map(subject => {
                const data = subjectResults[subject];
                const average = (data.marksObtained / data.totalMarks * 100).toFixed(2);
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
     * Get attendance chart data
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
        let studentQuery = {};
        if (classId) {
            studentQuery.classId = classId;
        }
        if (sectionId) {
            studentQuery.sectionId = sectionId;
        }
        
        // Fetch attendance data for the month
        const attendanceRecords = await prisma.dailyAttendance.findMany({
            where: attendanceQuery,
            include: {
                student: {
                    where: studentQuery,
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        classId: true,
                        sectionId: true
                    }
                }
            }
        });
        
        // Filter out records that don't match student criteria
        const filteredRecords = attendanceRecords.filter(record => record.student);
        
        // Calculate daily attendance statistics
        const dailyStats = {};
        const totalStudentsCount = await prisma.student.count({
            where: studentQuery
        });
        
        // Initialize data for each day of the month
        for (let day = 1; day <= endDate.getDate(); day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dailyStats[dateStr] = {
                present: 0,
                absent: 0,
                late: 0,
                totalStudents: totalStudentsCount
            };
        }
        
        // Populate the daily statistics
        filteredRecords.forEach(record => {
            const dateStr = record.date.toISOString().split('T')[0];
            if (dailyStats[dateStr]) {
                if (record.status === 'PRESENT') {
                    dailyStats[dateStr].present += 1;
                } else if (record.status === 'ABSENT') {
                    dailyStats[dateStr].absent += 1;
                } else if (record.status === 'LATE') {
                    dailyStats[dateStr].late += 1;
                }
            }
        });
        
        // Format for chart consumption
        const chartData = {
            labels: Object.keys(dailyStats).map(date => date.split('-')[2]), // Day of month
            datasets: [
                {
                    label: 'Present',
                    data: Object.values(dailyStats).map(stats => stats.present),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                },
                {
                    label: 'Absent',
                    data: Object.values(dailyStats).map(stats => stats.absent),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                },
                {
                    label: 'Late',
                    data: Object.values(dailyStats).map(stats => stats.late),
                    backgroundColor: 'rgba(255, 205, 86, 0.7)'
                }
            ],
            totalStudents: totalStudentsCount,
            attendanceRate: this.calculateAttendanceRate(dailyStats)
        };
        
        return chartData;
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
     * Get performance chart data
     */
    getPerformanceChartData = async (month, year, classId, sectionId) => {
        // Format the start and end dates for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month
        
        // Build query for results within the month
        let resultQuery = {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        };
        
        // Add class and section filters if provided
        if (classId) {
            resultQuery.student = {
                classId: classId
            };
        }
        
        if (sectionId) {
            resultQuery.student = {
                ...resultQuery.student,
                sectionId: sectionId
            };
        }
        
        // Fetch results data
        const results = await prisma.result.findMany({
            where: resultQuery,
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        classId: true,
                        sectionId: true
                    }
                },
                exam: {
                    select: {
                        name: true,
                        subjectId: true,
                        maxMarks: true,
                        passingMarks: true
                    }
                }
            }
        });
        
        // Group by subjects
        const subjectPerformance = {};
        const subjects = new Set();
        
        results.forEach(result => {
            const subjectId = result.exam.subjectId;
            subjects.add(subjectId);
            
            if (!subjectPerformance[subjectId]) {
                subjectPerformance[subjectId] = {
                    totalMarks: 0,
                    maxPossibleMarks: 0,
                    passCount: 0,
                    failCount: 0,
                    examCount: 0
                };
            }
            
            subjectPerformance[subjectId].totalMarks += result.marksObtained;
            subjectPerformance[subjectId].maxPossibleMarks += result.exam.maxMarks;
            subjectPerformance[subjectId].examCount += 1;
            
            if (result.marksObtained >= result.exam.passingMarks) {
                subjectPerformance[subjectId].passCount += 1;
            } else {
                subjectPerformance[subjectId].failCount += 1;
            }
        });
        
        // Get subject names from IDs
        const subjectIds = Array.from(subjects);
        const subjectData = await prisma.subject.findMany({
            where: {
                id: {
                    in: subjectIds
                }
            },
            select: {
                id: true,
                name: true
            }
        });
        
        const subjectNames = {};
        subjectData.forEach(subject => {
            subjectNames[subject.id] = subject.name;
        });
        
        // Format chart data
        const averagePerformance = subjectIds.map(subjectId => {
            const data = subjectPerformance[subjectId];
            const avgPercentage = data.maxPossibleMarks > 0 
                ? (data.totalMarks / data.maxPossibleMarks) * 100 
                : 0;
            
            return {
                subject: subjectNames[subjectId] || `Subject ${subjectId}`,
                averagePercentage: Math.round(avgPercentage * 10) / 10, // Round to 1 decimal place
                passRate: data.examCount > 0 
                    ? (data.passCount / data.examCount) * 100 
                    : 0,
                examCount: data.examCount
            };
        });
        
        // Format for chart consumption
        return {
            labels: averagePerformance.map(item => item.subject),
            datasets: [
                {
                    label: 'Average Score (%)',
                    data: averagePerformance.map(item => item.averagePercentage),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                },
                {
                    label: 'Pass Rate (%)',
                    data: averagePerformance.map(item => item.passRate),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                }
            ],
            examCount: averagePerformance.reduce((sum, item) => sum + item.examCount, 0),
            averageScore: this.calculateAverageScore(averagePerformance)
        };
    };

    // Calculate average score across all subjects
    calculateAverageScore = (performanceData) => {
        if (performanceData.length === 0) return 0;
        
        const sum = performanceData.reduce((total, item) => total + item.averagePercentage, 0);
        return Math.round((sum / performanceData.length) * 10) / 10; // Round to 1 decimal place
    };

    /**
     * Get financial chart data
     */
    getFinancialChartData = async (year, dateRange) => {
        let startDate, endDate;
        
        if (dateRange) {
            // Parse custom date range if provided
            const [start, end] = dateRange.split(',');
            startDate = new Date(start);
            endDate = new Date(end);
        } else {
            // Use the entire year
            startDate = new Date(year, 0, 1); // January 1st
            endDate = new Date(year, 11, 31); // December 31st
        }
        
        // Query for fee transactions within the date range
        const feeTransactions = await prisma.financialTransaction.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                type: 'INCOME'
            },
            select: {
                id: true,
                amount: true,
                date: true,
                category: true
            }
        });
        
        // Query for expense transactions within the date range
        const expenseTransactions = await prisma.financialTransaction.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                type: 'EXPENSE'
            },
            select: {
                id: true,
                amount: true,
                date: true,
                category: true
            }
        });
        
        // Group by month
        const monthlyData = {};
        
        // Initialize data for all months in the range
        const months = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            months.push(monthKey);
            
            monthlyData[monthKey] = {
                income: 0,
                expenses: 0,
                monthName: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toLocaleString('default', { month: 'short' })
            };
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        // Aggregate fee transactions by month
        feeTransactions.forEach(transaction => {
            const date = transaction.date;
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].income += transaction.amount;
            }
        });
        
        // Aggregate expense transactions by month
        expenseTransactions.forEach(expense => {
            const date = expense.date;
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].expenses += expense.amount;
            }
        });
        
        // Calculate total income, expenses, and profit
        let totalIncome = 0;
        let totalExpenses = 0;
        
        Object.values(monthlyData).forEach(data => {
            totalIncome += data.income;
            totalExpenses += data.expenses;
        });
        
        // Sort months chronologically
        const sortedMonths = months.sort();
        
        // Format for chart consumption
        return {
            labels: sortedMonths.map(month => monthlyData[month].monthName),
            datasets: [
                {
                    label: 'Income',
                    data: sortedMonths.map(month => monthlyData[month].income),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                },
                {
                    label: 'Expenses',
                    data: sortedMonths.map(month => monthlyData[month].expenses),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ],
            summary: {
                totalIncome,
                totalExpenses,
                netProfit: totalIncome - totalExpenses
            }
        };
    };

    /**
     * Get exam chart data
     */
    getExamChartData = async (month, year, classId, sectionId) => {
        // Format the start and end dates for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month
        
        // Build query for exams within the month
        let examQuery = {
            date: {
                gte: startDate,
                lte: endDate
            }
        };
        
        // Add class filter if provided
        if (classId) {
            examQuery.classId = classId;
        }
        
        // Fetch exams conducted in the month
        const exams = await prisma.exam.findMany({
            where: examQuery,
            include: {
                subject: {
                    select: {
                        name: true
                    }
                },
                results: {
                    where: sectionId ? {
                        student: {
                            sectionId: sectionId
                        }
                    } : {},
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                sectionId: true
                            }
                        }
                    }
                }
            }
        });
        
        // Process exam performance data
        const examPerformance = exams.map(exam => {
            // Calculate performance metrics
            const totalStudents = exam.results.length;
            const passingCount = exam.results.filter(result => 
                result.marksObtained >= exam.passingMarks
            ).length;
            
            // Calculate score distribution
            const scoreDistribution = {
                excellent: 0, // 90-100%
                good: 0,      // 75-89%
                average: 0,   // 60-74%
                belowAverage: 0, // 35-59%
                poor: 0       // 0-34%
            };
            
            exam.results.forEach(result => {
                const percentage = (result.marksObtained / exam.maxMarks) * 100;
                
                if (percentage >= 90) {
                    scoreDistribution.excellent += 1;
                } else if (percentage >= 75) {
                    scoreDistribution.good += 1;
                } else if (percentage >= 60) {
                    scoreDistribution.average += 1;
                } else if (percentage >= 35) {
                    scoreDistribution.belowAverage += 1;
                } else {
                    scoreDistribution.poor += 1;
                }
            });
            
            // Calculate average score
            const totalScore = exam.results.reduce((sum, result) => sum + result.marksObtained, 0);
            const averageScore = totalStudents > 0 ? totalScore / totalStudents : 0;
            const averagePercentage = (averageScore / exam.maxMarks) * 100;
            
            return {
                examName: exam.name,
                subject: exam.subject.name,
                date: exam.date.toISOString().split('T')[0],
                totalStudents,
                passingCount,
                passingRate: totalStudents > 0 ? (passingCount / totalStudents) * 100 : 0,
                averageScore,
                averagePercentage: Math.round(averagePercentage * 10) / 10, // Round to 1 decimal place
                scoreDistribution
            };
        });
        
        // Filter out exams with no results
        const validExams = examPerformance.filter(exam => exam.totalStudents > 0);
        
        // Prepare chart data
        const scoreDistributionData = {
            excellent: 0,
            good: 0,
            average: 0,
            belowAverage: 0,
            poor: 0
        };
        
        // Aggregate score distribution across all exams
        validExams.forEach(exam => {
            Object.keys(scoreDistributionData).forEach(category => {
                scoreDistributionData[category] += exam.scoreDistribution[category];
            });
        });
        
        // Format for chart consumption
        return {
            exams: validExams.map(exam => ({
                name: `${exam.examName} (${exam.subject})`,
                passingRate: exam.passingRate,
                averagePercentage: exam.averagePercentage
            })),
            scoreDistribution: {
                labels: ['Excellent (90-100%)', 'Good (75-89%)', 'Average (60-74%)', 'Below Average (35-59%)', 'Poor (0-34%)'],
                data: [
                    scoreDistributionData.excellent,
                    scoreDistributionData.good,
                    scoreDistributionData.average,
                    scoreDistributionData.belowAverage,
                    scoreDistributionData.poor
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',  // Excellent
                    'rgba(54, 162, 235, 0.7)',  // Good
                    'rgba(255, 205, 86, 0.7)',  // Average
                    'rgba(255, 159, 64, 0.7)',  // Below Average
                    'rgba(255, 99, 132, 0.7)'   // Poor
                ]
            },
            examCount: validExams.length,
            totalStudents: validExams.reduce((sum, exam) => sum + exam.totalStudents, 0),
            averagePassRate: validExams.length > 0 
                ? validExams.reduce((sum, exam) => sum + exam.passingRate, 0) / validExams.length 
                : 0
        };
    };
}

export default ReportService;