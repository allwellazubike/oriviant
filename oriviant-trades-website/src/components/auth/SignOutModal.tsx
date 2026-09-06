import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

export const SignOutModal: React.FC = () => {
  const { isSignOutModalOpen, closeSignOutModal, confirmLogout } = useUser();

  if (!isSignOutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-app-card border border-app rounded-3xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeSignOutModal}
          className="absolute top-4 right-4 p-2 rounded-xl bg-app-sec text-app-sec hover:text-app transition-colors z-10"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 text-center">
          
          {/* Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-red-500/10">
            <LogOut className="w-7 h-7" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-app tracking-tight mb-2">
            Sign Out
          </h3>

          {/* Message */}
          <p className="text-sm text-app-sec leading-relaxed mb-6">
            Are you sure you want to sign out of your Oriviant account?
          </p>

          {/* Warning hint */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium flex items-center gap-2 mb-6 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Active orders & sessions will be locked until you log in again.</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={closeSignOutModal}
              className="w-full py-3 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs border border-app transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
