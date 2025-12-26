import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { VertexAI } from "@google-cloud/vertexai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Vertex AI init (NO auth here)
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: "us-central1",
});

// ✅ Use Flash first (most reliable)
const model = vertexAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

app.post("/ai", async (req, res) => {
  try {
    const prompt =
      req.body?.contents?.[0]?.parts?.[0]?.text || "System status check";

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    res.json({
      candidates: [{ content: { parts: [{ text }] } }],
    });
  } catch (err) {
    console.error("❌ Vertex AI Error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.listen(3000, () => {
  console.log("🚀 Backend running on http://localhost:3000");
});
