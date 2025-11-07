import React from 'react';

// PopupModal component: displays children in a centered overlay when `isOpen` is true.
interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PopupModal: React.FC<PopupModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* AnN edit: Made modal wider and scrollable to fit laptop screens on 10/30 */}
      <div className="bg-gradient-to-b rounded-3xl p-6 shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto relative popUp-scrollbar">
        {children}
      </div>
    </div>
  );
};

export default PopupModal;
