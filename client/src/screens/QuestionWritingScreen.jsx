import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import CountdownTimer from '../components/CountdownTimer';

/**
 * QuestionWritingScreen — shown to the active player when mode='player'.
 * Other players see a waiting state.
 */
export default function QuestionWritingScreen() {
  const {
    gameState,
    myPlayerId,
    submitQuestion,
    hasSubmittedQuestion,
    room,
  } = useGame();

  const [question, setQuestion] = useState('');
  const isQuestioner = gameState?.questionerId === myPlayerId;
  const questionerName = gameState?.questionerName ?? 'Someone';
  const timer = gameState?.timerValue ?? 0;
  const answerTime = room?.settings?.questionTime ?? 45;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim().length < 5) return;
    submitQuestion(question.trim());
  };

  return (
    <div className="screen" style={{ justifyContent: 'center', minHeight: '100dvh' }}>
      {/* Round badge */}
      <div className="animate-fade">
        <span className="badge badge-purple">
          Round {gameState?.round} of {gameState?.totalRounds}
        </span>
      </div>

      {/* Timer */}
      <CountdownTimer value={timer} max={answerTime} size={110} warning={15} danger={5} />

      {isQuestioner ? (
        /* ── Active questioner ── */
        <div className="card card-glow qw-card animate-scale">
          <div className="qw-crown">✍️</div>
          <h2 className="text-center">Your turn to ask!</h2>
          <p className="text-muted text-center text-small">
            Write a spicy question for everyone to answer. Keep it fun!
          </p>

          <form onSubmit={handleSubmit} className="qw-form">
            <textarea
              className="input"
              placeholder="Who in this group would..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={300}
              rows={3}
              autoFocus
              disabled={hasSubmittedQuestion}
            />
            <div className="qw-meta">
              <span className="text-muted text-small">{question.length}/300</span>
              <span className="text-muted text-small">{timer}s left</span>
            </div>
            <button
              className="btn btn-coral btn-full"
              type="submit"
              disabled={question.trim().length < 5 || hasSubmittedQuestion}
            >
              {hasSubmittedQuestion ? '✅ Question sent!' : '🔥 Submit Question'}
            </button>
          </form>
        </div>
      ) : (
        /* ── Waiting players ── */
        <div className="card qw-card animate-scale">
          <div className="qw-waiting-icon animate-pulse">🤔</div>
          <h2 className="text-center">{questionerName} is writing...</h2>
          <p className="text-muted text-center">
            Get ready to answer something spicy!
          </p>
          <div className="qw-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      <style>{`
        .qw-card {
          width: 100%;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        .qw-crown {
          font-size: 2.5rem;
          line-height: 1;
        }
        .qw-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .qw-meta {
          display: flex;
          justify-content: space-between;
          padding: 0 4px;
        }
        .qw-waiting-icon {
          font-size: 3.5rem;
          line-height: 1;
        }
        .qw-dots {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .qw-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--purple);
          animation: blink 1.2s ease infinite;
        }
        .qw-dots span:nth-child(2) { animation-delay: 0.2s; }
        .qw-dots span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}
