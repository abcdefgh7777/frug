import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Serve static files from dist folder
app.use(express.static(join(__dirname, 'dist')));

// Initialize SQLite database
// Use RAILWAY_VOLUME_MOUNT_PATH if available (persistent across deploys)
// Otherwise fallback to local ./data directory
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || join(__dirname, 'data');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'fugs.db'));
db.pragma('journal_mode = WAL');

// Create fugs table
db.exec(`
  CREATE TABLE IF NOT EXISTS fugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// API endpoint for generating POG names (Kimi AI)
app.post('/api/generate-name', async (req, res) => {
  const apiKey = process.env.KIMI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [{
          role: 'system',
          content: 'You are a frog name generator for FUG the frog community on Solana. You MUST respond with ONLY a single name (1-2 words max), nothing else. No explanations, no quotes, just the name in UPPERCASE. Names should be frog/fug themed or Solana meme culture.'
        },
        {
          role: 'user',
          content: `Generate ONE unique random name for a FUG (frog character). Pick randomly from these styles:

- Fug names: FUG KING, LIL FUG, BIG FUG, FUGGY, SER FUG, BASED FUG, MEGA FUG, ULTRA FUG, BABY FUG, DARK FUG, CHAD FUG, FUG LORD, FUG GOD, HOLY FUG, FUG MASTER
- Frog vibes: RIBBIT, CROAK, SWAMP LORD, LILY PAD, TADPOLE, POND KING, TOAD, SWAMP RAT, FROGGO, HOPPY, LEAPFROG, BULLFROG, TREE FROG
- Solana meme culture: SOL FUG, DEGEN FUG, BONK FUG, JITO FUG, PHANTOM FUG, RAYDIUM FUG, JUPITER FUG, PUMP FUG, SOLANA FROG, AIRDROP FUG
- Simple funny names: DAVE, GREG, CARL, FRANK, STEVE, BOB, LARRY, HANK, CLYDE, RALPH, EUGENE, MELVIN, GILBERT, HERBERT, NORBERT
- Cult vibes: PROPHET, ELDER FUG, CULT LEADER, HIGH PRIEST, THE CHOSEN, ORACLE, SAGE, DISCIPLE, ASCENDED, ENLIGHTENED FUG

Be creative! Mix words with FUG, invent new frog names, keep it funny and memey. Solana only - no ETH/BNB references. Just output the name, nothing else.`
        }],
        max_tokens: 20,
        temperature: 0.9
      })
    });

    const data = await response.json();
    console.log('Kimi response:', JSON.stringify(data));

    if (data.error) {
      console.error('Kimi API error:', data.error);
      return res.status(500).json({ error: data.error.message || 'Kimi API error' });
    }

    if (data.choices && data.choices[0]) {
      res.json({ name: data.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: 'Failed to generate name' });
    }
  } catch (error) {
    console.error('Kimi API error:', error);
    res.status(500).json({ error: 'Failed to generate name' });
  }
});

// Save a new FUG to the database
app.post('/api/fugs', (req, res) => {
  const { name, image_data } = req.body;

  if (!name || !image_data) {
    return res.status(400).json({ error: 'Name and image_data are required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO fugs (name, image_data) VALUES (?, ?)');
    const result = stmt.run(name.substring(0, 50), image_data);
    res.json({ id: result.lastInsertRowid, name, created_at: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving fug:', error);
    res.status(500).json({ error: 'Failed to save fug' });
  }
});

// Get all FUGs (paginated, newest first)
app.get('/api/fugs', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  try {
    const fugs = db.prepare('SELECT id, name, image_data, created_at FROM fugs ORDER BY id DESC LIMIT ? OFFSET ?').all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM fugs').get();
    res.json({ fugs, total: total.count, page, limit });
  } catch (error) {
    console.error('Error fetching fugs:', error);
    res.status(500).json({ error: 'Failed to fetch fugs' });
  }
});

// Get recent FUGs for TV display (last 20, small payload)
app.get('/api/fugs/recent', (req, res) => {
  try {
    const fugs = db.prepare('SELECT id, name, image_data, created_at FROM fugs ORDER BY id DESC LIMIT 20').all();
    res.json(fugs);
  } catch (error) {
    console.error('Error fetching recent fugs:', error);
    res.status(500).json({ error: 'Failed to fetch recent fugs' });
  }
});

// Handle SPA routing - serve index.html for all other routes
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
