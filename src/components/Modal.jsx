import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '30px',
        position: 'relative',
        animation: 'modalIn 0.3s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>
        <h2 className="title-gradient" style={{ marginBottom: '24px' }}>{title}</h2>
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Modal;
