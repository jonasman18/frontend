import React from "react";
import type { ReactNode } from "react";

interface ModalFormProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
}

const ModalForm: React.FC<ModalFormProps> = ({
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Enregistrer",
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-emerald-800 text-white rounded-lg shadow-xl p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold text-center mb-6">{title}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
