import React from 'react';
import Card from '../ui/Card';

interface ResultSummary {
  status: string;
  percentage: string;
  strongestSubject: string;
  weakSubject: string;
  note: string;
  rank: string;
  teacher: string;
}

interface ResultSummaryCardProps {
  summary: ResultSummary;
}

const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({ summary }) => {
  return (
    <Card className="mb-4">
      <h4 className="text-lg font-bold text-primary mb-3">Result Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex">
          <div className="w-1/2 font-medium">Status:</div>
          <div className={`w-1/2 ${summary.status === 'Passed' ? 'text-green-600' : 'text-red-600'}`}>
            {summary.status}
          </div>
        </div>
        
        <div className="flex">
          <div className="w-1/2 font-medium">Percentage:</div>
          <div className="w-1/2">{summary.percentage}</div>
        </div>
        
        <div className="flex">
          <div className="w-1/2 font-medium">Strongest Subject:</div>
          <div className="w-1/2">{summary.strongestSubject}</div>
        </div>
        
        <div className="flex">
          <div className="w-1/2 font-medium">Weak Subject:</div>
          <div className="w-1/2">{summary.weakSubject}</div>
        </div>
        
        <div className="flex">
          <div className="w-1/2 font-medium">Note:</div>
          <div className="w-1/2">{summary.note}</div>
        </div>
        
        <div className="flex">
          <div className="w-1/2 font-medium">Rank:</div>
          <div className="w-1/2">{summary.rank}</div>
        </div>
        
        <div className="flex col-span-2">
          <div className="w-1/4 font-medium">Teacher:</div>
          <div className="w-3/4">{summary.teacher}</div>
        </div>
      </div>
    </Card>
  );
};

export default ResultSummaryCard; 