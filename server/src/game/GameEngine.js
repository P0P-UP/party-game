import { getRandomQuestion } from '../questions/questions.js';

/**
 * GameEngine — server-authoritative game state machine.
 *
 * Phases: lobby → question_writing (player mode) → answering → results → [loop | game_over]
 *
 * The engine emits events via the provided `emit` callback, keeping
 * all business logic out of the socket handler.
 */
export class GameEngine {
  /**
   * @param {object} room - The room object from RoomManager
   * @param {function} emit - Callback(eventName, payload) to broadcast to the room
   */
  constructor(room, emit) {
    this.room = room;
    this.emit = emit;
    this.state = this._freshState();
    this._timer = null;
  }

  // ─── State Helpers ────────────────────────────────────────────────────────

  _freshState() {
    return {
      phase: 'lobby',
      round: 0,
      totalRounds: this.room.settings.totalRounds || 5,
      questionerIndex: 0,       // cycles through players in player mode
      question: '',
      answers: [],              // [{ playerId, playerName, text, votes }]
      scores: this._buildScores(),
      usedQuestions: [],
      votedPlayerIds: [],       // which players have already voted this round
      timerValue: 0,
    };
  }

  _buildScores() {
    const scores = {};
    for (const p of this.room.players) {
      scores[p.id] = 0;
    }
    return scores;
  }

  _serializeState() {
    return {
      phase: this.state.phase,
      round: this.state.round,
      totalRounds: this.state.totalRounds,
      question: this.state.question,
      answers: this.state.answers,
      scores: this.state.scores,
      timerValue: this.state.timerValue,
      questionerId: this._getCurrentQuestioner()?.id ?? null,
      questionerName: this._getCurrentQuestioner()?.name ?? null,
    };
  }

  _getCurrentQuestioner() {
    const connected = this._connectedPlayers();
    if (!connected.length) return null;
    return connected[this.state.questionerIndex % connected.length];
  }

  _connectedPlayers() {
    return this.room.players.filter((p) => p.connected);
  }

  _broadcast() {
    this.emit('game_state', this._serializeState());
  }

  // ─── Timer ────────────────────────────────────────────────────────────────

  _startTimer(seconds, onExpire) {
    this._clearTimer();
    this.state.timerValue = seconds;
    this._broadcast(); // emit initial value

    this._timer = setInterval(() => {
      this.state.timerValue--;
      this.emit('timer_tick', { value: this.state.timerValue });

      if (this.state.timerValue <= 0) {
        this._clearTimer();
        onExpire();
      }
    }, 1000);
  }

  _clearTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  // ─── Game Flow ─────────────────────────────────────────────────────────────

  /**
   * Start the game from the lobby. Called by host.
   */
  startGame() {
    // Ensure scores include all current players
    this.state.scores = this._buildScores();
    this.state.totalRounds = this.room.settings.totalRounds || 5;
    this._startRound();
  }

  _startRound() {
    this.state.round++;
    this.state.answers = [];
    this.state.votedPlayerIds = [];

    if (this.state.round > this.state.totalRounds) {
      return this._endGame();
    }

    const { mode } = this.room.settings;

    if (mode === 'player') {
      this._startQuestionWriting();
    } else {
      // Auto mode: pick question immediately
      this.state.question = getRandomQuestion(this.state.usedQuestions);
      this.state.usedQuestions.push(this.state.question);
      this._startAnswering();
    }
  }

  _startQuestionWriting() {
    this.state.phase = 'question_writing';
    this._broadcast();
    this._startTimer(this.room.settings.questionTime || 45, () => {
      // Time ran out — pick auto question as fallback
      if (!this.state.question) {
        this.state.question = getRandomQuestion(this.state.usedQuestions);
        this.state.usedQuestions.push(this.state.question);
      }
      this._startAnswering();
    });
  }

