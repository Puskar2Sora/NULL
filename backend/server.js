import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyC0Esi81VJS99Jbb0j3aU0Xk_QdhBoBK_c";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env");
}

// ✅ USE MOST STABLE MODEL
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
  GEMINI_API_KEY;

app.post("/ai", async (req, res) => {
  try {
    const apiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const rawText = await apiRes.text(); // 🔥 IMPORTANT

    if (!rawText) {
      throw new Error("Empty response from Gemini API");
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("❌ Gemini returned non-JSON:", rawText);
      throw new Error("Invalid JSON from Gemini");
    }

    if (!apiRes.ok) {
      console.error("❌ Gemini API error:", data);
      return res.status(500).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Gemini backend failed:", err.message);
    res.status(500).json({
      error: {
        message: err.message,
      },
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Gemini backend running on http://localhost:3000");
});
