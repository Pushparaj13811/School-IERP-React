import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Define the structure of a single subject result
type Result = {
  subject: string;
  fullMarks: number;
  passMarks: number;
  theory: number;
  practical: number;
  total: number;
  grade: string;
};

// Define the structure of term results
type TermResults = {
  [key: string]: Result[];
};

// Define result summary structure
type ResultSummary = {
  status: string;
  percentage: string;
  strongestSubject: string;
  weakSubject: string;
  note: string;
  rank: string;
  teacher: string;
};

// Term results data
const termResults: TermResults = {
  "First Term": [
    { subject: "Science", fullMarks: 10, passMarks: 4, theory: 5, practical: 3, total: 8, grade: "A" },
    { subject: "Social", fullMarks: 10, passMarks: 4, theory: 6.8, practical: 2.5, total: 7.5, grade: "B+" },
    { subject: "Nepali", fullMarks: 10, passMarks: 4, theory: 6.5, practical: 2.5, total: 9, grade: "A" },
    { subject: "English", fullMarks: 10, passMarks: 4, theory: 5.2, practical: 3.2, total: 8.4, grade: "A" },
    { subject: "Maths", fullMarks: 10, passMarks: 4, theory: 6, practical: 2, total: 8, grade: "A" },
    { subject: "Moral Science", fullMarks: 10, passMarks: 4, theory: 6, practical: 3, total: 9, grade: "A+" },
    { subject: "Computer", fullMarks: 10, passMarks: 4, theory: 4, practical: 5, total: 9, grade: "A+" },
    { subject: "Occupation Business and Technology.....", fullMarks: 10, passMarks: 4, theory: 6, practical: 3, total: 9, grade: "A+" },
    { subject: "Health and Physical Education", fullMarks: 10, passMarks: 4, theory: 5.2, practical: 3.2, total: 8.4, grade: "A" },
  ],
  "Second Term": [
    { subject: "Science", fullMarks: 10, passMarks: 4, theory: 5, practical: 3, total: 8, grade: "A" },
    { subject: "Social", fullMarks: 10, passMarks: 4, theory: 6.8, practical: 2.5, total: 7.5, grade: "B+" },
     { subject: "Nepali", fullMarks: 10, passMarks: 4, theory: 6.8, practical: 2.5, total: 7.5, grade: "B+" },
     { subject: "English", fullMarks: 10, passMarks: 4, theory: 6, practical: 2, total: 8, grade: "A" },
     { subject: "Computer", fullMarks: 10, passMarks: 4, theory: 4, practical: 5, total: 9, grade: "A+" },
     { subject: "Maths", fullMarks: 10, passMarks: 4, theory: 6, practical: 2, total: 8, grade: "A" },
    { subject: "Moral Science", fullMarks: 10, passMarks: 4, theory: 6, practical: 3, total: 9, grade: "A+" },
    { subject: "Occupation Business and Technology.....", fullMarks: 10, passMarks: 4, theory: 6, practical: 3, total: 9, grade: "A+" },
    { subject: "Health and Physical Education", fullMarks: 10, passMarks: 4, theory: 5.2, practical: 3.2, total: 8.4, grade: "A" },
  ],
  "Final Term": [
    { subject: "Maths", fullMarks: 10, passMarks: 4, theory: 6, practical: 2, total: 8, grade: "A" },
    { subject: "Nepali", fullMarks: 10, passMarks: 4, theory: 5, practical: 3, total: 8, grade: "A" },
    { subject: "Social", fullMarks: 10, passMarks: 4, theory: 6.8, practical: 2.5, total: 7.5, grade: "B+" },
    { subject: "Science", fullMarks: 10, passMarks: 4, theory: 5, practical: 3, total: 8, grade: "A" },
    { subject: "Moral Science", fullMarks: 10, passMarks: 4, theory: 6, practical: 3, total: 9, grade: "A+" },
    { subject: "Computer", fullMarks: 10, passMarks: 4, theory: 4, practical: 5, total: 9, grade: "A+" },
    { subject: "Occupation Business and Technology.....", fullMarks: 10, passMarks: 4, theory: 6, practical: 3, total: 9, grade: "A+" },
    { subject: "English", fullMarks: 10, passMarks: 4, theory: 5.2, practical: 3.2, total: 8.4, grade: "A" },
    { subject: "Health and Physical Education", fullMarks: 10, passMarks: 4, theory: 5.2, practical: 3.2, total: 8.4, grade: "A" },
  ],
};

