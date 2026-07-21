import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import AnswerCard from '../components/AnswerCard';
import CountdownTimer from '../components/CountdownTimer';
import { PHASES } from '../utils/constants';

/**
 * ResultsScreen — shows all answers and allows voting.
 * After voting closes (or timer expires), shows tally with scores before next round.
 */
export default function ResultsScreen() {
  const {
    gameState,
    myPlayerId,
    isHost,
    submitVote,
    hasSubmittedVote,
    nextRound,
  } = useGame();

  const isTally = gameState?.phase === PHASES.TALLY;
  const answers = gameState?.answers ?? [];
  const question = gameState?.question ?? '';
  const scores = gameState?.scores ?? {};
  const timer = gameState?.timerValue ?? 0;

  // Sort answers by votes (descending) for tally view
  const sortedAnswers = [...answers].sort((a, b) => b.votes - a.votes);
  const maxVotes = sortedAnswers[0]?.votes ?? 0;

  return (
    <div className="screen animate-fade screen-wide">
      {/* Header */}
      <div className="res-header">
        <div>
          <span className="badge badge-coral">
            Round {gameState?.round} of {gameState?.totalRounds}
          </span>
          <h2 style={{ marginTop: 8 }}>
            {isTally ? '🏆 Results' : '🗳️ Vote for the best!'}
          </h2>
        </div>
        {!isTally && (
          <CountdownTimer value={timer} max={25} size={80} warning={10} danger={5} />
        )}
      </div>

      {/* The question */}
      <div className="card res-question animate-scale">
        <p className="res-question-label">The Question</p>
        <p className="res-question-text">{question}</p>
      </div>

      {/* Answers */}
      <div className="res-answers stagger">
        {sortedAnswers.map((answer, i) => (
          <AnswerCard
            key={answer.playerId}
            answer={answer}
            index={i}
            myPlayerId={myPlayerId}
            onVote={submitVote}
            hasVoted={hasSubmittedVote}
            isWinner={isTally && answer.votes === maxVotes && maxVotes > 0}
          />
        ))}
        {answers.length === 0 && (
          <div className="res-no-answers text-muted text-center">
            😶 Nobody submitted an answer this round.
          </div>
        )}
      </div>

      {/* Tally + Scoreboard */}
      {isTally && (
        <div className="card res-scoreboard animate-slide" style={{ animationDelay: '0.2s' }}>
          <h3 style={{ marginBottom: 16 }}>📊 Scoreboard</h3>
          <div className="score-list">
            {Object.entries(scores)
              .map(([id, pts]) => {
                const player = gameState?.answers?.find((a) => a.playerId === id)
                  ?? null;
                return { id, pts, name: player?.playerName ?? '?' };
              })
              .sort((a, b) => b.pts - a.pts)
              .map((entry, i) => (
                <ScoreRow
                  key={entry.id}
                  rank={i + 1}
                  name={entry.name}
                  pts={entry.pts}
                  isMe={entry.id === myPlayerId}
                />
              ))}
          </div>
        </div>
      )}

      {/* Next Round / waiting */}
      {isTally && (
        <div className="res-next safe-bottom">
          {isHost ? (
            <button className="btn btn-primary btn-full btn-lg" onClick={nextRound}>
              {gameState?.round < gameState?.totalRounds
                ? '➡️ Next Round'
                : '🏁 See Final Results'}
            </button>
          ) : (
            <p className="text-muted text-center animate-pulse">
              ⏳ Waiting for host to continue...
            </p>
          )}
        </div>
      )}

      {/* Voting wait message */}
      {!isTally && hasSubmittedVote && (
        <p className="text-muted text-center text-small animate-pulse">
          ✅ Vote locked in! Waiting for others...
        </p>
      )}

      <style>{`
        .res-header {
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .res-question {
          width: 100%;
          padding: 20px;
        }
        .res-question-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--coral);
          margin-bottom: 8px;
        }
        .res-question-text {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          font-weight: 700;
          line-height: 1.4;
        }
        .res-answers {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .res-no-answers {
          padding: 32px;
        }
        .res-scoreboard {
          width: 100%;
          padding: 20px;
        }
        .score-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .score-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: var(--bg-input);
        }
        .score-row.is-me {
          background: rgba(124,58,237,0.12);
          border: 1px solid var(--border-purple);
        }
        .score-rank {
          font-weight: 800;
          font-size: 0.95rem;
          width: 28px;
          text-align: center;
          color: var(--text-secondary);
        }
        .score-rank.top { color: var(--yellow); }
        .score-name {
          flex: 1;
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .score-pts {
          font-weight: 800;
          font-size: 1rem;
          color: var(--purple-light);
        }
        .res-next { width: 100%; }
      `}</style>
    </div>
  );
}

function ScoreRow({ rank, name, pts, isMe }) {
  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
  return (
    <div className={`score-row ${isMe ? 'is-me' : ''}`}>
      <span className={`score-rank ${rank <= 3 ? 'top' : ''}`}>{rankEmoji}</span>
      <span className="score-name">{name}{isMe ? ' (you)' : ''}</span>
      <span className="score-pts">{pts} pts</span>
    </div>
  );
}
