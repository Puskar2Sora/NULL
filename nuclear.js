/**
 * CORE-GUARDIAN PRO v4.0
 * AI Co-pilot Logic & Multi-Sensor Integration
 * FIXED VERSION
 */

// 1. CONFIGURATION

let emergencyLockdown = false;
let emergencyStartTime = null;

// 2. DATA STATE
let history = { 
    temp: [300], press: [150], rad: [12.5], 
    air: [101.3], water: [850], labels: [0] 
};
let counter = 1;
let isScrammed = false;

// 3. UI TAB SWITCHER
function switchTab(viewId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(viewId + 'View').classList.add('active');
    // button highlight logic fix
    const btnMap = {
        'heat': 0, 'rad': 1, 'air': 2, 'water': 3
    };
    const btns = document.querySelectorAll('.nav-btn');
    if(btns[btnMap[viewId]]) btns[btnMap[viewId]].classList.add('active');
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
        options: { responsive: true, maintainAspectRatio: false, animation: false }
    }),
    rad: new Chart(document.getElementById('radChart'), {
        type: 'line',
        data: {
            labels: history.labels,
            datasets: [{ label: 'Neutron Flux (μSv/h)', data: history.rad, borderColor: '#39ff14', fill: true, backgroundColor: 'rgba(57, 255, 20, 0.1)' }]
        },
        options: { responsive: true, maintainAspectRatio: false, animation: false }
    }),
    air: new Chart(document.getElementById('airChart'), {
        type: 'line',
        data: {
            labels: history.labels,
            datasets: [{ label: 'Containment Pressure (kPa)', data: history.air, borderColor: '#f5c2e7', tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, animation: false }
    }),
    water: new Chart(document.getElementById('waterChart'), {
        type: 'line',
        data: {
            labels: history.labels,
            datasets: [{ label: 'Flow Rate (m³/s)', data: history.water, borderColor: '#3498db', borderDash: [2, 2] }]
        },
        options: { responsive: true, maintainAspectRatio: false, animation: false }
    })
};

// ==========================================
// FIX 1: SLIDER EVENT LISTENERS (UI UPDATE)
// ==========================================
const flowSlider = document.getElementById('flowSlider');
const rodSlider = document.getElementById('rodSlider');
const flowVal = document.getElementById('flowVal');
const rodVal = document.getElementById('rodVal');

//slider
flowSlider.addEventListener('input', function() {
    flowVal.innerText = this.value;
});

rodSlider.addEventListener('input', function() {
    rodVal.innerText = this.value;
});
// ==========================================


// ==========================================
// FIX 2: DIRECT API CALL (NO BACKEND NEEDED)
// ==========================================
// AI Co-pilot Logic (Called every 10 seconds via setInterval at bottom)
async function coPilotHeartbeat() {
    const aiBox = document.getElementById('aiAnalysis');
    const statusLight = document.querySelector('.ai-status-light');
    
    // Helper to get the latest value from history array
    const last = (arr) => arr[arr.length - 1].toFixed(1);

    // Visual cue that AI is thinking
    aiBox.style.opacity = '0.5';
    aiBox.innerText = "Analyzing telemetry...";
    statusLight.style.backgroundColor = "var(--neon-yellow)"; // Yellow while thinking

    // 1. Gather current state data
    const payload = {
        temp: last(history.temp),
        press: last(history.press),
        rad: last(history.rad),
        air: last(history.air),
        water: last(history.water),
        flowRate: document.getElementById('flowSlider').value,
        rodLevel: document.getElementById('rodSlider').value,
        isScrammed: isScrammed
    };

    try {
        // 2. Send data to YOUR local Node.js server (not Google directly)
        const response = await fetch('http://localhost:3000/api/analyze-reactor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Server connection failed');

        const data = await response.json();
        
        // 3. Display the result from Gemini
        aiBox.innerText = data.analysis;
        aiBox.style.opacity = '1';
        
        // Change light color based on message content
        if (data.analysis.includes("ALERT")) {
             statusLight.style.backgroundColor = "var(--neon-red)";
        } else if (data.analysis.includes("ADVISORY")) {
             statusLight.style.backgroundColor = "var(--neon-orange)";
        } else {
             statusLight.style.backgroundColor = "var(--neon-blue)";
        }

    } catch (e) {
        console.error("Co-Pilot Error:", e);
        aiBox.innerText = ">> SYSTEM ERROR: AI Co-Pilot connection lost.";
        statusLight.style.backgroundColor = "#555"; // Grey out connection
        aiBox.style.opacity = '1';
    }
}
// 6. PHYSICS ENGINE & SIMULATION
function updateSimulation() {
    const flowInput = parseInt(flowSlider.value);
    const rods = parseInt(rodSlider.value);
    document.getElementById('clock').innerText = new Date().toLocaleTimeString() + " UTC";

    let lastTemp = history.temp[history.temp.length - 1];
    
    // Core Physics Logic
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
    
    // Anomaly score update
    let anomaly = Math.abs(newTemp - lastTemp);
    document.getElementById('anomalyScore').innerText = anomaly.toFixed(2);

    // Status Badge Logic
    const badge = document.getElementById('statusBadge');
    if (newTemp > 550 || newRad > 180) {
        badge.innerText = "🚨 CRITICAL STATE";
        badge.style.color = "#ff3131";
        document.getElementById('appContainer').classList.add('critical-mode');
        // Critical visual effect on body
        document.body.style.boxShadow = "inset 0 0 50px rgba(255, 0, 0, 0.2)";
    } else {
        badge.innerText = "AI OVERWATCH ACTIVE";
        badge.style.color = "#39ff14";
        document.getElementById('appContainer').classList.remove('critical-mode');
        document.body.style.boxShadow = "none";
    }

    // Push to History
    history.temp.push(newTemp); history.press.push(newPress); history.rad.push(newRad);
    history.air.push(newAir); history.water.push(newWater); history.labels.push(counter++);
    
    // Keep chart history manageable
    if (history.temp.length > 30) {
        Object.keys(history).forEach(k => history[k].shift());
    }

    // Update Visual Graphs efficiently
    Object.values(charts).forEach(c => c.update('none')); // 'none' for performance
    // ===== EMERGENCY ESCALATION LOGIC =====
if (newTemp > 650 || newRad > 250) {
  if (!emergencyStartTime) {
    emergencyStartTime = Date.now();
  }

  // If emergency persists for more than 15 seconds
  if (Date.now() - emergencyStartTime > 15000 && !emergencyLockdown) {
    triggerEmergencyProtocol();
  }
} else {
  emergencyStartTime = null;
}

}

function triggerEmergencyProtocol() {
  emergencyLockdown = true;

  // Lock UI controls
  flowSlider.disabled = true;
  rodSlider.disabled = true;
  document.getElementById("scramBtn").disabled = true;

  // Force AI tab open
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.getElementById("heatView").classList.add("active");

  // Show emergency popup
  showEmergencyPopup();
}


// 7. INITIALIZATION
document.getElementById('scramBtn').addEventListener('click', () => { 
    isScrammed = true; 
    
    // Update Slider Values
    rodSlider.value = 100;
    flowSlider.value = 100;
    
    // FIX: Update the Text Labels immediately on SCRAM
    rodVal.innerText = "100";
    flowVal.innerText = "100";

    // Visual Feedback
    const btn = document.getElementById('scramBtn');
    btn.innerText = "SCRAM INITIATED";
    btn.style.background = "#ff3131";
    btn.style.color = "white";
    
    setTimeout(() => {
        isScrammed = false;
        btn.innerText = "EMERGENCY SCRAM";
        btn.style.background = "transparent";
        btn.style.color = "#ff3131";
    }, 5000); // Reset after 5 seconds
});
function typeText(el, text, speed = 15) {
  el.innerText = "";
  let i = 0;

  const interval = setInterval(() => {
    el.innerText += text[i++];
    if (i >= text.length) clearInterval(interval);
  }, speed);
}


// Start Loops
setInterval(updateSimulation, 5000);
// Call AI immediately once, then every 10 seconds
coPilotHeartbeat();
setInterval(coPilotHeartbeat, 10000);

function showEmergencyPopup() {
  const popup = document.createElement("div");
  popup.id = "emergencyPopup";

  popup.innerHTML = `
    <div class="emergency-box">
      <h2>🚨 AI EMERGENCY PROTOCOL ACTIVATED</h2>
      <p>System control has been lost.</p>

      <div class="call-log">
        <p>📡 Contacting Emergency Services...</p>
        <p>🚑 Ambulance Dispatch: <span class="ok">CONFIRMED</span></p>
        <p>🚒 Fire Brigade Dispatch: <span class="ok">CONFIRMED</span></p>
        <p>🚓 Police Dispatch: <span class="ok">CONFIRMED</span></p>
      </div>

      <p class="footer-note">
        AI has assumed emergency coordination authority.<br>
        Manual operator intervention disabled.
      </p>
    </div>
  `;

  document.body.appendChild(popup);
}