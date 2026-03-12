const express = require('express');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DevSecOps Demo</title>
      <style>
        body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; 
               display: flex; justify-content: center; align-items: center; 
               min-height: 100vh; margin: 0; }
        .card { background: #1e293b; border-radius: 12px; padding: 2rem; 
                max-width: 600px; width: 90%; }
        h1 { color: #38bdf8; }
        .badge { background: #22c55e; color: white; padding: 4px 12px; 
                 border-radius: 99px; font-size: 0.8rem; }
        .info { background: #0f172a; border-radius: 8px; padding: 1rem; margin-top: 1rem; }
        .label { color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚀 DevSecOps App <span class="badge">Live</span></h1>
        <p>Deployed via Jenkins CI/CD Pipeline with Terraform on AWS</p>
        <div class="info">
          <p><span class="label">Host:</span> ${os.hostname()}</p>
          <p><span class="label">Platform:</span> ${os.platform()}</p>
          <p><span class="label">Node:</span> ${process.version}</p>
          <p><span class="label">Time:</span> ${new Date().toISOString()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});