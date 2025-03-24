import React from 'react';

interface Column {
  header: string;
  accessor: string;
  className?: string;
}

interface TableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  title?: string;
  alternateRowColors?: boolean;
  headerBackgroundColor?: string;
  headerTextColor?: string;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  title,
  alternateRowColors = true,
  headerBackgroundColor = '#1D1B48',
  headerTextColor = 'white',
}) => {
  return (
    <div className="shadow-sm rounded p-3 mb-4 bg-[#F1F4F9] w-full">
      {title && (
        <>
          <h4 className="font-bold mb-3 text-start">{title}</h4>
          <hr className="mb-3" />
        </>
      )}
      <div className="overflow-x-auto w-full">
        <table className="w-full border table-auto">
          <thead>
            <tr>
              {columns.map((column, idx) => (
                <th 
                  key={idx} 
                  className={`text-center py-2 px-3 ${column.className || ''}`}
                  style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className="text-center"
                style={{ 
                  backgroundColor: alternateRowColors 
                    ? rowIdx % 2 === 0 ? '#E9F0FF' : '#D9E4FF' 
                    : undefined 
                }}
              >
                {columns.map((column, colIdx) => (
                  <td 
                    key={colIdx} 
                    className={`py-2 px-3 border ${column.className || ''}`}
                  >
                    {row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table; 