import React, { useEffect, useState } from 'react';

/**
 * Toast — auto-dismissing notification banner.
 * @param {{ message, type, onDismiss }}
 * type: 'error' | 'success' | 'info'
 */
export default function Toast({ message, type = 'error', onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  const icons = { error: '❌', success: '✅', info: 'ℹ️' };

  return (
    <div className={`toast toast-${type} ${visible ? 'toast-in' : 'toast-out'}`}>
      <span>{icons[type]}</span>
      <span className="toast-msg">{message}</span>
      <button className="toast-close" onClick={() => { setVisible(false); onDismiss?.(); }}>✕</button>

      <style>{`
        .toast {
          position: fixed;
          bottom: max(24px, env(safe-area-inset-bottom, 24px));
          left: 50%;
          transform: translateX(-50%) translateY(0);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: var(--radius);
          font-size: 0.9rem;
          font-weight: 600;
          max-width: calc(100vw - 32px);
          width: max-content;
          z-index: 9999;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          transition: all 0.3s ease;
        }
        .toast-in {
          animation: slideUp 0.3s ease both;
        }
        .toast-out {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        .toast-error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.3);  color: #fca5a5; }
        .toast-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #6ee7b7; }
        .toast-info    { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); color: var(--purple-light); }
        .toast-msg { flex: 1; }
        .toast-close {
          background: none;
          color: inherit;
          opacity: 0.6;
          font-size: 0.8rem;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .toast-close:hover { opacity: 1; }
      `}</style>
    </div>
  );
}
