import React from 'react';
import { getPlayerColor, getPlayerEmoji } from '../utils/constants';

/**
 * PlayerCard — displays a player's avatar, name, host badge, and connection status.
 * @param {{ player, index, onKick, isHost, showKick }}
 */
export default function PlayerCard({ player, index, onKick, isHost, showKick }) {
  const gradient = getPlayerColor(index);
  const emoji = getPlayerEmoji(index);

  return (
    <div
      className="player-card animate-fade"
      style={{ animationDelay: `${index * 0.05}s`, opacity: player.connected ? 1 : 0.45 }}
    >
      {/* Avatar */}
      <div className="player-avatar" style={{ background: gradient }}>
        <span className="player-emoji">{emoji}</span>
        {!player.connected && (
          <div className="player-offline-indicator" title="Disconnected" />
        )}
      </div>

      {/* Name + badges */}
      <div className="player-info">
        <span className="player-name">{player.name}</span>
        <div className="player-badges">
          {player.isHost && (
            <span className="badge badge-coral" style={{ fontSize: '0.65rem' }}>
              👑 Host
            </span>
          )}
          {!player.connected && (
            <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Kick button — only host sees it, not on themselves */}
      {showKick && isHost && !player.isHost && (
        <button
          className="kick-btn"
          onClick={() => onKick?.(player.id)}
          title={`Kick ${player.name}`}
        >
          ✕
        </button>
      )}

      <style>{`
        .player-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          backdrop-filter: blur(16px);
          transition: all var(--transition);
        }
        .player-card:hover { border-color: rgba(255,255,255,0.12); }

        .player-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .player-emoji { font-size: 1.3rem; line-height: 1; }

        .player-offline-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--red);
          border: 2px solid var(--bg-base);
        }

        .player-info {
          flex: 1;
          min-width: 0;
        }
        .player-name {
          font-weight: 700;
          font-size: 0.95rem;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .player-badges {
          display: flex;
          gap: 4px;
          margin-top: 3px;
          flex-wrap: wrap;
        }

        .kick-btn {
          background: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition);
          flex-shrink: 0;
        }
        .kick-btn:hover {
          color: var(--red);
          background: rgba(239,68,68,0.12);
        }
      `}</style>
    </div>
  );
}
