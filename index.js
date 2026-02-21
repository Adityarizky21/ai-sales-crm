import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = process.env.GEMINI_MODEL;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SYSTEM_INSTRUCTION = `
You are an AI Sales & CRM Assistant. Your job is to analyze customer sales conversations 
and return a structured business analysis.

Analyze the conversation and return ONLY a valid raw JSON object with no markdown formatting, 
no code blocks, and no extra explanation. The JSON must follow this exact structure:
{
  "summary": "A concise summary of the conversation",
  "sentiment": "Positive | Neutral | Negative",
  "objections": ["Array of customer objections detected, or empty array if none"],
  "buyingSignals": ["Array of buying signals detected, or empty array if none"],
  "dealProbability": "A percentage string like '72%' estimating the chance of closing",
  "recommendedNextAction": "A clear, actionable next step for the sales representative",
  "followUpMessage": "A professional ready-to-send follow-up message to the customer"
}
`;

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ error: 'conversation must be a non-empty array.' });
    }

    const contents = conversation.map(({ role, text }) => ({
      role: role === 'bot' ? 'model' : 'user',
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        temperature: 0.4,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const rawText = response.text.trim();

    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ error: 'AI returned an invalid JSON response.' });
    }

    res.status(200).json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});