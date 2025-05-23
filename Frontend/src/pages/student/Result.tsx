import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import { resultAPI, userAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { UserRole } from "../../utils/roles";

interface SubjectResult {
  id: number;
  subject: string;
  fullMarks: number;
  passMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  grade: string;
}

interface ResultSummary {
  status: string;
  totalPercentage: string;
  strongestSubject: string;
  subjectToImprove: string;
  rank: string;
  note: string;
  classTeacher: string;
}

// Define interfaces for API response
interface OverallResultData {
  status: string;
  totalPercentage: number;
  rank?: string | number;
  strongestSubject?: string;
  subjectsToImprove?: string[];
}

// Extend the Result type from api.ts to match our needs
type EnhancedResult = {
  id: number;
  studentId: number;
  subjectId: number;
  subject?: { name: string };
  grade?: { grade: string };
  fullMarks: number;
  passMarks: number;
  theoryMarks: number;
  practicalMarks: number;
  totalMarks: number;
  isLocked?: boolean;
};

const Result: React.FC = () => {
  const { user } = useAuth();
  const { studentId } = useParams<{ studentId?: string }>();
  const [selectedTerm, setSelectedTerm] = useState<string>("First");
  const [subjects, setSubjects] = useState<SubjectResult[]>([]);
  const [studentInfo, setStudentInfo] = useState<{ name: string, class: string, section: string } | null>(null);
  const [resultSummary, setResultSummary] = useState<ResultSummary>({
    status: "",
    totalPercentage: "",
    strongestSubject: "",
    subjectToImprove: "",
    rank: "",
    note: "A = Absent",
    classTeacher: "Madhav Ji Vandari" // This could be fetched from API if available
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const terms = ["First", "Second", "Final"];
  
  useEffect(() => {
    fetchResults();
  }, [selectedTerm, studentId]);
  
  const fetchResults = async () => {
    // Determine which student ID to use
    const targetStudentId = studentId ? parseInt(studentId) : user?.student?.id;
    
    if (!targetStudentId) {
      console.error("No student ID found");
      setError("Student information not available");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // If viewing as parent with studentId param, fetch student details
    if (studentId && user?.role === UserRole.PARENT) {
      try {
        const studentResponse = await userAPI.getStudentById(parseInt(studentId));
        if (studentResponse.data?.status === 'success' && studentResponse.data?.data?.student) {
          const student = studentResponse.data.data.student;
          setStudentInfo({
            name: student.name,
            class: student.class?.name || '',
            section: student.section?.name || ''
          });
        }
      } catch (err) {
        console.error('Error fetching student info:', err);
      }
    }
    
    try {
      // No need to split term anymore, we're using the exact format
      const apiTerm = selectedTerm;
      
      // Use the current year from the database (2025 as per the logs)
      const currentYear = "2025";
      
      console.log(`Fetching results for student ${targetStudentId}, year ${currentYear}, term ${apiTerm}`);
      
      // Fetch subject results
      const subjectResponse = await resultAPI.getResults({
        studentId: targetStudentId,
        academicYear: currentYear,
        term: apiTerm,
        isPublished: true // Only fetch published results
      });
      
      console.log("API Response:", subjectResponse.data);
      console.log("Results data:", subjectResponse.data?.data?.results);
      
      if (subjectResponse.data.status === 'success' && Array.isArray(subjectResponse.data.data.results)) {
        const subjectResults = subjectResponse.data.data.results as unknown as EnhancedResult[];
        
        // Check if we have any results
        if (subjectResults.length === 0) {
          setSubjects([]);
          setError("No results have been published for the selected term");
          setIsLoading(false);
          
          // Reset the result summary with placeholder values
          setResultSummary({
            status: "Pending",
            totalPercentage: "0%",
            strongestSubject: "N/A",
            subjectToImprove: "N/A",
            rank: "N/A",
            note: "Results have not been published yet",
            classTeacher: "N/A"
          });
          return;
        }
        
        // Format the subject results for display
        const formattedSubjects = subjectResults.map((result, index) => ({
          id: index + 1,
          subject: result.subject?.name || `Subject ${result.subjectId}`,
          fullMarks: result.fullMarks || 0,
          passMarks: result.passMarks || 0,
          theoryMarks: result.theoryMarks || 0,
          practicalMarks: result.practicalMarks || 0,
          totalMarks: result.totalMarks || 0,
          grade: result.grade?.grade || '-'
        }));
        
        setSubjects(formattedSubjects);
        
        // Find strongest and weakest subjects
        if (formattedSubjects.length > 0) {
          const strongestSubject = formattedSubjects.reduce((prev, current) => 
            (prev.totalMarks > current.totalMarks) ? prev : current);
          
          const weakestSubject = formattedSubjects.reduce((prev, current) => 
            (prev.totalMarks < current.totalMarks) ? prev : current);
          
          // Try to fetch overall result separately if needed
          try {
            // Use the API client instead of raw fetch
            const overallResponse = await resultAPI.getOverallResult({
              studentId: targetStudentId,
              academicYear: currentYear,
              term: apiTerm,
              isPublished: true // Only fetch published overall results
            });
            
            console.log("Overall Result Response:", overallResponse.data);
            
            let overallResult: OverallResultData | null = null;
            
            if (overallResponse.data.status === 'success' && overallResponse.data.data.result) {
              overallResult = overallResponse.data.data.result;
            } else {
              // Calculate overall from subject results if not provided
              const totalMarks = formattedSubjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
              const fullMarks = formattedSubjects.reduce((sum, subject) => sum + subject.fullMarks, 0);
              const percentage = (totalMarks / fullMarks) * 100;
              
              overallResult = {
                status: percentage >= 40 ? 'Passed' : 'Failed',
                totalPercentage: percentage,
                rank: '-',
                strongestSubject: strongestSubject.subject,
                subjectsToImprove: [weakestSubject.subject]
              };
              
              console.log("Calculated local result:", overallResult);
            }
            
            // Safe access with null check
            if (overallResult) {
              setResultSummary({
                status: overallResult.status,
                totalPercentage: `${overallResult.totalPercentage?.toFixed(2) || 0}%`,
                strongestSubject: overallResult.strongestSubject || strongestSubject.subject,
                subjectToImprove: overallResult.subjectsToImprove?.[0] || weakestSubject.subject,
                rank: overallResult.rank?.toString() || '-',
                note: "A = Absent",
                classTeacher: "Madhav Ji Vandari"
              });
            }
          } catch (err) {
            console.error("Error fetching overall result:", err);
            
            // Fallback to using calculated data from subject results
            const totalMarks = formattedSubjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
            const fullMarks = formattedSubjects.reduce((sum, subject) => sum + subject.fullMarks, 0);
            const percentage = (totalMarks / fullMarks) * 100;
            
            setResultSummary({
              status: percentage >= 40 ? 'Passed' : 'Failed',
              totalPercentage: `${percentage.toFixed(2)}%`,
              strongestSubject: strongestSubject.subject,
              subjectToImprove: weakestSubject.subject,
              rank: '-',
              note: "A = Absent",
              classTeacher: "Madhav Ji Vandari"
            });
          }
        }
      } else {
        console.error("API response doesn't contain expected format:", subjectResponse.data);
        setSubjects([]);
        setError("No results have been published for this term yet");
        
        // Reset the result summary with placeholder values
        setResultSummary({
          status: "Pending",
          totalPercentage: "0%",
          strongestSubject: "N/A",
          subjectToImprove: "N/A",
          rank: "N/A",
          note: "Results have not been published yet",
          classTeacher: "N/A"
        });
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("No results have been published for this term yet");
      setSubjects([]);
      
      // Reset the result summary with placeholder values
      setResultSummary({
        status: "Pending",
        totalPercentage: "0%",
        strongestSubject: "N/A",
        subjectToImprove: "N/A",
        rank: "N/A",
        note: "Results have not been published yet",
        classTeacher: "N/A"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resultColumns = [
    { header: "S. No.", accessor: "id" },
    { header: "Subject Name", accessor: "subject", className: "text-start" },
    { header: "Full Marks", accessor: "fullMarks" },
    { header: "Pass Marks", accessor: "passMarks" },
    { header: "Theory Marks", accessor: "theoryMarks" },
    { header: "Practical Marks", accessor: "practicalMarks" },
    { header: "Total Marks", accessor: "totalMarks" },
    { header: "Grade", accessor: "grade" }
  ];

  return (
    <div className="w-full p-4 bg-[#EEF5FF]">
      <div className="w-full p-6 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div>
            <h2 className="mb-1 text-2xl font-bold text-gray-800">Result</h2>
            {studentInfo && (
              <p className="mb-4 text-gray-600">
                {studentInfo.name} - {studentInfo.class} {studentInfo.section}
              </p>
            )}
          </div>
          
          {/* Term selector */}
          <div className="flex justify-start sm:justify-end w-full mb-4">
            <div className="flex items-center">
              <span className="mr-2 font-medium">Term:</span>
              <div className="relative">
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#292648]"
                >
                  {terms.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                  <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#292648]"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 my-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        
        {!isLoading && !error && subjects.length === 0 && (
          <div className="p-4 my-4 text-yellow-700 bg-yellow-100 border border-yellow-400 rounded">
            No results found for the selected term.
          </div>
        )}
        
        {!isLoading && subjects.length > 0 && (
          <>
            {/* Results table */}
            <div className="w-full mb-6">
              <Table
                title="Subject Results"
                columns={resultColumns}
                data={subjects}
                headerBackgroundColor="#292648"
              />
            </div>
              
            {/* Result summary */}
            <div className="grid w-full grid-cols-1 gap-4 mt-6 rounded md:grid-cols-12">
              <div className="md:col-span-8 bg-[#292648] rounded-lg p-5 text-dark ">
                <div className="bg-[#EEF5FF] p-3 rounded">
                  <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
                    <div>
                      <p className="mb-1 font-semibold">Status:</p>
                      <p className={resultSummary.status === "Passed" ? "text-green-500" : "text-red-500"}>
                        {resultSummary.status}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Strongest Subject:</p>
                      <p>{resultSummary.strongestSubject}</p>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Note:</p>
                      <p>{resultSummary.note}</p>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Total Percentage:</p>
                      <p>{resultSummary.totalPercentage}</p>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Subject to be Improved:</p>
                      <p>{resultSummary.subjectToImprove}</p>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold">Rank:</p>
                      <p>{resultSummary.rank}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-lg bg-[#292648] text-centerborder md:col-span-4">
                <div className="bg-[#EEF5FF] p-8 flex flex-row gap-3 rounded md:flex-col lg:flex-row">
                  <div>
                    <p className="mb-1 font-semibold">Class Teacher:</p>
                    <p>{resultSummary.classTeacher}</p>
                  </div>
                  <div className="mt-4">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Signature_Marcel_Cachin.jpg/320px-Signature_Marcel_Cachin.jpg" 
                      alt="Teacher's Signature" 
                      className="inline-block h-16"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Result; 