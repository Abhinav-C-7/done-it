import React from 'react';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

const LogoutConfirmation = () => {
  const { showLogoutConfirm, confirmLogout, cancelLogout } = useAuth();

  // Logout icon
  const LogoutIcon = () => (
    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </div>
  );

  return (
    <ConfirmationDialog
      isOpen={showLogoutConfirm}
      onClose={cancelLogout}
      onConfirm={confirmLogout}
      title="Log Out"
      message="Are you sure you want to log out of your account? You'll need to sign in again to access your account."
      confirmText="Yes, Log Out"
      cancelText="Cancel"
      confirmButtonClass="bg-yellow-500 hover:bg-yellow-600"
      icon={<LogoutIcon />}
    />
  );
};

export default LogoutConfirmation;
