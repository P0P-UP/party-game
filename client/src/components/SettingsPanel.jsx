import React from 'react';

/**
 * SettingsPanel — host room configuration before starting the game.
 * @param {{ settings, onChange, disabled }}
 */
export default function SettingsPanel({ settings, onChange, disabled }) {
  const update = (key, value) => onChange?.({ ...settings, [key]: value });

  return (
    <div className="settings-panel card">
      <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>⚙️ Game Settings</h3>

      {/* Mode */}
      <SettingRow label="Question Mode" hint={
        settings.mode === 'auto'
          ? 'System picks a question each round'
          : 'Each player writes a question'
      }>
        <div className="toggle-group">
          <button
            className={`toggle-opt ${settings.mode === 'auto' ? 'active' : ''}`}
            onClick={() => update('mode', 'auto')}
            disabled={disabled}
          >
            🎲 Auto
          </button>
          <button
            className={`toggle-opt ${settings.mode === 'player' ? 'active' : ''}`}
            onClick={() => update('mode', 'player')}
            disabled={disabled}
          >
            ✍️ Player
          </button>
        </div>
      </SettingRow>

      {/* Rounds */}
      <SettingRow label={`Rounds: ${settings.totalRounds}`} hint="Questions per game">
        <input
          type="range"
          min={3} max={10} step={1}
          value={settings.totalRounds}
          onChange={(e) => update('totalRounds', Number(e.target.value))}
          disabled={disabled}
          className="slider"
        />
      </SettingRow>

      {/* Answer Time */}
      <SettingRow label={`Answer Time: ${settings.answerTime}s`} hint="Seconds to submit an answer">
        <input
          type="range"
          min={15} max={120} step={5}
          value={settings.answerTime}
          onChange={(e) => update('answerTime', Number(e.target.value))}
          disabled={disabled}
          className="slider"
        />
      </SettingRow>

      {/* Question Time (player mode only) */}
      {settings.mode === 'player' && (
        <SettingRow label={`Write Time: ${settings.questionTime}s`} hint="Seconds to write a question">
          <input
            type="range"
            min={15} max={90} step={5}
            value={settings.questionTime}
            onChange={(e) => update('questionTime', Number(e.target.value))}
            disabled={disabled}
            className="slider"
          />
        </SettingRow>
      )}

      {/* Max Players */}
      <SettingRow label={`Max Players: ${settings.maxPlayers}`} hint="Lobby capacity">
        <input
          type="range"
          min={3} max={12} step={1}
          value={settings.maxPlayers}
          onChange={(e) => update('maxPlayers', Number(e.target.value))}
          disabled={disabled}
          className="slider"
        />
      </SettingRow>

      <style>{`
        .settings-panel {
          padding: 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .setting-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .setting-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .setting-label {
          font-weight: 700;
          font-size: 0.9rem;
        }
        .setting-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          -webkit-appearance: none;
          background: linear-gradient(
            to right,
            var(--purple) 0%,
            var(--purple) calc(var(--val) * 1%),
            rgba(255,255,255,0.1) calc(var(--val) * 1%)
          );
          cursor: pointer;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform var(--transition);
        }
        .slider::-webkit-slider-thumb:active { transform: scale(1.2); }
        .slider:disabled { opacity: 0.4; cursor: default; }

        .toggle-group {
          display: flex;
          gap: 8px;
        }
        .toggle-opt {
          flex: 1;
          padding: 10px;
          border-radius: var(--radius);
          font-size: 0.9rem;
          font-weight: 600;
          background: var(--bg-input);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          transition: all var(--transition);
          font-family: var(--font);
          cursor: pointer;
        }
        .toggle-opt.active {
          background: rgba(124,58,237,0.2);
          color: var(--purple-light);
          border-color: var(--border-purple);
        }
        .toggle-opt:disabled { opacity: 0.4; cursor: default; }
      `}</style>
    </div>
  );
}

function SettingRow({ label, hint, children }) {
  return (
    <div className="setting-row">
      <div className="setting-header">
        <span className="setting-label">{label}</span>
        <span className="setting-hint">{hint}</span>
      </div>
      {children}
    </div>
  );
}
