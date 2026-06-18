import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  description?: string;
}

export default function DataTable<T>({ columns, data, title, description }: DataTableProps<T>) {
  return (
    <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
      {(title || description) && (
        <div className="px-6 py-5 border-b border-gray-200">
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-4 font-semibold tracking-wide">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-gray-900">
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : String(row[col.accessor])}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
