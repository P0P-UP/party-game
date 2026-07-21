import React, { useState } from 'react';

/**
 * AnswerCard — displays an answer with vote count and optional vote button.
 * Flips in on mount with staggered animation.
 *
 * @param {{ answer, index, myPlayerId, onVote, hasVoted, isWinner }}
 */
export default function AnswerCard({ answer, index, myPlayerId, onVote, hasVoted, isWinner }) {
  const isMyAnswer = answer.playerId === myPlayerId;
  const canVote = !hasVoted && !isMyAnswer;

  return (
    <div
      className={`answer-card ${isWinner ? 'answer-winner' : ''} animate-slide`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {isWinner && (
        <div className="winner-crown" title="Most votes!">👑</div>
      )}

      {/* Answer text */}
      <p className="answer-text">{answer.text}</p>

      {/* Footer: votes + vote button */}
      <div className="answer-footer">
        <div className="answer-votes">
          <span className="vote-icon">🔥</span>
          <span className="vote-count">{answer.votes}</span>
          <span className="vote-label">vote{answer.votes !== 1 ? 's' : ''}</span>
        </div>

        {!hasVoted && !isMyAnswer && (
          <button
            className="btn btn-primary btn-sm vote-btn"
            onClick={() => onVote?.(answer.playerId)}
          >
            Vote 🔥
          </button>
        )}

        {isMyAnswer && (
          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Your answer</span>
        )}

        {hasVoted && !isMyAnswer && (
          <span className="text-muted text-small">voted</span>
        )}
      </div>

      <style>{`
        .answer-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          position: relative;
          transition: all var(--transition);
          overflow: hidden;
        }
        .answer-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(124,58,237,0.04), transparent);
          pointer-events: none;
        }
        .answer-winner {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 0 0 24px rgba(245, 158, 11, 0.2);
        }
        .answer-winner::before {
          background: linear-gradient(135deg, rgba(245,158,11,0.08), transparent);
        }

        .winner-crown {
          position: absolute;
          top: -12px;
          right: 16px;
          font-size: 1.4rem;
          animation: pulse 1.2s infinite;
        }

        .answer-text {
          font-size: 1.05rem;
          font-weight: 500;
          line-height: 1.5;
          margin-bottom: 14px;
          color: var(--text-primary);
        }

        .answer-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .answer-votes {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .vote-icon { font-size: 1rem; }
        .vote-count { font-weight: 800; font-size: 1.1rem; color: var(--coral); }
        .vote-label { color: var(--text-secondary); font-size: 0.85rem; }

        .vote-btn { min-width: 90px; }
      `}</style>
    </div>
  );
}
