const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors()); // Allows your frontend to talk to this server
app.use(express.json());

const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // Put your key here safely

app.post('/analyze', async (req, res) => {
    const { temp, flow, slope, press } = req.body;
    const prompt = `NUCLEAR EMERGENCY: Core is at ${temp}°C and ${press} Bar. Coolant Flow is at ${flow}%. Temperature is rising at ${slope}°C/sec. Provide one extremely concise technical instruction.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to connect to Gemini" });
    }
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));