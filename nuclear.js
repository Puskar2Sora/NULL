/**
 * CORE-GUARDIAN PRO v4.0
 * AI Co-pilot Logic & Multi-Sensor Integration
 */

// 1. CONFIGURATION
const GEMINI_API_KEY = 'AIzaSyC0Esi81VJS99Jbb0j3aU0Xk_QdhBoBK_c'; // Replace with your AIza... key from Google AI Studio

// 2. DATA STATE
let history = { 
    temp: [300], press: [150], rad: [12.5], 
    air: [101.3], water: [850], labels: [0] 
};
let counter = 1;
let isScrammed = false;

// 3. UI TAB SWITCHER
function switchTab(viewId) {
    // Remove active class from all tabs and buttons
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show the selected tab and highlight button
    document.getElementById(viewId + 'View').classList.add('active');
    if (event) event.currentTarget.classList.add('active');
}

// 4. INITIALIZE ALL CHARTS
const charts = {
    main: new Chart(document.getElementById('mainChart'), {
        type: 'line',
        data: {
            labels: history.labels,
            datasets: [
                { label: 'Temp (°C)', data: history.temp, borderColor: '#00f2ff', tension: 0.3 },
                { label: 'Pressure (Bar)', data: history.press, borderColor: '#ff9d00', borderDash: [5, 2] }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    rad: new Chart(document.getElementById('radChart'), {
        type: 'line',
        data: {
            labels: history.labels,
            datasets: [{ label: 'Neutron Flux (μSv/h)', data: history.rad, borderColor: '#39ff14', fill: true, backgroundColor: 'rgba(57, 255, 20, 0.1)' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    air: new Chart(document.getElementById('airChart'), {
        type: 'line',
        data: {
            labels: history.labels,
            datasets: [{ label: 'Containment Pressure (kPa)', data: history.air, borderColor: '#f5c2e7', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    }),
    water: new Chart(document.getElementById('waterChart'), {
        type: 'line',
        data: {
            labels: history.labels,
            datasets: [{ label: 'Flow Rate (m³/s)', data: history.water, borderColor: '#3498db', borderDash: [2, 2] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    })
};

// 5. CORRECTED AI CO-PILOT HEARTBEAT (Fixes 404 Error)
async function coPilotHeartbeat() {
    const aiBox = document.getElementById('aiAnalysis');
    const last = (arr) => arr[arr.length - 1].toFixed(1);
    
    // FIXED URL: Must include ':generateContent' at the en
const API_URL = "http://localhost:3000/ai";


    const prompt = `CO-PILOT OVERWATCH:
    Current Data: Temp ${last(history.temp)}C, Press ${last(history.press)}Bar, Rad ${last(history.rad)}uSv/h, Air ${last(history.air)}kPa, Flow ${last(history.water)}m3/s.
    System is under your monitoring. Give a 1-sentence tactical briefing on overall safety.`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Required for v1beta
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        if (data.candidates && data.candidates[0]) {
            aiBox.innerText = ">> " + data.candidates[0].content.parts[0].text;
        }
    } catch (e) {
        console.error("Co-pilot Connection Error:", e);
        aiBox.innerText = ">> CO-PILOT OFFLINE: " + e.message;
    }
}

// 6. PHYSICS ENGINE & SIMULATION
function updateSimulation() {
    const flowInput = parseInt(document.getElementById('flowSlider').value);
    const rods = parseInt(document.getElementById('rodSlider').value);
    document.getElementById('clock').innerText = new Date().toLocaleTimeString() + " UTC";

    let lastTemp = history.temp[history.temp.length - 1];
    
    // Core Physics: Heat vs Coolant Balance
    let rise = (80 - flowInput) * 0.4 + (30 - rods) * 0.7;
    if (isScrammed) rise = -35;

    let newTemp = Math.max(20, lastTemp + (rise * 0.25) + (Math.random() - 0.5));
    let newPress = Math.max(1, 150 + (rise * 0.6));
    let newRad = Math.max(0.1, (100 - rods) * 2.8 + (Math.random() * 5));
    let newAir = 101.3 + (newTemp > 500 ? (newTemp - 500) * 0.08 : 0);
    let newWater = (flowInput * 12.5) + (Math.random() * 10);

    // Update UI Displays
    document.getElementById('tempDisplay').innerText = newTemp.toFixed(1);
    document.getElementById('pressDisplay').innerText = newPress.toFixed(1);
    document.getElementById('radDisplay').innerText = newRad.toFixed(1);
    document.getElementById('airDisplay').innerText = newAir.toFixed(1);
    document.getElementById('waterDisplay').innerText = newWater.toFixed(1);
    document.getElementById('anomalyScore').innerText = Math.abs(newTemp - lastTemp).toFixed(2);

    // Status Badge Logic
    const badge = document.getElementById('statusBadge');
    if (newTemp > 550 || newRad > 180) {
        badge.innerText = "🚨 CRITICAL STATE";
        badge.style.color = "#ff3131";
        document.getElementById('appContainer').classList.add('critical-mode');
    } else {
        badge.innerText = "AI OVERWATCH ACTIVE";
        badge.style.color = "#39ff14";
        document.getElementById('appContainer').classList.remove('critical-mode');
    }

    // Push to History
    history.temp.push(newTemp); history.press.push(newPress); history.rad.push(newRad);
    history.air.push(newAir); history.water.push(newWater); history.labels.push(counter++);
    
    if (history.temp.length > 25) Object.keys(history).forEach(k => history[k].shift());

    // Update Visual Graphs
    Object.values(charts).forEach(c => c.update('none'));
}

// 7. INITIALIZATION
document.getElementById('scramBtn').addEventListener('click', () => { 
    isScrammed = true; 
    document.getElementById('rodSlider').value = 100;
    document.getElementById('flowSlider').value = 100;
});

setInterval(updateSimulation, 1000);
setInterval(coPilotHeartbeat, 10000); // 10-second AI Heartbeat