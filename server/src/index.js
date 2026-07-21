import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import RoomManager from './rooms/RoomManager.js';
import { GameEngine } from './game/GameEngine.js';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Express + HTTP Server ─────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Health check endpoint (used by Render.com)
app.get('/health', (_, res) => res.json({ status: 'ok', rooms: RoomManager.rooms.size }));

const httpServer = createServer(app);

// ─── Socket.io ─────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

/** Map of roomCode → GameEngine instance */
const gameEngines = new Map();

/**
 * Returns a function that broadcasts to everyone in a room.
 * @param {string} roomCode
 */
function makeEmitter(roomCode) {
  return (event, payload) => {
    io.to(roomCode).emit(event, payload);
  };
}

/**
 * Broadcasts the current room state to all members.
 * @param {object} room
 */
function broadcastRoomUpdate(room) {
  io.to(room.code).emit('room_update', RoomManager.serializeRoom(room));
}

/**
 * Broadcasts an error to a single socket.
 */
function sendError(socket, message) {
  socket.emit('error', { message });
}

// ─── Socket Event Handlers ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // ── CREATE ROOM ──────────────────────────────────────────────────────────
  socket.on('create_room', ({ playerName, settings } = {}) => {
    if (!playerName?.trim()) return sendError(socket, 'Name is required.');

    const { room, player } = RoomManager.createRoom(socket.id, playerName, settings);
    socket.join(room.code);

    socket.emit('room_created', {
      roomCode: room.code,
      playerId: player.id,
      playerName: player.name,
      room: RoomManager.serializeRoom(room),
    });

    console.log(`🏠 Room created: ${room.code} by ${player.name}`);
  });

  // ── JOIN ROOM ────────────────────────────────────────────────────────────
  socket.on('join_room', ({ roomCode, playerName } = {}) => {
    if (!playerName?.trim()) return sendError(socket, 'Name is required.');
    if (!roomCode?.trim()) return sendError(socket, 'Room code is required.');

    const result = RoomManager.joinRoom(roomCode, socket.id, playerName);
    if (result.error) return sendError(socket, result.error);

    const { room, player } = result;
    socket.join(room.code);

    socket.emit('room_joined', {
      roomCode: room.code,
      playerId: player.id,
      playerName: player.name,
      room: RoomManager.serializeRoom(room),
    });

    broadcastRoomUpdate(room);
    console.log(`👤 ${player.name} joined room ${room.code}`);
  });

  // ── UPDATE SETTINGS (host only) ──────────────────────────────────────────
  socket.on('update_settings', ({ roomCode, settings } = {}) => {
    const result = RoomManager.updateSettings(roomCode, socket.id, settings);
    if (result.error) return sendError(socket, result.error);
    broadcastRoomUpdate(result.room);
  });

  // ── START GAME ───────────────────────────────────────────────────────────
  socket.on('start_game', ({ roomCode } = {}) => {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return sendError(socket, 'Room not found.');

    const host = room.players.find((p) => p.socketId === socket.id && p.isHost);
    if (!host) return sendError(socket, 'Only the host can start the game.');

    const connected = room.players.filter((p) => p.connected);
    if (connected.length < 2) return sendError(socket, 'Need at least 2 players to start.');

    // Destroy old engine if replaying
    if (gameEngines.has(roomCode)) {
      gameEngines.get(roomCode).destroy();
    }

    const engine = new GameEngine(room, makeEmitter(roomCode));
    gameEngines.set(roomCode, engine);

    io.to(roomCode).emit('game_started');
    engine.startGame();

    console.log(`🎮 Game started in room ${roomCode}`);
  });

  // ── SUBMIT QUESTION (player mode) ────────────────────────────────────────
  socket.on('submit_question', ({ roomCode, playerId, question } = {}) => {
    const engine = gameEngines.get(roomCode);
    if (!engine) return;
    if (!question?.trim()) return sendError(socket, 'Question cannot be empty.');
    engine.submitQuestion(playerId, question);
  });

  // ── SUBMIT ANSWER ────────────────────────────────────────────────────────
  socket.on('submit_answer', ({ roomCode, playerId, playerName, answer } = {}) => {
    const engine = gameEngines.get(roomCode);
    if (!engine) return;
    if (!answer?.trim()) return sendError(socket, 'Answer cannot be empty.');
    engine.submitAnswer(playerId, playerName, answer);
  });

  // ── SUBMIT VOTE ──────────────────────────────────────────────────────────
  socket.on('submit_vote', ({ roomCode, voterId, targetPlayerId } = {}) => {
    const engine = gameEngines.get(roomCode);
    if (!engine) return;
    engine.submitVote(voterId, targetPlayerId);
  });

  // ── NEXT ROUND ───────────────────────────────────────────────────────────
  socket.on('next_round', ({ roomCode } = {}) => {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return;
    const host = room.players.find((p) => p.socketId === socket.id && p.isHost);
    if (!host) return;

    const engine = gameEngines.get(roomCode);
    if (engine) engine.nextRound();
  });

  // ── KICK PLAYER ──────────────────────────────────────────────────────────
  socket.on('kick_player', ({ roomCode, targetPlayerId } = {}) => {
    const result = RoomManager.kickPlayer(roomCode, socket.id, targetPlayerId);
    if (result.error) return sendError(socket, result.error);

    const { room, kicked } = result;

    // Notify the kicked player
    const kickedSocket = io.sockets.sockets.get(kicked.socketId ?? '');
    if (kickedSocket) {
      kickedSocket.emit('kicked', { message: 'You have been removed from the room.' });
      kickedSocket.leave(roomCode);
    }

    broadcastRoomUpdate(room);
  });

  // ── PLAY AGAIN ────────────────────────────────────────────────────────────
  socket.on('play_again', ({ roomCode } = {}) => {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return;
    const host = room.players.find((p) => p.socketId === socket.id && p.isHost);
    if (!host) return;

    // Reset game state
    if (gameEngines.has(roomCode)) {
      gameEngines.get(roomCode).destroy();
      gameEngines.delete(roomCode);
    }
    room.gameState = null;
    io.to(roomCode).emit('returned_to_lobby');
    broadcastRoomUpdate(room);
  });

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);

    const result = RoomManager.handleDisconnect(socket.id);
    if (!result) return;

    const { room, player, code } = result;
    broadcastRoomUpdate(room);

    // Notify the game engine (may skip disconnected player in answering phase)
    const engine = gameEngines.get(code);
    if (engine) engine.handlePlayerDisconnect(player.id);

    console.log(`👤 ${player.name} disconnected from room ${code}`);
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 Roast Room server running on port ${PORT}`);
  console.log(`   CLIENT_URL: ${CLIENT_URL}`);
});
