import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getPlayerColor, getPlayerEmoji } from '../utils/constants';

/**
 * GameOverScreen — final leaderboard with confetti animation.
 */
export default function GameOverScreen() {
  const { gameState, myPlayerId, isHost, playAgain, room } = useGame();
  const canvasRef = useRef(null);

  const scores = gameState?.scores ?? {};
  const players = room?.players ?? [];

  // Build sorted leaderboard
  const leaderboard = Object.entries(scores)
    .map(([id, pts]) => {
      const player = players.find((p) => p.id === id);
      return { id, pts, name: player?.name ?? '?' };
    })
    .sort((a, b) => b.pts - a.pts);

  const winner = leaderboard[0];
  const isWinner = winner?.id === myPlayerId;

  // Confetti
  useEffect(() => {
    const particles = [];
    const colors = ['#7c3aed', '#f97316', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];

    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-particle';
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${1.5 + Math.random() * 3}s;
        animation-delay: ${Math.random() * 2}s;
        opacity: 0;
      `;
      document.body.appendChild(el);
      particles.push(el);
    }

    return () => {
      particles.forEach((el) => el.parentNode?.removeChild(el));
    };
  }, []);

  return (
    <div className="screen animate-fade" style={{ justifyContent: 'center', minHeight: '100dvh' }}>
      {/* Winner announcement */}
      <div className="go-winner animate-scale">
        <div className="go-trophy">{isWinner ? '🏆' : '🎮'}</div>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)' }}>
          {isWinner ? 'You Won! 🎉' : 'Game Over!'}
        </h1>
        {winner && (
          <p className="text-muted" style={{ fontSize: '1rem', marginTop: 6 }}>
            {isWinner ? 'You crushed it!' : `${winner.name} wins with ${winner.pts} pts! 🔥`}
          </p>
        )}
      </div>

      {/* Leaderboard */}
      <div className="card go-leaderboard animate-slide" style={{ animationDelay: '0.15s' }}>
        <h3 style={{ marginBottom: 16, textAlign: 'center' }}>🏅 Final Rankings</h3>
        <div className="stagger">
          {leaderboard.map((entry, i) => (
            <LeaderboardRow
              key={entry.id}
              rank={i + 1}
              player={entry}
              index={players.findIndex((p) => p.id === entry.id)}
              isMe={entry.id === myPlayerId}
              isWinner={i === 0}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="go-actions safe-bottom animate-fade" style={{ animationDelay: '0.3s' }}>
        {isHost ? (
          <button className="btn btn-coral btn-full btn-lg" onClick={playAgain}>
            🔄 Play Again!
          </button>
        ) : (
          <p className="text-muted text-center animate-pulse">
            ⏳ Waiting for host to restart...
          </p>
        )}
        <button
          className="btn btn-ghost btn-full"
          onClick={() => window.location.reload()}
        >
          🏠 Leave Room
        </button>
      </div>

      <style>{`
        .go-winner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        .go-trophy {
          font-size: 5rem;
          line-height: 1;
          animation: pulse 1.5s infinite;
          filter: drop-shadow(0 0 24px rgba(245,158,11,0.5));
        }
        .go-leaderboard {
          width: 100%;
          padding: 24px;
        }
        .lb-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: var(--radius);
          margin-bottom: 8px;
          background: var(--bg-input);
          transition: all var(--transition);
          position: relative;
          overflow: hidden;
        }
        .lb-row::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(124,58,237,0.06), transparent);
          pointer-events: none;
        }
        .lb-row.is-winner {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.3);
        }
        .lb-row.is-me {
          border: 1px solid var(--border-purple);
          background: rgba(124,58,237,0.1);
        }
        .lb-rank-badge {
          font-size: 1.4rem;
          width: 36px;
          text-align: center;
          flex-shrink: 0;
        }
        .lb-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .lb-name {
          flex: 1;
          font-weight: 700;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lb-pts {
          font-weight: 900;
          font-size: 1.1rem;
          color: var(--purple-light);
          flex-shrink: 0;
        }
        .lb-pts-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .go-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </div>
  );
}

function LeaderboardRow({ rank, player, index, isMe, isWinner }) {
  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  const gradient = getPlayerColor(index);
  const emoji = getPlayerEmoji(index);

  return (
    <div className={`lb-row ${isWinner ? 'is-winner' : ''} ${isMe ? 'is-me' : ''}`}>
      <div className="lb-rank-badge">{rankEmoji}</div>
      <div className="lb-avatar" style={{ background: gradient }}>
        {emoji}
      </div>
      <span className="lb-name">
        {player.name}{isMe ? ' (you)' : ''}
      </span>
      <div style={{ textAlign: 'right' }}>
        <div className="lb-pts">{player.pts}</div>
        <div className="lb-pts-label">pts</div>
      </div>
    </div>
  );
}
