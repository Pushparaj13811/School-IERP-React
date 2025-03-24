import React from 'react';

interface Result {
  subject: string;
  fullMarks: number;
  passMarks: number;
  theory: number;
  practical: number;
  total: number;
  grade: string;
}

interface ResultTableProps {
  results: Result[];
}

const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border text-center py-2 px-3" style={{ backgroundColor: "#292648", color: "white" }}>S.No.</th>
            <th className="border text-center py-2 px-3" style={{ backgroundColor: "#292648", color: "white" }}>Subject</th>
            <th className="border text-center py-2 px-3" style={{ backgroundColor: "#292648", color: "white" }}>Full Marks</th>
            <th className="border text-center py-2 px-3" style={{ backgroundColor: "#292648", color: "white" }}>Pass Marks</th>
            <th className="border text-center py-2 px-3" style={{ backgroundColor: "#292648", color: "white" }}>Theory</th>
            <th className="border text-center py-2 px-3" style={{ backgroundColor: "#292648", color: "white" }}>Practical</th>
            <th className="border text-center py-2 px-3" style={{ backgroundColor: "#292648", color: "white" }}>Total</th>
            <th className="border text-center py-2 px-3" style={{ backgroundColor: "#292648", color: "white" }}>Grade</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr 
              key={index} 
              className="text-center"
              style={{ backgroundColor: index % 2 === 0 ? "#E9F0FF" : "#D9E4FF" }}
            >
              <td className="border py-2 px-3">{index + 1}</td>
              <td className="border py-2 px-3 text-left">{result.subject}</td>
              <td className="border py-2 px-3">{result.fullMarks}</td>
              <td className="border py-2 px-3">{result.passMarks}</td>
              <td className="border py-2 px-3">{result.theory}</td>
              <td className="border py-2 px-3">{result.practical}</td>
              <td className="border py-2 px-3">{result.total}</td>
              <td className="border py-2 px-3">{result.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable; 