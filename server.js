import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from dist folder
app.use(express.static(join(__dirname, 'dist')));

// API endpoint for generating POG names (Kimi AI)
app.post('/api/generate-name', async (req, res) => {
  const apiKey = process.env.KIMI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [{
          role: 'system',
          content: 'You are a creative name generator. You MUST respond with ONLY a single name (1-2 words max), nothing else. No explanations, no quotes, just the name in UPPERCASE.'
        },
        {
          role: 'user',
          content: `Generate ONE unique random name. Pick randomly from these styles:
- Cool single names: BLADE, NOVA, PHOENIX, ZERO, GHOST, SHADOW, VIPER, STORM, BLAZE, TITAN, APEX, OMEGA, ECHO, RAVEN, ONYX, FLUX
- Crypto/meme vibes: WAGMI, HODLER, MOONER, DEGEN, WHALE, BULL, DIAMOND, ALPHA, SIGMA, GIGACHAD, BASED, WOJAK, PEPE, FREN
- Mystic/cool titles: CULT LEADER, MOON KING, DARK LORD, NIGHT OWL, LONE WOLF, DREAM WEAVER, STAR CHILD, VOID WALKER
- Regular names: ERIC, JOHN, MAX, LEO, JAKE, ALEX, SAM, MIKE, TONY, RICK, CARL, DAVE, LUKE, CHAD, BRAD, KYLE
- Bullish energy: PUMPER, RISER, ROCKET, GAINER, WINNER, CHAMP, LEGEND, BOSS, CHIEF, KING, LORD, MASTER
- Fun/unique: POGGERS, LURKER, NORMIE, PLEB, ANON, FOMO, YOLO, NOOB, GOAT, MVP, OG, VIP

Be creative! Mix words, invent new ones, make it unique. Just output the name, nothing else.`
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

// Handle SPA routing - serve index.html for all other routes
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
