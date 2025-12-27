require('dotenv').config(); // Load security environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(bodyParser.json()); // Allow server to read JSON data sent from frontend

// --- GEMINI SETUP ---
// Initialize Gemini with the key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Use the 'gemini-pro' model (good for text-based analysis)
// Change this line in your server.js
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }); // High throughput model


// --- THE NEW AI ANALYSIS ENDPOINT ---
app.post('/api/analyze-reactor', async (req, res) => {
    try {
        // 1. Receive data from nuclear.js
        const { temp, press, rad, air, water, flowRate, rodLevel, isScrammed } = req.body;

        // 2. Construct the Engineering Prompt
        // We give Gemini a persona so it acts like a professional co-pilot.
        let statusContext = isScrammed ? "EMERGENCY SCRAM IN PROGRESS." : "NORMAL OPERATIONS.";

        const prompt = `
            Role: You are an advanced AI Nuclekiar Reactor Co-Pilot monitoring a pressurized water reactor.
            Task: Analyze the live telemetry below and provide a single, concise, professional status message for the main console display.

            Live Telemetry:
            - Status Context: ${statusContext}
            - Core Temperature: ${temp} °C (Critical Threshold: >550°C)
            - Primary Pressure: ${press} Bar (Critical Threshold: >260 Bar)
            - Radiation Flux: ${rad} μSv/h (Critical Threshold: >180 μSv/h)
            - Containment Air Pressure: ${air} kPa (Normal: ~101.3 kPa)
            - Coolant Water Flow: ${water} m³/s (Pump Power: ${flowRate}%)
            - Control Rod Insertion: ${rodLevel}%

            Instructions:
            1. If any parameter is critical, begin response with "ALERT:".
            2. If parameters are stable but high, begin with "ADVISORY:".
            3. If normal, begin with "STATUS NOMINAL:".
            4. Keep the response under 20 words. Be succinct and technical.
            5. Do not use markdown or asterisks.
        `;

        // 3. Call Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiText = response.text();

        // 4. Send response back to frontend
        console.log(`Gemini analysis sent: ${aiText}`);
        res.json({ analysis: aiText });

    } catch (error) {
        console.error("Error contacting Gemini:", error);
        res.status(500).json({ analysis: "SYSTEM ERROR: AI Telemetry Link Offline." });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Nuclear Co-Pilot Backend running at http://localhost:${port}`);
});