import React from 'react';

// PopupModal component: displays children in a centered overlay when `isOpen` is true.
interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PopupModal: React.FC<PopupModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-b rounded-3xl p-6 shadow-lg w-auto h-auto relative">
        {children}
      </div>
    </div>
  );
};

export default PopupModal;
