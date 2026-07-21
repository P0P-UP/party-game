import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

/**
 * HomeScreen — landing page.
 * Handles Create / Join flow, name entry, and URL-based auto-join (via ?join=CODE).
 */
export default function HomeScreen() {
  const { createRoom, joinRoom, error, clearError } = useGame();

  const [tab, setTab] = useState('create'); // 'create' | 'join'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill join code from URL param (?join=ABCD)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setCode(joinCode.toUpperCase());
      setTab('join');
    }
  }, []);

  // Clear loading on error
  useEffect(() => {
    if (error) setLoading(false);
  }, [error]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    clearError();
    createRoom(name.trim(), {
      mode: 'auto',
      answerTime: 30,
      questionTime: 45,
      maxPlayers: 8,
      totalRounds: 5,
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    clearError();
    joinRoom(code.trim().toUpperCase(), name.trim());
  };

  return (
    <div className="screen" style={{ justifyContent: 'center', minHeight: '100dvh' }}>
      {/* Logo */}
      <div className="home-logo animate-scale">
        <div className="home-logo-icon">🔥</div>
        <h1 className="gradient-text" style={{ lineHeight: 1 }}>
          Roast Room
        </h1>
        <p className="text-muted text-center" style={{ fontSize: '1rem', marginTop: 6 }}>
          The anonymous party game that reveals everything.
        </p>
      </div>

      {/* Card */}
      <div className="card card-glow home-card animate-slide" style={{ animationDelay: '0.1s' }}>
        {/* Tabs */}
        <div className="home-tabs">
          <button
            className={`home-tab ${tab === 'create' ? 'active' : ''}`}
            onClick={() => { setTab('create'); clearError(); }}
          >
            🏠 Create Room
          </button>
          <button
            className={`home-tab ${tab === 'join' ? 'active' : ''}`}
            onClick={() => { setTab('join'); clearError(); }}
          >
            🚪 Join Room
          </button>
        </div>

        {/* Form */}
        <form onSubmit={tab === 'create' ? handleCreate : handleJoin} className="home-form">
          <div>
            <label className="form-label">Your Name</label>
            <input
              className="input"
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoComplete="off"
              autoFocus
            />
          </div>

          {tab === 'join' && (
            <div className="animate-fade">
              <label className="form-label">Room Code</label>
              <input
                className="input"
                style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '1.4rem', textAlign: 'center', fontWeight: 800 }}
                type="text"
                placeholder="ABCD"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
                maxLength={4}
                autoComplete="off"
              />
            </div>
          )}

          {error && (
            <div className="home-error animate-fade">
              ❌ {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-lg"
            type="submit"
            disabled={loading || !name.trim() || (tab === 'join' && code.length < 4)}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Loading...</>
            ) : tab === 'create' ? (
              '🔥 Create Room'
            ) : (
              '🚀 Join Room'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-muted text-small text-center animate-fade" style={{ animationDelay: '0.3s' }}>
        No account needed · Works on any device · 3–12 players
      </p>

      <style>{`
        .home-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        .home-logo-icon {
          font-size: 4rem;
          line-height: 1;
          filter: drop-shadow(0 0 24px rgba(249,115,22,0.6));
          animation: pulse 2s infinite;
        }

        .home-card {
          padding: 28px 24px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .home-tabs {
          display: flex;
          gap: 6px;
          background: var(--bg-input);
          padding: 5px;
          border-radius: var(--radius);
        }
        .home-tab {
          flex: 1;
          padding: 10px;
          border-radius: calc(var(--radius) - 4px);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: none;
          transition: all var(--transition);
          font-family: var(--font);
        }
        .home-tab.active {
          background: var(--bg-card-solid);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .home-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .home-error {
          padding: 12px 14px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: var(--radius);
          color: #fca5a5;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
