import React from 'react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-yellow-500 hover:bg-yellow-600",
  icon = null
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Dialog content */}
      <div className="relative z-10 w-full max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-xl">
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start">
            {icon && (
              <div className="flex-shrink-0 mr-4">
                {icon}
              </div>
            )}
            <div className="w-full">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 min-w-[100px]"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 min-w-[100px] ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
