import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.FRONTEND_URL || "https://stellar-raindrop-690ca3.netlify.app/"],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: ["http://localhost:5173", process.env.FRONTEND_URL || "https://stellar-raindrop-690ca3.netlify.app/"]
}));
app.use(express.json());

// Mock data
let memes = [
  {
    id: '1',
    title: 'When the blockchain validates your existence',
    image_url: 'https://picsum.photos/800/600?random=1',
    tags: ['crypto', 'blockchain', 'validation'],
    upvotes: 142,
    owner_id: 'user_1337',
    created_at: new Date().toISOString(),
  }
];

let trades = [];
let bids = [];

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join trading room
  socket.join('trading');

  // Send initial data
  socket.emit('memes:updated', memes);
  socket.emit('trades:updated', trades);

  // Handle new meme creation
  socket.on('meme:create', (memeData) => {
    const newMeme = {
      ...memeData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    memes.unshift(newMeme);
    io.to('trading').emit('memes:updated', memes);
  });

  // Handle meme upvote
  socket.on('meme:upvote', (memeId) => {
    const meme = memes.find(m => m.id === memeId);
    if (meme) {
      meme.upvotes += 1;
      io.to('trading').emit('memes:updated', memes);
    }
  });

  // Handle new bid
  socket.on('bid:create', (bidData) => {
    const newBid = {
      ...bidData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    bids.push(newBid);
    io.to('trading').emit('bids:updated', bids);
  });

  // Handle trade execution
  socket.on('trade:execute', (tradeData) => {
    const newTrade = {
      ...tradeData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    trades.unshift(newTrade);
    io.to('trading').emit('trades:updated', trades);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// REST API endpoints
app.get('/api/memes', (req, res) => {
  res.json(memes);
});

app.post('/api/memes', (req, res) => {
  const newMeme = {
    ...req.body,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  memes.unshift(newMeme);
  
  // Emit to all connected clients
  io.to('trading').emit('memes:updated', memes);
  
  res.status(201).json(newMeme);
});

app.get('/api/trades', (req, res) => {
  res.json(trades);
});

app.post('/api/bids', (req, res) => {
  const newBid = {
    ...req.body,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  bids.push(newBid);
  
  // Emit to all connected clients
  io.to('trading').emit('bids:updated', bids);
  
  res.status(201).json(newBid);
});

// AI endpoint simulation (replace with actual Gemini API)
app.post('/api/ai/generate-caption', (req, res) => {
  const captions = [
    "When the blockchain finally validates your existence",
    "AI trying to understand human humor like:",
    "Neural networks dreaming of electric memes",
    "That moment when your smart contract actually works",
    "Cyberpunk cat judges your code quality",
    "Matrix glitch reveals the truth about reality"
  ];
  
  setTimeout(() => {
    res.json({
      caption: captions[Math.floor(Math.random() * captions.length)],
      confidence: Math.random() * 0.4 + 0.6
    });
  }, 1000);
});

app.post('/api/ai/analyze-vibe', (req, res) => {
  const vibes = [
    { type: 'cyberpunk', intensity: 0.9, description: 'Peak cyberpunk aesthetic detected' },
    { type: 'wholesome', intensity: 0.7, description: 'Surprisingly wholesome energy' },
    { type: 'chaotic', intensity: 0.8, description: 'Pure chaotic energy unleashed' },
    { type: 'intellectual', intensity: 0.6, description: 'Big brain meme detected' },
    { type: 'nostalgic', intensity: 0.5, description: 'Vintage internet vibes' }
  ];
  
  setTimeout(() => {
    res.json(vibes[Math.floor(Math.random() * vibes.length)]);
  }, 800);
});

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CyberMeme server running on port ${PORT}`);
  console.log(`💫 Socket.IO enabled for real-time features`);
  console.log(`🌐 Server accepting connections on all interfaces`);
});