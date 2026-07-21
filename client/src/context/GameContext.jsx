import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import { PHASES } from '../utils/constants';
import { playJoin, playRoundStart, playReveal, playVictory, playError } from '../utils/sounds';

// ─── Initial State ──────────────────────────────────────────────────────────
const initialState = {
  /** My identity in the current room */
  myPlayerId: null,
  myPlayerName: null,

  /** Room metadata */
  roomCode: null,
  room: null,       // { code, players, settings }

  /** Game state from server */
  gameState: null,  // { phase, round, totalRounds, question, answers, scores, timerValue, questionerId, questionerName }

  /** UI state */
  error: null,
  connected: false,
  hasSubmittedAnswer: false,
  hasSubmittedVote: false,
  hasSubmittedQuestion: false,

  /** Stored for reconnection */
  storedRoomCode: null,
  storedPlayerName: null,
};

// ─── Reducer ────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };

    case 'ROOM_CREATED':
    case 'ROOM_JOINED':
      return {
        ...state,
        myPlayerId: action.payload.playerId,
        myPlayerName: action.payload.playerName,
        roomCode: action.payload.roomCode,
        room: action.payload.room,
        error: null,
        storedRoomCode: action.payload.roomCode,
        storedPlayerName: action.payload.playerName,
      };

    case 'ROOM_UPDATE':
      return { ...state, room: action.payload };

    case 'GAME_STARTED':
      return {
        ...state,
        hasSubmittedAnswer: false,
        hasSubmittedVote: false,
        hasSubmittedQuestion: false,
      };

    case 'GAME_STATE':
      return {
        ...state,
        gameState: action.payload,
        // Reset submission flags on new round
        ...(action.payload.phase === PHASES.ANSWERING && !state.gameState?.phase?.startsWith('answer')
          ? { hasSubmittedAnswer: false }
          : {}),
        ...(action.payload.phase === PHASES.QUESTION_WRITING
          ? { hasSubmittedQuestion: false }
          : {}),
        ...(action.payload.phase === PHASES.RESULTS || action.payload.phase === PHASES.TALLY
          ? { hasSubmittedVote: false }
          : {}),
      };

    case 'TIMER_TICK':
      if (!state.gameState) return state;
      return {
        ...state,
        gameState: { ...state.gameState, timerValue: action.payload },
      };

    case 'SET_SUBMITTED_ANSWER':
      return { ...state, hasSubmittedAnswer: true };

    case 'SET_SUBMITTED_VOTE':
      return { ...state, hasSubmittedVote: true };

    case 'SET_SUBMITTED_QUESTION':
      return { ...state, hasSubmittedQuestion: true };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'RETURNED_TO_LOBBY':
      return {
        ...state,
        gameState: null,
        hasSubmittedAnswer: false,
        hasSubmittedVote: false,
        hasSubmittedQuestion: false,
      };

    case 'KICKED':
      return { ...initialState };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const socket = useSocket();
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Socket event listeners ─────────────────────────────────────────────

  useSocketEvent(socket, 'connect', () => {
    dispatch({ type: 'SET_CONNECTED', payload: true });
  });

  useSocketEvent(socket, 'disconnect', () => {
    dispatch({ type: 'SET_CONNECTED', payload: false });
  });

  useSocketEvent(socket, 'room_created', (data) => {
    dispatch({ type: 'ROOM_CREATED', payload: data });
  });

  useSocketEvent(socket, 'room_joined', (data) => {
    dispatch({ type: 'ROOM_JOINED', payload: data });
    playJoin();
  });

  useSocketEvent(socket, 'room_update', (room) => {
    dispatch({ type: 'ROOM_UPDATE', payload: room });
    playJoin();
  });

  useSocketEvent(socket, 'game_started', () => {
    dispatch({ type: 'GAME_STARTED' });
    playRoundStart();
  });

  useSocketEvent(socket, 'game_state', (gameState) => {
    const prevPhase = state.gameState?.phase;
    dispatch({ type: 'GAME_STATE', payload: gameState });

    // Play sounds on phase transitions
    if (gameState.phase === PHASES.ANSWERING && prevPhase !== PHASES.ANSWERING) {
      playRoundStart();
    }
    if ((gameState.phase === PHASES.RESULTS || gameState.phase === PHASES.TALLY) &&
        prevPhase !== PHASES.RESULTS && prevPhase !== PHASES.TALLY) {
      playReveal();
    }
    if (gameState.phase === PHASES.GAME_OVER) {
      playVictory();
    }
  });

  useSocketEvent(socket, 'timer_tick', ({ value }) => {
    dispatch({ type: 'TIMER_TICK', payload: value });
  });

  useSocketEvent(socket, 'error', ({ message }) => {
    dispatch({ type: 'SET_ERROR', payload: message });
    playError();
  });

  useSocketEvent(socket, 'kicked', () => {
    dispatch({ type: 'KICKED' });
  });

  useSocketEvent(socket, 'returned_to_lobby', () => {
    dispatch({ type: 'RETURNED_TO_LOBBY' });
  });

  // ── Actions ──────────────────────────────────────────────────────────────

  const createRoom = useCallback((playerName, settings) => {
    dispatch({ type: 'CLEAR_ERROR' });
    socket.emit('create_room', { playerName, settings });
  }, [socket]);

  const joinRoom = useCallback((roomCode, playerName) => {
    dispatch({ type: 'CLEAR_ERROR' });
    socket.emit('join_room', { roomCode: roomCode.toUpperCase(), playerName });
  }, [socket]);

  const updateSettings = useCallback((settings) => {
    socket.emit('update_settings', { roomCode: state.roomCode, settings });
  }, [socket, state.roomCode]);

  const startGame = useCallback(() => {
    socket.emit('start_game', { roomCode: state.roomCode });
  }, [socket, state.roomCode]);

  const submitQuestion = useCallback((question) => {
    socket.emit('submit_question', {
      roomCode: state.roomCode,
      playerId: state.myPlayerId,
      question,
    });
    dispatch({ type: 'SET_SUBMITTED_QUESTION' });
  }, [socket, state.roomCode, state.myPlayerId]);

  const submitAnswer = useCallback((answer) => {
    socket.emit('submit_answer', {
      roomCode: state.roomCode,
      playerId: state.myPlayerId,
      playerName: state.myPlayerName,
      answer,
    });
    dispatch({ type: 'SET_SUBMITTED_ANSWER' });
  }, [socket, state.roomCode, state.myPlayerId, state.myPlayerName]);

  const submitVote = useCallback((targetPlayerId) => {
    socket.emit('submit_vote', {
      roomCode: state.roomCode,
      voterId: state.myPlayerId,
      targetPlayerId,
    });
    dispatch({ type: 'SET_SUBMITTED_VOTE' });
  }, [socket, state.roomCode, state.myPlayerId]);

  const nextRound = useCallback(() => {
    socket.emit('next_round', { roomCode: state.roomCode });
  }, [socket, state.roomCode]);

  const kickPlayer = useCallback((targetPlayerId) => {
    socket.emit('kick_player', { roomCode: state.roomCode, targetPlayerId });
  }, [socket, state.roomCode]);

  const playAgain = useCallback(() => {
    socket.emit('play_again', { roomCode: state.roomCode });
  }, [socket, state.roomCode]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Derived helpers
  const me = state.room?.players?.find((p) => p.id === state.myPlayerId) ?? null;
  const isHost = me?.isHost ?? false;

  const value = {
    ...state,
    socket,
    me,
    isHost,
    // Actions
    createRoom,
    joinRoom,
    updateSettings,
    startGame,
    submitQuestion,
    submitAnswer,
    submitVote,
    nextRound,
    kickPlayer,
    playAgain,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/** Hook to consume game context */
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
