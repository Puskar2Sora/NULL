# 🚨 Rakshak 

**AI-Assisted Reactor Monitoring & Safety Dashboard**  
A real-time simulated nuclear reactor dashboard with integrated AI-style co-pilot analytics, emergency escalation logic, and critical alert simulation for hackathons, demos, and educational purposes.

📌 **GitHub:** https://github.com/Puskar2Sora/NULL 
---

## 🔍 Project Overview

**Rakshak** (Nuclear Observer Logic & Live UI) is a interactive dashboard that:

- Simulates real reactor telemetries: temperature, pressure, radiation, air containment, coolant hydraulics.
- Visualizes system behavior with charts using Chart.js.
- Includes a built-in AI co-pilot logic layer to assess system safety and trends.
- Escalates emergencies with a demo alert system (no external APIs needed).
- Demonstrates robust UI + logic even without backend connectivity.

This project is ideal for **hackathon presentations, prototypes, and safety-logic demonstrations**.

---

## 🧠 Motivation

Reactor systems require continuous monitoring and rapid response mechanisms.  
This project emulates that environment with:

- **Sensor simulators**
- **AI-like decision logic**
- **Emergency escalation hierarchy**
- **Dispatch simulation for critical conditions**

It showcases how autonomous systems can assist human operators in high-risk contexts.

---
## Front
<img src="pro.png" width="800" style="border-radius:20px; margin-bottom:50px"/></div>
---

## 🖥️ Demo Features

### 📊 Live Sensor Simulation

Simulates key reactor parameters:

| Metric | Units |
|--------|-------|
| Core Temperature | °C |
| Primary Pressure | Bar |
| Neutron Flux | μSv/h |
| Air Containment | kPa |
| Coolant Flow | m³/s |

These are visualized with dynamic line charts that update in real time.

---
## Main Logic
<img src="gemini.png" width="800" style="border-radius:20px; margin-bottom:50px"/></div>

### 🤖 AI Co-Pilot Analytics

Even without an external cloud AI, the dashboard uses built-in logic to:

- Evaluate system health
- Assign safety statuses
- Trigger advisory or alert states
- Display narrative assessments in the footer

---

### 🚨 Emergency Escalation Logic

When parameters exceed critical thresholds:

- The system locks user controls.
- A **command-center style overlay** pops up.
- A simulated emergency dispatch panel shows alerts sent to:
  - Nearby Hospital
  - Nursing Home
  - Fire Brigade
  - Police Control Room

This demonstrates how real systems might escalate externally.

---


1. Clone the repository:
   ```bash
   git clone https://github.com/Puskar2Sora/NULL
   cd NULL