// Result summary data
const initialSummary: ResultSummary = {
  status: "Passed",
  percentage: "75%",
  strongestSubject: "Moral Studies",
  weakSubject: "Maths",
  note: "A = Absent",
  rank: "12th",
  teacher: "Madhav Ji Vandari",
};

const StudentResult: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState<keyof TermResults>("First Term");
  const [resultSummary, setResultSummary] = useState<ResultSummary>(initialSummary);

  return (
    <div className="container mt-4 bg-light p-3 rounded shadow-md mb-5 mt-5" style={{ width: "auto", height:"auto" }}>
      {/* Header and Term Selector */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="primary-color">Result</h3>
        <div>
          <label className="fw-bold me-2 primary-color">Term:</label>
          <select
            className="form-select d-inline w-auto"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as keyof TermResults)}
          >
            {Object.keys(termResults).map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr />

      {/* Result Table */}
      <table className="table table-bordered text-center">
        <thead className="result-table-heads">
          <tr>
            <th>S.no</th>
            <th>Subject Name</th>
            <th>Full Marks</th>
            <th>Pass Marks</th>
            <th>Theory Marks</th>
            <th>Practical Marks</th>
            <th>Total Marks</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {termResults[selectedTerm] && Array.isArray(termResults[selectedTerm]) ? (
            termResults[selectedTerm].length > 0 ? (
              termResults[selectedTerm].map((result, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{result.subject}</td>
                  <td>{result.fullMarks}</td>
                  <td>{result.passMarks}</td>
                  <td>{result.theory}</td>
                  <td>{result.practical}</td>
                  <td>{result.total}</td>
                  <td>{result.grade}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>No data available for this term.</td>
              </tr>
            )
          ) : (
            <tr>
              <td colSpan={8}>Error loading results. Please try again.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Result Summary Section */}
      <div className="container mt-4 primary-bg-color p-4 rounded shadow-md">
        <div className="row justify-content-between">
          {/* Left Section */}
          <div className="col-12 col-md-8 p-3 secondary-bg-color primary-color rounded shadow text-start">
            <div className="row">
              <div className="col-4">
              <p>
                <strong>Status:</strong>{" "}
                <span className={`fw-bold ${resultSummary.status === "Passed" ? "text-success" : "text-danger"}`}>
                  {resultSummary.status}
                </span>
              </p>
            </div>
              <div className="col-4">
                <p>
                <strong>Total Percentage:</strong> {resultSummary.percentage}
              </p>
              </div>
              <div className="col-4">
              <p>
                <strong>Strongest Subject:</strong> {resultSummary.strongestSubject}
              </p>
              </div>
            </div>
            
            <div className="row">
              <div className="col-4">
              <p>
              <strong>Subject to be Improved:</strong> {resultSummary.weakSubject}
            </p>
              </div>
              <div className="col-4">
              <p>
              <strong>Note:</strong> {resultSummary.note}
            </p>
              </div>
              <div className="col-4">
              <p>
              <strong>Rank:</strong> {resultSummary.rank}
            </p>
              </div>
            </div>


            
            
            
          </div>

          {/* Right Section (Teacher Info) */}
          <div className="col-12 col-md-3 p-3 secondary-bg-color primary-color rounded shadow mt-3 mt-md-0 d-flex flex-column justify-content-center">
            <div className="">
              <p>
                <strong>Class Teacher:</strong> {resultSummary.teacher}{" "}
                <span className="ms-2">✍</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
