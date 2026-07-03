---
name: Web POC Development
description: Builds proof-of-concept web applications to demonstrate technical feasibility for presentation topics
---

# Web POC Development

Use this skill to build proof-of-concept (POC) web applications that demonstrate technical feasibility for concepts presented in slides. Keep the scope minimal: prove the concept works, do not build a production application.

## Scope Boundaries

Every Web POC must:
- Demonstrate exactly one core concept or technical capability
- Run locally with a single command (`npm start`, `python app.py`, or `open index.html`)
- Include no authentication, no database persistence, and no deployment infrastructure
- Use mock data or local JSON files instead of live external APIs (unless the API is the concept)
- Stay within 500 lines of code across all files

## Technology Selection

| Level | Frontend | Backend | When to Use |
|---|---|---|---|
| Simple | HTML + CSS + vanilla JS | None | Data viz, UI mockup, animation |
| Medium | HTML/JS with bundler or React | None | Interactive SPA, form-based demo |
| Full-stack | React or HTML + JS | Node.js + Express | API-driven demo, server-side logic |

Default to the simplest level that proves the concept. Do not use React when plain HTML/JS suffices.

## Project Structure

**Simple**: `index.html`, `css/style.css`, `js/app.js`, `data/mock-data.json`, `README.md`

**Full-stack**: `client/` (index.html, css/, js/), `server/` (index.js, routes/), `data/mock-data.json`, `package.json`, `README.md`

## Implementation Workflow

1. Read the POC requirement from the Technical Architect or Coordinator.
2. Identify the single core concept. Write it in one sentence.
3. Select the complexity level from the table above.
4. Create the project scaffold.
5. Implement the core feature first, before any styling.
6. Add mock data with 5-10 data points minimum.
7. Style with minimal CSS: system font stack, simple color scheme.
8. Write a README.md with setup instructions and run command.
9. Test locally and verify the core concept works.

## Example

### Input

POC requirement: "Demonstrate a real-time data dashboard updating every 2 seconds with simulated sensor data (temperature, humidity, pressure)."

### Process

1. Core concept: Real-time data visualization with periodic updates.
2. Complexity: Simple -- use `setInterval` and Chart.js, no backend needed.

### Output: index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Real-Time Sensor Dashboard</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
</head>
<body>
    <h1>Real-Time Sensor Dashboard</h1>
    <div class="dashboard-grid">
        <div class="card"><h2>Temperature</h2><canvas id="tempChart"></canvas><p id="tempValue">--</p></div>
        <div class="card"><h2>Humidity</h2><canvas id="humidChart"></canvas><p id="humidValue">--</p></div>
        <div class="card"><h2>Pressure</h2><canvas id="pressChart"></canvas><p id="pressValue">--</p></div>
    </div>
    <script src="js/app.js"></script>
</body>
</html>
```

### Output: js/app.js

```javascript
const MAX_POINTS = 30;
const sensors = {
    temperature: { min: 18, max: 32, unit: "C", data: [], chart: null },
    humidity:    { min: 30, max: 80, unit: "%", data: [], chart: null },
    pressure:   { min: 990, max: 1030, unit: "hPa", data: [], chart: null }
};

function generateReading(sensor) {
    const range = sensor.max - sensor.min;
    const last = sensor.data.length > 0 ? sensor.data[sensor.data.length - 1] : sensor.min + range / 2;
    const delta = (Math.random() - 0.5) * range * 0.1;
    return Math.max(sensor.min, Math.min(sensor.max, parseFloat((last + delta).toFixed(1))));
}

function initChart(id, label, color) {
    return new Chart(document.getElementById(id).getContext("2d"), {
        type: "line",
        data: { labels: [], datasets: [{ label, data: [], borderColor: color, tension: 0.3, fill: false, pointRadius: 2 }] },
        options: { animation: { duration: 300 }, scales: { x: { display: false }, y: { beginAtZero: false } }, plugins: { legend: { display: false } } }
    });
}

function update() {
    const now = new Date().toLocaleTimeString();
    Object.entries(sensors).forEach(([key, s]) => {
        const val = generateReading(s);
        s.data.push(val);
        if (s.data.length > MAX_POINTS) s.data.shift();
        s.chart.data.labels.push(now);
        s.chart.data.datasets[0].data.push(val);
        if (s.chart.data.labels.length > MAX_POINTS) { s.chart.data.labels.shift(); s.chart.data.datasets[0].data.shift(); }
        s.chart.update();
        document.getElementById(key === "temperature" ? "tempValue" : key === "humidity" ? "humidValue" : "pressValue").textContent = `${val} ${s.unit}`;
    });
}

sensors.temperature.chart = initChart("tempChart", "Temperature", "#e74c3c");
sensors.humidity.chart = initChart("humidChart", "Humidity", "#3498db");
sensors.pressure.chart = initChart("pressChart", "Pressure", "#2ecc71");
update();
setInterval(update, 2000);
```

### Output: README.md

```markdown
# Real-Time Sensor Dashboard

## What This Demonstrates
Browser-based dashboard visualizing simulated sensor data updating every 2 seconds using Chart.js.

## Prerequisites
A modern web browser (Chrome, Firefox, Safari, Edge).

## Setup and Run
Open index.html in a browser. No build step or server required.

## Usage
1. Open the page. Three charts show sensor readings.
2. Charts update every 2 seconds with new simulated data.
```

## Error Handling

- **CDN unavailable**: Download the library locally to `js/` and reference the local copy.
- **CORS errors with local files**: Run a local server: `npx serve .` or `python -m http.server 8000`.
- **Port conflicts**: Catch `EADDRINUSE` and increment the port. Log the actual port to the console.
