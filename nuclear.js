const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // <--- আপনার কী বসান

let history = { temp: [300], press: [150], labels: [0] };
let counter = 1;
let anomalyCounter = 0;

// Initialize Chart
const ctx = document.getElementById('mainChart').getContext('2d');
const mainChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: history.labels,
        datasets: [{
            label: 'Core Temperature (°C)',
            data: history.temp,
            borderColor: '#00d4ff',
            tension: 0.3,
            yAxisID: 'y',
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

async function callGemini(temp, flow, slope) {
    const aiBox = document.getElementById('aiAnalysis');
    aiBox.innerHTML = "🤖 AI analyzing physics trend...";
    
    const prompt = `Reactor failure detected. Temp: ${temp}C, Flow: ${flow}%, Slope: ${slope}. Give 1 urgent instruction.`;
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        aiBox.innerText = data.candidates[0].content.parts[0].text;
    } catch (e) {
        aiBox.innerText = "AI Communication Error.";
    }
}

function updateSimulation() {
    const flow = document.getElementById('flowSlider').value;
    const rods = document.getElementById('rodSlider').value;
    document.getElementById('flowVal').innerText = flow;
    document.getElementById('rodVal').innerText = rods;

    let lastTemp = history.temp[history.temp.length - 1];
    let lastPress = history.press[history.press.length - 1];

    // Physics Engine
    let riseFactor = (100 - flow) * 0.4 + (25 - rods) * 0.6;
    let newTemp = riseFactor > 0 ? lastTemp + (riseFactor * 0.2) : lastTemp + (Math.random() - 0.5);
    let newPress = riseFactor > 0 ? lastPress + (riseFactor * 0.1) : 150 + (Math.random() - 0.2);

    let slope = newTemp - lastTemp;

    // Update UI
    document.getElementById('tempDisplay').innerText = `${newTemp.toFixed(1)} °C`;
    document.getElementById('pressDisplay').innerText = `${newPress.toFixed(1)} Bar`;
    
    // Status Logic
    const badge = document.getElementById('statusBadge');
    const sopList = document.getElementById('sopList');
    
    if (slope > 2.5 || newTemp > 500) {
        anomalyCounter++;
        badge.innerText = "🚨 CRITICAL ANOMALY";
        badge.className = "badge critical";
        sopList.innerHTML = "<li>Trigger SCRAM Rods</li><li>Activate Backup Coolant</li>";
        
        if (anomalyCounter === 5) callGemini(newTemp.toFixed(1), flow, slope.toFixed(2));
    } else {
        anomalyCounter = 0;
        badge.innerText = "SYSTEM NOMINAL";
        badge.className = "badge safe";
        sopList.innerHTML = "<li>Monitor stability</li><li>Log hourly data</li>";
    }

    // Update Chart
    history.temp.push(newTemp);
    history.labels.push(counter++);
    if (history.temp.length > 30) { history.temp.shift(); history.labels.shift(); }
    mainChart.update();
}

setInterval(updateSimulation, 1000);