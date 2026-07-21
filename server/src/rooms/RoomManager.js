import { v4 as uuidv4 } from 'uuid';

/** How long (ms) an inactive room persists before auto-cleanup */
const ROOM_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Generates a random 4-letter uppercase room code.
 * @returns {string}
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // remove ambiguous chars I, O
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * RoomManager — manages all active rooms in memory.
 * Handles player joins/leaves, host transfers, and room expiry.
 */
class RoomManager {
  constructor() {
    /** @type {Map<string, Room>} */
    this.rooms = new Map();

    // Cleanup expired rooms every 30 minutes
    setInterval(() => this._cleanupExpiredRooms(), 30 * 60 * 1000);
  }

  /**
   * Creates a new room and adds the host as the first player.
   * @param {string} hostSocketId
   * @param {string} hostName
   * @param {object} settings
   * @returns {{ room: Room, player: Player }}
   */
  createRoom(hostSocketId, hostName, settings = {}) {
    // Generate unique code
    let code;
    do {
      code = generateRoomCode();
    } while (this.rooms.has(code));

    const hostPlayer = {
      id: uuidv4(),
      socketId: hostSocketId,
      name: hostName.trim().slice(0, 20),
      isHost: true,
      connected: true,
      joinedAt: Date.now(),
    };

    const defaultSettings = {
      mode: 'auto',         // 'auto' | 'player'
      answerTime: 30,       // seconds players have to answer
      questionTime: 45,     // seconds host player has to write a question
      maxPlayers: 8,
      totalRounds: 5,
    };

    const room = {
      code,
      players: [hostPlayer],
      settings: { ...defaultSettings, ...settings },
      gameState: null,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.rooms.set(code, room);
    return { room, player: hostPlayer };
  }

  /**
   * Adds a player to an existing room.
   * @param {string} code - Room code
   * @param {string} socketId
   * @param {string} name
   * @returns {{ room: Room, player: Player } | { error: string }}
   */
  joinRoom(code, socketId, name) {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return { error: 'Room not found. Check the code and try again.' };
    if (room.gameState && room.gameState.phase !== 'lobby') {
      return { error: 'Game already in progress. Wait for the next game.' };
    }
    if (room.players.length >= room.settings.maxPlayers) {
      return { error: `Room is full (max ${room.settings.maxPlayers} players).` };
    }

    // Prevent duplicate names
    const trimmedName = name.trim().slice(0, 20);
    const nameExists = room.players.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase() && p.connected
    );
    if (nameExists) return { error: 'Name already taken. Choose a different name.' };

    const player = {
      id: uuidv4(),
      socketId,
      name: trimmedName,
      isHost: false,
      connected: true,
      joinedAt: Date.now(),
    };

    room.players.push(player);
    room.lastActivity = Date.now();
    return { room, player };
  }

  /**
   * Marks a player as disconnected. Transfers host if needed.
   * @param {string} socketId
   * @returns {{ room: Room, player: Player, wasHost: boolean } | null}
   */
  handleDisconnect(socketId) {
    for (const [code, room] of this.rooms) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (!player) continue;

      player.connected = false;
      room.lastActivity = Date.now();
      const wasHost = player.isHost;

      // Transfer host to next connected player
      if (wasHost) {
        const nextHost = room.players.find((p) => p.connected && p.id !== player.id);
        if (nextHost) {
          player.isHost = false;
          nextHost.isHost = true;
        }
      }

      // If nobody is left, mark room for fast cleanup
      const anyConnected = room.players.some((p) => p.connected);
      if (!anyConnected) {
        room.lastActivity = Date.now() - ROOM_TTL_MS + 60_000; // expire in 1 min
      }

      return { room, player, wasHost, code };
    }
    return null;
  }

  /**
   * Reconnects a player by matching name + room code.
   * @param {string} code
   * @param {string} playerName
   * @param {string} newSocketId
   * @returns {{ room: Room, player: Player } | null}
   */
  reconnectPlayer(code, playerName, newSocketId) {
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase() && !p.connected
    );
    if (!player) return null;

    player.socketId = newSocketId;
    player.connected = true;
    room.lastActivity = Date.now();
    return { room, player };
  }

  /**
   * Kicks a player from the room. Only callable by host.
   * @param {string} code
   * @param {string} hostSocketId
   * @param {string} targetPlayerId
   * @returns {{ room: Room, kicked: Player } | { error: string }}
   */
  kickPlayer(code, hostSocketId, targetPlayerId) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found.' };

    const host = room.players.find((p) => p.socketId === hostSocketId && p.isHost);
    if (!host) return { error: 'Only the host can kick players.' };

    const idx = room.players.findIndex((p) => p.id === targetPlayerId);
    if (idx === -1) return { error: 'Player not found.' };

    const [kicked] = room.players.splice(idx, 1);
    return { room, kicked };
  }

  /**
   * Updates room settings. Only the host can do this (pre-game).
   * @param {string} code
   * @param {string} hostSocketId
   * @param {object} newSettings
   */
  updateSettings(code, hostSocketId, newSettings) {
    const room = this.rooms.get(code);
    if (!room) return { error: 'Room not found.' };
    const host = room.players.find((p) => p.socketId === hostSocketId && p.isHost);
    if (!host) return { error: 'Only the host can change settings.' };
    room.settings = { ...room.settings, ...newSettings };
    room.lastActivity = Date.now();
    return { room };
  }

  /**
   * Retrieves a room by code.
   * @param {string} code
   * @returns {Room | undefined}
   */
  getRoom(code) {
    return this.rooms.get(code);
  }

  /**
   * Finds the room a socket belongs to.
   * @param {string} socketId
   * @returns {{ room: Room, player: Player } | null}
   */
  getRoomBySocket(socketId) {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) return { room, player };
    }
    return null;
  }

  /** Removes rooms that have been inactive longer than TTL */
  _cleanupExpiredRooms() {
    const now = Date.now();
    for (const [code, room] of this.rooms) {
      if (now - room.lastActivity > ROOM_TTL_MS) {
        this.rooms.delete(code);
        console.log(`🧹 Cleaned up expired room: ${code}`);
      }
    }
  }

  /** Returns a safe, serializable snapshot of a room (no internal socket IDs) */
  serializeRoom(room) {
    return {
      code: room.code,
      settings: room.settings,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        connected: p.connected,
      })),
    };
  }
}

export default new RoomManager();
