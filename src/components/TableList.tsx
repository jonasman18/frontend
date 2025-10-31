// src/components/TableList.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode; // rendu personnalisé
}

interface TableListProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  idKey: keyof T;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: number | string) => void;
  showActions?: boolean;
  animateRows?: boolean; // Nouveau prop pour activer l'animation successive
}

function getValue(obj: any, path: string): any {
  return path.split(".").reduce((o, p) => o?.[p], obj);
}

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const TableList = <T extends Record<string, any>>({
  title,
  columns,
  data,
  idKey,
  onAdd,
  onEdit,
  onDelete,
  showActions = true,
  animateRows = false,
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
          <AnimatePresence>
            <motion.tbody
              className="space-y-1"
              variants={animateRows ? containerVariants : undefined}
              initial={animateRows ? "hidden" : undefined}
              animate={animateRows ? "visible" : undefined}
            >
              {data.map((item, index) => (
                <motion.tr
                  key={String(item[idKey])}
                  className="hover:bg-emerald-900 transition"
                  variants={animateRows ? rowVariants : undefined}
                  initial={animateRows ? "hidden" : undefined}
                  animate={animateRows ? "visible" : undefined}
                  custom={index}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
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
                </motion.tr>
              ))}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>
    </div>
  );
};

export default TableList;