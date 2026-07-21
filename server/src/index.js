import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import RoomManager from './rooms/RoomManager.js';
import { GameEngine } from './game/GameEngine.js';

const PORT = process.env.PORT || 3001;

// 🔥 BURAYI SABİT VERDİK (HATA BURDAYDI)
const CLIENT_URL = "https://client-d290hxfzc-p0-p.vercel.app";

// ─── Express ─────────────────────────────────────────
const app = express();

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok', rooms: RoomManager.rooms.size });
});

const httpServer = createServer(app);

// ─── Socket.io ───────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─── GAME SYSTEM ─────────────────────────────────────
const gameEngines = new Map();

function makeEmitter(roomCode) {
  return (event, payload) => {
    io.to(roomCode).emit(event, payload);
  };
}

function broadcastRoomUpdate(room) {
  io.to(room.code).emit('room_update', RoomManager.serializeRoom(room));
}

function sendError(socket, message) {
  socket.emit('error', { message });
}

// ─── SOCKET EVENTS ───────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 ${socket.id} bağlandı`);

  socket.on('create_room', ({ playerName, settings } = {}) => {
    if (!playerName?.trim()) return sendError(socket, 'İsim gerekli');

    const { room, player } = RoomManager.createRoom(socket.id, playerName, settings);
    socket.join(room.code);

    socket.emit('room_created', {
      roomCode: room.code,
      playerId: player.id,
      playerName: player.name,
      room: RoomManager.serializeRoom(room),
    });
  });

  socket.on('join_room', ({ roomCode, playerName } = {}) => {
    if (!playerName?.trim()) return sendError(socket, 'İsim gerekli');

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
  });

  socket.on('start_game', ({ roomCode } = {}) => {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return;

    const engine = new GameEngine(room, makeEmitter(roomCode));
    gameEngines.set(roomCode, engine);

    io.to(roomCode).emit('game_started');
    engine.startGame();
  });

  socket.on('disconnect', () => {
    const result = RoomManager.handleDisconnect(socket.id);
    if (!result) return;

    const { room } = result;
    broadcastRoomUpdate(room);
  });
});

// ─── START ───────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: ${PORT}`);
});