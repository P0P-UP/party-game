import React from 'react';
import { useGame } from './context/GameContext';
import { PHASES } from './utils/constants';
import Toast from './components/Toast';

// Screens
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import QuestionWritingScreen from './screens/QuestionWritingScreen';
import AnsweringScreen from './screens/AnsweringScreen';
import ResultsScreen from './screens/ResultsScreen';
import GameOverScreen from './screens/GameOverScreen';

/**
 * App — top-level router based on game phase.
 * No external router library needed — the game is a single-session SPA.
 */
function AppInner() {
  const { roomCode, gameState, error, clearError, socket } = useGame();

  const phase = gameState?.phase ?? null;

  // ── Determine which screen to render ──────────────────────────────────
  const renderScreen = () => {
    // No room → home
    if (!roomCode) return <HomeScreen />;

    // In a room but game not started (or returned to lobby)
    if (!gameState || phase === PHASES.LOBBY) return <LobbyScreen />;

    // Game is running
    switch (phase) {
      case PHASES.QUESTION_WRITING: return <QuestionWritingScreen />;
      case PHASES.ANSWERING:        return <AnsweringScreen />;
      case PHASES.RESULTS:
      case PHASES.TALLY:            return <ResultsScreen />;
      case PHASES.GAME_OVER:        return <GameOverScreen />;
      default:                      return <LobbyScreen />;
    }
  };

  return (
    <>
      {/* Ambient background mesh */}
      <div className="app-bg" aria-hidden="true" />

      <main className="app-content">
        {/* Connection warning */}
        {socket && !socket.connected && (
          <div className="connection-banner">
            🔄 Reconnecting...
          </div>
        )}

        {/* Routed screen */}
        {renderScreen()}
      </main>

      {/* Global error toast */}
      {error && (
        <Toast message={error} type="error" onDismiss={clearError} />
      )}

      <style>{`
        .connection-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9998;
          background: rgba(245,158,11,0.15);
          border-bottom: 1px solid rgba(245,158,11,0.3);
          color: var(--yellow);
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 8px;
          backdrop-filter: blur(10px);
          animation: blink 1.5s ease infinite;
        }
      `}</style>
    </>
  );
}

export default function App() {
  return <AppInner />;
}
