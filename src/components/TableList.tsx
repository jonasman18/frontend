import React from "react";

interface Column<T> {
  key: keyof T | string; // accepte chemins imbriqués
  label: string;
  render?: (item: T) => React.ReactNode; // rendu personnalisé optionnel
}

interface TableListProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  idKey: keyof T;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: number | string) => void;
  showActions?: boolean; // nouvelle option (default: true)
}

function getValue(obj: any, path: string): any {
  return path.split(".").reduce((o, p) => o?.[p], obj);
}

const TableList = <T extends Record<string, any>>({
  title,
  columns,
  data,
  idKey,
  onAdd,
  onEdit,
  onDelete,
  showActions = true,
}: TableListProps<T>) => {
  return (
    <div className="p-6 bg-emerald-950 text-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={onAdd}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md font-semibold"
        >
          ➕ Ajouter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left border border-emerald-700 rounded-md">
          <thead className="bg-emerald-800 text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key.toString()}
                  className="px-4 py-2 border-b border-emerald-700"
                >
                  {col.label}
                </th>
              ))}
              {showActions && (
                <th className="px-4 py-2 border-b border-emerald-700">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={String(item[idKey])}
                className="hover:bg-emerald-900 transition"
              >
                {columns.map((col) => (
                  <td
                    key={col.key.toString()}
                    className="px-4 py-2 border-b border-emerald-700 break-words truncate max-w-[200px]"
                  >
                    {col.render ? col.render(item) : (getValue(item, col.key.toString()) ?? "")}
                  </td>
                ))}

                {showActions && (
                  <td className="px-4 py-2 border-b border-emerald-700 flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                    >
                      ✏ Modifier
                    </button>
                    <button
                      onClick={() => onDelete(item[idKey] as any)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                    >
                      🗑 Supprimer
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableList;
