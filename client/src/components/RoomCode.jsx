import React, { useState } from 'react';

/**
 * RoomCode — displays the room code large and copyable.
 * @param {{ code: string }}
 */
export default function RoomCode({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="room-code-wrapper animate-scale">
      <p className="room-code-label">Room Code</p>
      <button className="room-code-display" onClick={handleCopy} title="Click to copy">
        {code.split('').map((char, i) => (
          <span key={i} className="room-code-char" style={{ animationDelay: `${i * 0.06}s` }}>
            {char}
          </span>
        ))}
      </button>
      <p className="room-code-hint">
        {copied ? '✅ Copied to clipboard!' : 'Tap to copy'}
      </p>

      <style>{`
        .room-code-wrapper {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .room-code-label {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .room-code-display {
          display: flex;
          gap: 8px;
          background: none;
          padding: 12px 16px;
          border-radius: var(--radius);
          border: 1px solid var(--border-purple);
          background: rgba(124,58,237,0.08);
          transition: all var(--transition);
          cursor: pointer;
        }
        .room-code-display:hover {
          background: rgba(124,58,237,0.15);
          border-color: var(--purple);
          transform: scale(1.03);
        }
        .room-code-char {
          font-size: clamp(2rem, 8vw, 3.5rem);
          font-weight: 900;
          color: var(--purple-light);
          letter-spacing: 0.05em;
          animation: fadeIn 0.3s ease both;
          font-variant-numeric: tabular-nums;
        }
        .room-code-hint {
          font-size: 0.78rem;
          color: var(--text-muted);
          transition: color var(--transition);
        }
      `}</style>
    </div>
  );
}
