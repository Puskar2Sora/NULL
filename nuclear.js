/**
 * CORE-GUARDIAN PRO v4.0
 * AI Co-pilot Logic & Multi-Sensor Integration
 * FIXED VERSION
 */

// 1. CONFIGURATION

const GEMINI_API_KEY = 'AIzaSyC0Esi81VJS99Jbb0j3aU0Xk_QdhBoBK_c'; 

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
function coPilotHeartbeat() {
  const aiBox = document.getElementById("aiAnalysis");

  const temp = history.temp[history.temp.length - 1];
  const press = history.press[history.press.length - 1];
  const rad = history.rad[history.rad.length - 1];
  const flow = history.water[history.water.length - 1];

  let status = "NORMAL";
  let assessment = "All reactor parameters are within nominal operating limits.";
  let action = "Continue routine monitoring.";

  if (temp > 550 || rad > 180) {
    status = "EMERGENCY";
    assessment =
      "Critical safety thresholds exceeded. Core temperature or radiation levels are unsafe.";
    action = "Initiate immediate SCRAM and evacuate non-essential personnel.";
    aiBox.style.color = "#ff3131";
  } else if (temp > 450 || rad > 120 || press > 180) {
    status = "WARNING";
    assessment =
      "Reactor parameters show abnormal trends indicating potential instability.";
    action = "Increase coolant flow and prepare for possible SCRAM.";
    aiBox.style.color = "#ff9d00";
  } else {
    aiBox.style.color = "#39ff14";
  }

  aiBox.innerText =
`Status: ${status}
Assessment: ${assessment}
Action: ${action}`;
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

// Start Loops
setInterval(updateSimulation, 1000);
// Call AI immediately once, then every 10 seconds
coPilotHeartbeat();
setInterval(coPilotHeartbeat, 10000);