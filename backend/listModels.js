import fetch from "node-fetch";

const API_KEY = "AIzaSyC0Esi81VJS99Jbb0j3aU0Xk_QdhBoBK_c";

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`
);

const data = await res.json();
console.log(JSON.stringify(data, null, 2));
