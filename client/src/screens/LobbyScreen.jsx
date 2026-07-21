import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import PlayerCard from '../components/PlayerCard';
import RoomCode from '../components/RoomCode';
import ShareButton from '../components/ShareButton';
import SettingsPanel from '../components/SettingsPanel';
import { MIN_PLAYERS } from '../utils/constants';
import { setSoundEnabled, getSoundEnabled } from '../utils/sounds';

/**
 * LobbyScreen — waiting room before game starts.
 * Host sees settings + start button. All players see live player list.
 */
export default function LobbyScreen() {
  const {
    room,
    roomCode,
    myPlayerId,
    isHost,
    startGame,
    kickPlayer,
    updateSettings,
  } = useGame();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(getSoundEnabled());

  const players = room?.players ?? [];
  const connected = players.filter((p) => p.connected);
  const canStart = isHost && connected.length >= MIN_PLAYERS;

  const handleSettingsChange = (newSettings) => {
    updateSettings(newSettings);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  return (
    <div className="screen animate-fade">
      {/* Header */}
      <div className="lobby-header">
        <div>
          <h2>Lobby</h2>
          <p className="text-muted text-small">
            {connected.length}/{room?.settings?.maxPlayers ?? 8} players •{' '}
            {connected.length < MIN_PLAYERS
              ? `Need ${MIN_PLAYERS - connected.length} more`
              : 'Ready to play!'}
          </p>
        </div>
        <div className="lobby-header-actions">
          {/* Sound toggle */}
          <button className="icon-btn" onClick={toggleSound} title="Toggle sound">
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Room Code + Share */}
      <RoomCode code={roomCode} />
      <ShareButton roomCode={roomCode} />

      {/* Players list */}
      <div className="lobby-section w-full">
        <div className="section-label">
          👥 Players ({connected.length})
        </div>
        <div className="player-list stagger">
          {players.map((player, i) => (
            <PlayerCard
              key={player.id}
              player={player}
              index={i}
              isHost={isHost}
              showKick={isHost && player.id !== myPlayerId}
              onKick={kickPlayer}
            />
          ))}
        </div>
      </div>

      {/* Settings (host only) */}
      {isHost && (
        <div className="w-full">
          <button
            className="btn btn-ghost btn-full"
            onClick={() => setSettingsOpen((o) => !o)}
            style={{ marginBottom: 12 }}
          >
            {settingsOpen ? '▲ Hide Settings' : '⚙️ Game Settings'}
          </button>
          {settingsOpen && (
            <SettingsPanel
              settings={room?.settings}
              onChange={handleSettingsChange}
              disabled={false}
            />
          )}
        </div>
      )}

      {/* Non-host: show settings read-only */}
      {!isHost && room?.settings && (
        <div className="card lobby-settings-view">
          <div className="settings-grid">
            <SettingChip label="Mode" value={room.settings.mode === 'auto' ? '🎲 Auto' : '✍️ Player'} />
            <SettingChip label="Rounds" value={room.settings.totalRounds} />
            <SettingChip label="Answer Time" value={`${room.settings.answerTime}s`} />
            <SettingChip label="Players" value={`Max ${room.settings.maxPlayers}`} />
          </div>
        </div>
      )}

      {/* Start button */}
      {isHost ? (
        <button
          className="btn btn-coral btn-full btn-lg safe-bottom"
          onClick={startGame}
          disabled={!canStart}
          style={{ marginTop: 'auto' }}
        >
          {canStart ? '🚀 Start Game!' : `Waiting for players (${MIN_PLAYERS - connected.length} more)`}
        </button>
      ) : (
        <div className="waiting-message animate-pulse safe-bottom" style={{ marginTop: 'auto' }}>
          ⏳ Waiting for host to start...
        </div>
      )}

      <style>{`
        .lobby-header {
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .lobby-header-actions {
          display: flex;
          gap: 8px;
        }
        .icon-btn {
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          font-size: 1.1rem;
          color: var(--text-primary);
          transition: all var(--transition);
          font-family: var(--font);
          cursor: pointer;
        }
        .icon-btn:hover { background: var(--bg-hover); }

        .lobby-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .section-label {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 0 4px;
        }
        .player-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lobby-settings-view {
          padding: 16px;
          width: 100%;
        }
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .setting-chip {
          background: var(--bg-input);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .chip-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .chip-value { font-size: 0.95rem; font-weight: 700; }

        .waiting-message {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.95rem;
          padding: 16px;
        }
      `}</style>
    </div>
  );
}

function SettingChip({ label, value }) {
  return (
    <div className="setting-chip">
      <span className="chip-label">{label}</span>
      <span className="chip-value">{value}</span>
    </div>
  );
}
