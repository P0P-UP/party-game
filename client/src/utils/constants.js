/** Shared constants between all client modules */

export const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/** Game phases that match the server's state machine */
export const PHASES = {
  LOBBY: 'lobby',
  QUESTION_WRITING: 'question_writing',
  ANSWERING: 'answering',
  RESULTS: 'results',
  TALLY: 'tally',
  GAME_OVER: 'game_over',
};

/** Gradient colours used for player avatars */
export const PLAYER_COLORS = [
  'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'linear-gradient(135deg, #f97316, #ef4444)',
  'linear-gradient(135deg, #06b6d4, #0284c7)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ec4899, #be185d)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #14b8a6, #0f766e)',
  'linear-gradient(135deg, #f43f5e, #e11d48)',
  'linear-gradient(135deg, #a3e635, #65a30d)',
  'linear-gradient(135deg, #fb923c, #c2410c)',
  'linear-gradient(135deg, #60a5fa, #2563eb)',
];

/** Emoji avatars assigned to players in order */
export const PLAYER_EMOJIS = ['🦊', '🐼', '🦋', '🦁', '🐉', '🦄', '🐸', '🤖', '👻', '🦈', '🐺', '🦉'];

/** Returns a deterministic color gradient based on player index */
export const getPlayerColor = (index) => PLAYER_COLORS[index % PLAYER_COLORS.length];

/** Returns a deterministic emoji based on player index */
export const getPlayerEmoji = (index) => PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];

/** Minimum players to start */
export const MIN_PLAYERS = 2;
