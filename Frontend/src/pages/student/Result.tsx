import React, { useState } from "react";
import Table from "../../components/ui/Table";

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

const Result: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<string>("First Term");
  
  const terms = ["First Term", "Second Term", "Final Term"];
  
  const subjects: SubjectResult[] = [
    { id: 1, subject: "Nepali", fullMarks: 10, passMarks: 4, theoryMarks: 6.5, practicalMarks: 2.5, totalMarks: 7.5, grade: "B+" },
    { id: 2, subject: "English", fullMarks: 10, passMarks: 4, theoryMarks: 5.2, practicalMarks: 3.2, totalMarks: 8.2, grade: "A" },
    { id: 3, subject: "Maths", fullMarks: 10, passMarks: 4, theoryMarks: 6, practicalMarks: 2, totalMarks: 8, grade: "A" },
    { id: 4, subject: "Social", fullMarks: 10, passMarks: 4, theoryMarks: 6.8, practicalMarks: 2.5, totalMarks: 7.5, grade: "B+" },
    { id: 5, subject: "Science", fullMarks: 10, passMarks: 4, theoryMarks: 5, practicalMarks: 3, totalMarks: 8, grade: "A" },
    { id: 6, subject: "Moral Science", fullMarks: 10, passMarks: 4, theoryMarks: 6, practicalMarks: 3, totalMarks: 9, grade: "A+" },
    { id: 7, subject: "Computer", fullMarks: 10, passMarks: 4, theoryMarks: 4, practicalMarks: 5, totalMarks: 9, grade: "A+" },
    { id: 8, subject: "Occupation Business and Technology.....", fullMarks: 10, passMarks: 4, theoryMarks: 3, practicalMarks: 3, totalMarks: 6, grade: "B" },
    { id: 9, subject: "Health and Physical Education", fullMarks: 10, passMarks: 4, theoryMarks: 3, practicalMarks: 4, totalMarks: 7, grade: "B" },
  ];
  
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

  const resultSummary: ResultSummary = {
    status: "Passed",
    totalPercentage: "75%",
    strongestSubject: "Moral Studies",
    subjectToImprove: "Maths",
    rank: "12th",
    note: "A = Absent",
    classTeacher: "Madhav Ji Vandari"
  };

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
        <div className="grid w-full grid-cols-1 gap-4 mt-6 md:grid-cols-12">
          <div className="md:col-span-9 bg-[#292648] rounded-lg p-5 text-white">
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              <div>
                <p className="mb-1 font-semibold">Status:</p>
                <p className="text-green-400">{resultSummary.status}</p>
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
          <div className="p-5 text-center bg-white border rounded-lg md:col-span-3">
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
    </div>
  );
};

export default Result; 