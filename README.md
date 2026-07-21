# 🔥 Roast Room — Real-Time Multiplayer Party Game

> The anonymous party game that reveals what your friends REALLY think. No account needed. Works on any device.

![Dark mode UI with glassmorphism design](https://img.shields.io/badge/Dark%20Mode-Enabled-7c3aed?style=flat-square)
![Mobile First](https://img.shields.io/badge/Mobile-First-f97316?style=flat-square)
![Real-Time](https://img.shields.io/badge/Real--Time-Socket.io-06b6d4?style=flat-square)

---

## ✨ Features

- 🎮 **3–12 players** in a shared lobby, accessible via link or 4-letter code
- 🔥 **110+ viral party questions** (social, funny, risky)
- ✍️ **Two modes**: Auto questions OR players write their own
- 🗳️ **Voting system** — vote for the best answer, earn points
- 📊 **Scoreboard** — leaderboard updates every round
- 🔊 **Sound effects** with toggle (Web Audio API, no external files)
- 📱 **Mobile-first** responsive design
- ⚡ **Real-time sync** via Socket.io — no page refreshes
- 🔄 **Auto reconnect** — handles disconnects gracefully
- 👑 **Host controls** — kick players, change settings, start game

---

## 📁 Project Structure

```
party-game/
├── server/                    # Node.js + Socket.io backend
│   ├── src/
│   │   ├── index.js           # Express + Socket.io server
│   │   ├── rooms/
│   │   │   └── RoomManager.js # In-memory room management
│   │   ├── game/
│   │   │   └── GameEngine.js  # Server-authoritative game state machine
│   │   └── questions/
│   │       └── questions.js   # 110+ party questions
│   ├── .env                   # Server environment variables
│   └── package.json
│
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx           # App entry point
│   │   ├── App.jsx            # Phase-based router
│   │   ├── context/
│   │   │   └── GameContext.jsx # Global state + socket events
│   │   ├── hooks/
│   │   │   ├── useSocket.js   # Socket.io connection hook
│   │   │   └── useTimer.js    # Client countdown timer hook
│   │   ├── utils/
│   │   │   ├── constants.js   # Shared constants
│   │   │   └── sounds.js      # Web Audio API sound effects
│   │   ├── styles/
│   │   │   └── global.css     # Design system (tokens, components, animations)
│   │   ├── components/
│   │   │   ├── PlayerCard.jsx
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── AnswerCard.jsx
│   │   │   ├── RoomCode.jsx
│   │   │   ├── ShareButton.jsx
│   │   │   ├── SettingsPanel.jsx
│   │   │   └── Toast.jsx
│   │   └── screens/
│   │       ├── HomeScreen.jsx
│   │       ├── LobbyScreen.jsx
│   │       ├── QuestionWritingScreen.jsx
│   │       ├── AnsweringScreen.jsx
│   │       ├── ResultsScreen.jsx
│   │       └── GameOverScreen.jsx
│   ├── .env                   # Client environment variables
│   └── package.json
│
├── package.json               # Root workspace + dev scripts
└── README.md
```

---

## 🚀 Local Development (Quick Start)

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org))
- **npm** 9+

### Step 1 — Install Dependencies

```bash
cd party-game

# Install root, server, and client dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Step 2 — Configure Environment

**Server** (`server/.env` — already created):
```env
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env` — already created):
```env
VITE_SERVER_URL=http://localhost:3001
```

### Step 3 — Run Both Servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd party-game/server
npm run dev
# → Server running on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd party-game/client
npm run dev
# → App running on http://localhost:5173
```

### Step 4 — Test Multiplayer Locally

1. Open `http://localhost:5173` in **one browser tab**
2. Create a room, note the 4-letter code
3. Open the same URL in **another tab** (or phone on same network)
4. Join with the code — you're live!

---

## 🎮 How to Play

1. **Host** creates a room and sets game options (mode, rounds, timer)
2. **Players** join via the 4-letter code or shareable link
3. **Host** starts the game
4. Each round:
   - A question appears (auto or player-written)
   - Everyone types an anonymous answer within the time limit
   - Answers are revealed — vote for your favourite!
   - Winner gets **3 pts**, runner-up gets **1 pt**
5. After all rounds, the **leaderboard** shows the champion

---

## 🌐 Deployment

### Backend → [Render.com](https://render.com)

1. Push your project to GitHub
2. Create a new **Web Service** on Render
3. Set root directory to `server/`
4. Build command: `npm install`
5. Start command: `node src/index.js`
6. Add environment variables:
   ```
   NODE_ENV=production
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
7. Copy your Render URL (e.g. `https://roast-room-api.onrender.com`)

### Frontend → [Vercel](https://vercel.com)

1. Create a new **Vercel project**, connect your GitHub repo
2. Set root directory to `client/`
3. Add environment variable:
   ```
   VITE_SERVER_URL=https://roast-room-api.onrender.com
   ```
4. Deploy — Vercel auto-detects Vite

### Update CORS

After deployment, update `server/.env`:
```env
CLIENT_URL=https://your-vercel-app.vercel.app
```
And redeploy the backend.

---

## ⚙️ Configuration Reference

| Setting | Default | Range | Description |
|---|---|---|---|
| `mode` | `auto` | `auto` / `player` | Who picks questions |
| `totalRounds` | `5` | 3–10 | Rounds per game |
| `answerTime` | `30` | 15–120s | Time to answer |
| `questionTime` | `45` | 15–90s | Time to write question (player mode) |
| `maxPlayers` | `8` | 3–12 | Max lobby size |

---

## 🔌 Socket Event Reference

| Client → Server | Payload | Description |
|---|---|---|
| `create_room` | `{ playerName, settings }` | Create a new room |
| `join_room` | `{ roomCode, playerName }` | Join existing room |
| `update_settings` | `{ roomCode, settings }` | Host updates settings |
| `start_game` | `{ roomCode }` | Host starts the game |
| `submit_question` | `{ roomCode, playerId, question }` | Submit round question |
| `submit_answer` | `{ roomCode, playerId, playerName, answer }` | Submit answer |
| `submit_vote` | `{ roomCode, voterId, targetPlayerId }` | Vote for an answer |
| `next_round` | `{ roomCode }` | Host advances to next round |
| `kick_player` | `{ roomCode, targetPlayerId }` | Host kicks a player |
| `play_again` | `{ roomCode }` | Host resets game |

| Server → Client | Payload | Description |
|---|---|---|
| `room_created` | `{ roomCode, playerId, room }` | Room created confirmation |
| `room_joined` | `{ roomCode, playerId, room }` | Join confirmation |
| `room_update` | `{ room }` | Player list / settings changed |
| `game_started` | — | Game beginning |
| `game_state` | Full state object | Phase changed, broadcast to all |
| `timer_tick` | `{ value }` | Countdown tick (every 1s) |
| `error` | `{ message }` | Error for the requesting client |
| `kicked` | `{ message }` | Player was removed |
| `returned_to_lobby` | — | Host reset game |

---

## 🎨 Design System

- **Background**: Deep navy `#060810`
- **Primary**: Electric purple `#7c3aed`
- **Accent**: Coral `#f97316`
- **Typography**: Inter (Google Fonts)
- **Effects**: Glassmorphism, radial gradient mesh, CSS animations
- **Mobile**: `100dvh`, safe area insets, touch-optimised tap targets

---

## 🛡️ Edge Cases Handled

- ✅ Player disconnects mid-game → marked offline, game continues
- ✅ Host disconnects → host transfers to next connected player
- ✅ All players disconnect → room auto-expires in 2 hours
- ✅ Late joiners → blocked after game starts with helpful message
- ✅ Duplicate names → rejected with error
- ✅ Invalid room codes → error message on join screen
- ✅ Timer expiry → auto-advances phase even if not all answered/voted
- ✅ All questions used → pool resets automatically

---

## 📜 License

MIT — build on it, break it, make it yours.
