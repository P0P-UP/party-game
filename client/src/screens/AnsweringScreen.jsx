import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import CountdownTimer from '../components/CountdownTimer';
import { playSubmit } from '../utils/sounds';

/**
 * AnsweringScreen — shows the question and accepts player answers.
 */
export default function AnsweringScreen() {
  const {
    gameState,
    room,
    myPlayerId,
    submitAnswer,
    hasSubmittedAnswer,
  } = useGame();

  const [answer, setAnswer] = useState('');

  const question = gameState?.question ?? '';
  const timer = gameState?.timerValue ?? 0;
  const answerTime = room?.settings?.answerTime ?? 30;
  const answeredCount = gameState?.answers?.length ?? 0;
  const totalPlayers = room?.players?.filter((p) => p.connected).length ?? 0;

  // Check if I have already answered (server-side confirmation)
  const myAnswerSubmitted = hasSubmittedAnswer ||
    (gameState?.answers ?? []).some((a) => a.playerId === myPlayerId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || myAnswerSubmitted) return;
    submitAnswer(answer.trim());
    playSubmit();
  };

  return (
    <div className="screen animate-fade">
      {/* Top bar: round + timer */}
      <div className="ans-topbar">
        <div>
          <div className="badge badge-purple">
            Round {gameState?.round} of {gameState?.totalRounds}
          </div>
          <p className="text-muted text-small" style={{ marginTop: 4 }}>
            {answeredCount}/{totalPlayers} answered
          </p>
        </div>
        <CountdownTimer value={timer} max={answerTime} size={90} warning={10} danger={5} />
      </div>

      {/* Progress bar */}
      <div className="ans-progress">
        <div
          className="ans-progress-fill"
          style={{ width: `${totalPlayers > 0 ? (answeredCount / totalPlayers) * 100 : 0}%` }}
        />
      </div>

      {/* Question card */}
      <div className="card card-glow ans-question-card animate-scale">
        <div className="ans-question-label">🔥 This Round's Question</div>
        <p className="ans-question-text">{question}</p>
      </div>

      {/* Answer input */}
      {myAnswerSubmitted ? (
        <div className="card ans-submitted animate-scale">
          <div className="submitted-icon">✅</div>
          <h3>Answer locked in!</h3>
          <p className="text-muted text-small text-center">
            Waiting for {totalPlayers - answeredCount} more player{totalPlayers - answeredCount !== 1 ? 's' : ''}...
          </p>
          <div className="ans-submitted-dots">
            <span /><span /><span />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="ans-form card animate-slide" style={{ animationDelay: '0.1s' }}>
          <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>
            Your anonymous answer
          </label>
          <textarea
            className="input"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            maxLength={500}
            rows={4}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
            <span className="text-muted text-small">{answer.length}/500</span>
            <span className="text-muted text-small">⏰ {timer}s</span>
          </div>
          <button
            className="btn btn-coral btn-full btn-lg"
            type="submit"
            disabled={!answer.trim()}
          >
            🔥 Submit Answer
          </button>
        </form>
      )}

      <style>{`
        .ans-topbar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ans-progress {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .ans-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--purple), var(--coral));
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        .ans-question-card {
          width: 100%;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ans-question-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--coral);
        }
        .ans-question-text {
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          font-weight: 700;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .ans-form {
          width: 100%;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-label {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .ans-submitted {
          width: 100%;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .submitted-icon {
          font-size: 3rem;
          line-height: 1;
        }

        .ans-submitted-dots {
          display: flex;
          gap: 8px;
        }
        .ans-submitted-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--green);
          animation: blink 1.2s ease infinite;
        }
        .ans-submitted-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ans-submitted-dots span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}
