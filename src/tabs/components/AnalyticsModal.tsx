import React, { ReactNode } from 'react'
import './Modal.css';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}
const AnalyticsModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal !max-w-[600px]">
                <button className="modal-close" onClick={onClose}>
                    Close
                </button>
                {children}
            </div>
        </div>
    );
};

export default AnalyticsModal;
