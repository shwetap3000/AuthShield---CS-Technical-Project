import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-900/40 border border-gray-800 rounded-xl text-gray-500 font-mono text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800/80 bg-gray-900/40">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-950/70 text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
            {columns.map((col, idx) => (
              <th key={idx} className={`py-3.5 px-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-gray-800/30 transition-colors duration-150"
            >
              {columns.map((col, cIdx) => (
                <td key={cIdx} className={`py-3.5 px-4 text-gray-300 ${col.className || ''}`}>
                  {col.cell
                    ? col.cell(item)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
