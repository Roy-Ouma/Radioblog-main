import React from 'react';

const ConfirmModal = ({ opened, title = 'Confirm', message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) => {
  if (!opened) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg w-11/12 max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="mt-4 text-sm text-slate-700 dark:text-slate-300">{message}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border bg-transparent text-slate-700 dark:text-slate-300">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
