import React from 'react';

interface Column {
  header: string;
  accessor: string;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cell?: (value: any) => React.ReactNode;
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
          <h4 className="mb-3 font-bold text-start" id={`table-title-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</h4>
          <hr className="mb-3" />
        </>
      )}
      <div className="w-full overflow-x-auto">
        <table 
          className="w-full border table-auto" 
          role="table" 
          aria-labelledby={title ? `table-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
        >
          <thead>
            <tr role="row">
              {columns.map((column, idx) => (
                <th 
                  key={idx} 
                  className={`text-center py-2 px-3 ${column.className || ''}`}
                  style={{ backgroundColor: headerBackgroundColor, color: headerTextColor }}
                  role="columnheader"
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className="text-center"
                  style={{ 
                    backgroundColor: alternateRowColors 
                      ? rowIdx % 2 === 0 ? '#E9F0FF' : '#D9E4FF' 
                      : undefined 
                  }}
                  role="row"
                  tabIndex={0}
                >
                  {columns.map((column, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`py-2 px-3 border ${column.className || ''}`}
                      role="cell"
                    >
                      {column.cell 
                        ? column.cell(row[column.accessor]) 
                        : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="py-4 text-center text-gray-500"
                  role="cell"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table; 