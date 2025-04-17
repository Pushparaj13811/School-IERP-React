import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import { resultAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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
  const [selectedTerm, setSelectedTerm] = useState<string>("First Term");
  const [subjects, setSubjects] = useState<SubjectResult[]>([]);
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
  
  const terms = ["First Term", "Second Term", "Final Term"];
  
  const fetchResults = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the term value in the format the API expects (First Term -> First)
      const apiTerm = selectedTerm.split(' ')[0];
      
      // Fetch subject results
      const subjectResponse = await resultAPI.getResults({
        studentId: user.id,
        academicYear: new Date().getFullYear().toString(),
        term: apiTerm
      });
      
      console.log("API Response:", subjectResponse.data);
      
      if (subjectResponse.data.status === 'success' && subjectResponse.data.data.results) {
        const subjectResults = subjectResponse.data.data.results as unknown as EnhancedResult[];
        
        // Check if we have any results
        if (subjectResults.length === 0) {
          setError("No results found for the selected term");
          setIsLoading(false);
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
              studentId: user.id,
              academicYear: new Date().getFullYear().toString(),
              term: apiTerm
            });
            
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
        setError("Failed to fetch results or no results found");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("An error occurred while fetching results");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchResults();
  }, [selectedTerm, user?.id]);
  
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
        <div className="flex d-flex-row">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Result</h2>
          
          {/* Term selector */}
          <div className="flex justify-end w-full mb-4">
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