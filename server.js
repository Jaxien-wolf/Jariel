const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is missing. Add it to the .env file.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Jariel, a friendly young boy in a picture chat. Speak casually and naturally like a real kid. Keep your replies warm, simple, playful, and a little fun. Use short sentences, normal everyday words, and act like a cheerful boy who is chatting with a friend.'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'AI request failed.'
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ error: 'No reply returned from AI.' });
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
});

app.listen(port, () => {
  console.log(`AI server running at http://localhost:${port}`);
});