  /**
   * Host player submits the question for this round.
   * @param {string} playerId
   * @param {string} questionText
   */
  submitQuestion(playerId, questionText) {
    if (this.state.phase !== 'question_writing') return;
    const questioner = this._getCurrentQuestioner();
    if (!questioner || questioner.id !== playerId) return;

    this._clearTimer();
    this.state.question = questionText.trim().slice(0, 300);
    this.state.usedQuestions.push(this.state.question);
    this._startAnswering();
  }

  _startAnswering() {
    this.state.phase = 'answering';
    this._broadcast();
    this._startTimer(this.room.settings.answerTime || 30, () => {
      this._startResults();
    });
  }

  /**
   * Player submits an answer.
   * @param {string} playerId
   * @param {string} playerName
   * @param {string} text
   */
  submitAnswer(playerId, playerName, text) {
    if (this.state.phase !== 'answering') return;

    // Prevent duplicate answers
    const already = this.state.answers.find((a) => a.playerId === playerId);
    if (already) return;

    this.state.answers.push({
      playerId,
      playerName,
      text: text.trim().slice(0, 500),
      votes: 0,
    });

    this._broadcast();

    // If everyone has answered, advance immediately
    const connected = this._connectedPlayers();
    if (this.state.answers.length >= connected.length) {
      this._clearTimer();
      this._startResults();
    }
  }

  _startResults() {
    this.state.phase = 'results';
    this.state.timerValue = 0;
    this._broadcast();
    // Voting period — 25 seconds, then auto-advance
    this._startTimer(25, () => {
      this._tallyVotesAndAdvance();
    });
  }

  /**
   * Player submits a vote for their favourite answer.
   * @param {string} voterId - Who is voting
   * @param {string} targetPlayerId - Whose answer they're voting for
   */
  submitVote(voterId, targetPlayerId) {
    if (this.state.phase !== 'results') return;
    if (this.state.votedPlayerIds.includes(voterId)) return; // already voted
    if (voterId === targetPlayerId) return; // can't vote for yourself

    const answer = this.state.answers.find((a) => a.playerId === targetPlayerId);
    if (!answer) return;

    answer.votes++;
    this.state.votedPlayerIds.push(voterId);
    this._broadcast();

    // If everyone voted, tally immediately
    const connected = this._connectedPlayers();
    const eligibleVoters = connected.filter((p) =>
      this.state.answers.some((a) => a.playerId !== p.id) // has someone to vote for
    );
    if (this.state.votedPlayerIds.length >= eligibleVoters.length) {
      this._clearTimer();
      this._tallyVotesAndAdvance();
    }
  }

  _tallyVotesAndAdvance() {
    // Award points: winner +3, runner-up +1
    const sorted = [...this.state.answers].sort((a, b) => b.votes - a.votes);
    if (sorted.length > 0 && sorted[0].votes > 0) {
      const winner = sorted[0];
      this.state.scores[winner.playerId] = (this.state.scores[winner.playerId] || 0) + 3;
      if (sorted.length > 1 && sorted[1].votes > 0) {
        const runnerUp = sorted[1];
        this.state.scores[runnerUp.playerId] = (this.state.scores[runnerUp.playerId] || 0) + 1;
      }
    }

    // Advance questioner index for player mode
    this.state.questionerIndex++;
    this.state.phase = 'tally';
    this._broadcast();
  }

  /**
   * Host requests the next round after seeing results.
   */
  nextRound() {
    if (this.state.phase !== 'tally' && this.state.phase !== 'results') return;
    this._clearTimer();
    this._startRound();
  }

  _endGame() {
    this._clearTimer();
    this.state.phase = 'game_over';
    this._broadcast();
  }

  /**
   * Handle a player disconnecting mid-game.
   * @param {string} playerId
   */
  handlePlayerDisconnect(playerId) {
    // If it was their turn to answer and they hadn't, skip them
    if (this.state.phase === 'answering') {
      const connected = this._connectedPlayers();
      if (this.state.answers.length >= connected.length) {
        this._clearTimer();
        this._startResults();
      }
    }
    // Rebroadcast updated state
    this._broadcast();
  }

  /** Clean up timers on room destruction */
  destroy() {
    this._clearTimer();
  }
}
