const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DevSecOps Pipeline</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a14; color: #fff; min-height: 100vh; }

  .topbar { background: #111127; border-bottom: 1px solid #1e1e3a; padding: 14px 2rem; display: flex; justify-content: space-between; align-items: center; }
  .topbar-title { font-size: 16px; font-weight: 600; color: #fff; }
  .topbar-right { display: flex; gap: 12px; align-items: center; }
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block; margin-right: 6px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .live-text { font-size: 13px; color: #4ade80; }
  .region { font-size: 12px; color: #888; background: #1a1a2e; padding: 4px 10px; border-radius: 6px; }

  .hero { text-align: center; padding: 3rem 2rem 2rem; }
  .hero h1 { font-size: 36px; font-weight: 700; background: linear-gradient(135deg, #60a5fa, #a78bfa, #4ade80); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
  .hero p { font-size: 15px; color: #888; max-width: 600px; margin: 0 auto; }
  .hero-sub { font-size: 13px; color: #555; margin-top: 8px; }

  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 0 2rem 2rem; max-width: 900px; margin: 0 auto; }
  .metric { background: #111127; border: 1px solid #1e1e3a; border-radius: 12px; padding: 1.2rem; text-align: center; }
  .metric-val { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  .metric-label { font-size: 12px; color: #888; }
  .blue { color: #60a5fa; } .purple { color: #a78bfa; } .green { color: #4ade80; } .amber { color: #fbbf24; }

  .section { padding: 0 2rem 2.5rem; max-width: 1000px; margin: 0 auto; }
  .section-title { font-size: 13px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 1.2rem; }

  .tools-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
  .tool { background: #111127; border: 1px solid #1e1e3a; border-radius: 12px; padding: 1rem 0.5rem; text-align: center; transition: border-color .2s; }
  .tool:hover { border-color: #3a3a6a; }
  .tool-icon { width: 40px; height: 40px; border-radius: 10px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
  .tool-name { font-size: 12px; font-weight: 600; color: #fff; }
  .tool-role { font-size: 10px; color: #666; margin-top: 2px; }

  .arch { background: #0d0d1f; border: 1px solid #1e1e3a; border-radius: 16px; padding: 2rem; }
  .arch-row { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; }
  .arch-box { background: #111127; border: 1px solid #1e1e3a; border-radius: 10px; padding: 10px 14px; text-align: center; min-width: 100px; }
  .arch-box-title { font-size: 12px; font-weight: 600; color: #fff; }
  .arch-box-sub { font-size: 10px; color: #666; margin-top: 2px; }
  .arch-arrow { color: #3a3a6a; font-size: 20px; padding: 0 6px; }
  .arch-human { border-color: #fbbf24; }
  .arch-human .arch-box-title { color: #fbbf24; }
  .arch-ai { border-color: #a78bfa; }
  .arch-ai .arch-box-title { color: #a78bfa; }
  .arch-secure { border-color: #4ade80; }
  .arch-secure .arch-box-title { color: #4ade80; }
  .arch-deploy { border-color: #60a5fa; }
  .arch-deploy .arch-box-title { color: #60a5fa; }

  .arch-row-2 { margin-top: 1.2rem; }
  .arch-label { font-size: 10px; color: #555; text-align: center; margin-top: 1rem; }

  .flow { display: flex; flex-direction: column; gap: 8px; }
  .flow-item { display: flex; align-items: center; gap: 14px; background: #111127; border: 1px solid #1e1e3a; border-radius: 10px; padding: 12px 16px; }
  .flow-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .flow-content { flex: 1; }
  .flow-title { font-size: 13px; font-weight: 600; color: #fff; }
  .flow-desc { font-size: 11px; color: #666; margin-top: 2px; }
  .flow-badge { font-size: 10px; padding: 3px 10px; border-radius: 10px; flex-shrink: 0; }

  .footer { background: #111127; border-top: 1px solid #1e1e3a; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .footer-item { font-size: 12px; color: #555; }
  .footer-item span { color: #888; }
</style>
</head>
<body>

<div class="topbar">
  <div class="topbar-title">DevSecOps Pipeline — Sanket Hanchate</div>
  <div class="topbar-right">
    <span class="live-text"><span class="live-dot"></span>Live on AWS</span>
    <span class="region">ap-south-1 · Mumbai</span>
  </div>
</div>

<div class="hero">
  <h1>Automated Security Pipeline</h1>
  <p>End-to-end DevSecOps implementation with AI-assisted vulnerability remediation and human-in-the-loop approval system</p>
  <div class="hero-sub">Node.js · Docker · Jenkins · Trivy · Groq AI · Terraform · AWS EC2</div>
</div>

<div class="metrics">
  <div class="metric"><div class="metric-val blue">9</div><div class="metric-label">Pipeline Stages</div></div>
  <div class="metric"><div class="metric-val purple">3</div><div class="metric-label">Human Approvals</div></div>
  <div class="metric"><div class="metric-val amber">5</div><div class="metric-label">Vulns Detected</div></div>
  <div class="metric"><div class="metric-val green">0</div><div class="metric-label">After AI Fix</div></div>
</div>

<div class="section">
  <div class="section-title">Tools & Technologies</div>
  <div class="tools-grid">
    <div class="tool">
      <div class="tool-icon" style="background:#1e3a5f;color:#60a5fa">J</div>
      <div class="tool-name">Jenkins</div>
      <div class="tool-role">CI/CD</div>
    </div>
    <div class="tool">
      <div class="tool-icon" style="background:#0f3a2a;color:#4ade80">Tv</div>
      <div class="tool-name">Trivy</div>
      <div class="tool-role">IaC Scanner</div>
    </div>
    <div class="tool">
      <div class="tool-icon" style="background:#2a1a4a;color:#a78bfa">TF</div>
      <div class="tool-name">Terraform</div>
      <div class="tool-role">IaC</div>
    </div>
    <div class="tool">
      <div class="tool-icon" style="background:#3a2800;color:#fbbf24">AI</div>
      <div class="tool-name">Groq AI</div>
      <div class="tool-role">Remediation</div>
    </div>
    <div class="tool">
      <div class="tool-icon" style="background:#3a1a10;color:#fb923c">Dk</div>
      <div class="tool-name">Docker</div>
      <div class="tool-role">Container</div>
    </div>
    <div class="tool">
      <div class="tool-icon" style="background:#1a3a1a;color:#86efac">AWS</div>
      <div class="tool-name">AWS EC2</div>
      <div class="tool-role">Cloud</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Architecture & Workflow</div>
  <div class="arch">
    <div class="arch-row">
      <div class="arch-box">
        <div class="arch-box-title">GitHub</div>
        <div class="arch-box-sub">Source code</div>
      </div>
      <div class="arch-arrow">→</div>
      <div class="arch-box">
        <div class="arch-box-title">Jenkins</div>
        <div class="arch-box-sub">CI/CD trigger</div>
      </div>
      <div class="arch-arrow">→</div>
      <div class="arch-box">
        <div class="arch-box-title">Trivy Scan</div>
        <div class="arch-box-sub">Find vulns</div>
      </div>
      <div class="arch-arrow">→</div>
      <div class="arch-box arch-human">
        <div class="arch-box-title">Human Review</div>
        <div class="arch-box-sub">Approve AI fix</div>
      </div>
      <div class="arch-arrow">→</div>
      <div class="arch-box arch-ai">
        <div class="arch-box-title">Groq AI</div>
        <div class="arch-box-sub">Fix terraform</div>
      </div>
    </div>
    <div class="arch-row arch-row-2">
      <div class="arch-box arch-deploy">
        <div class="arch-box-title">AWS EC2</div>
        <div class="arch-box-sub">Live deploy</div>
      </div>
      <div class="arch-arrow">←</div>
      <div class="arch-box arch-deploy">
        <div class="arch-box-title">Terraform Apply</div>
        <div class="arch-box-sub">Provision infra</div>
      </div>
      <div class="arch-arrow">←</div>
      <div class="arch-box arch-human">
        <div class="arch-box-title">Human Approval</div>
        <div class="arch-box-sub">Deploy to AWS?</div>
      </div>
      <div class="arch-arrow">←</div>
      <div class="arch-box arch-secure">
        <div class="arch-box-title">Re-Scan</div>
        <div class="arch-box-sub">0 vulns verified</div>
      </div>
      <div class="arch-arrow">←</div>
      <div class="arch-box arch-human">
        <div class="arch-box-title">Human Review</div>
        <div class="arch-box-sub">Apply fix?</div>
      </div>
    </div>
    <div class="arch-label">Yellow = Human approval gates · Purple = AI remediation · Green = Security verified · Blue = Cloud deployment</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Pipeline Stages</div>
  <div class="flow">
    <div class="flow-item">
      <div class="flow-num" style="background:#1e3a5f;color:#60a5fa">1</div>
      <div class="flow-content"><div class="flow-title">Checkout</div><div class="flow-desc">Pull source code from GitHub repository</div></div>
      <div class="flow-badge" style="background:#1e3a5f;color:#60a5fa">Auto</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#1e3a5f;color:#60a5fa">2</div>
      <div class="flow-content"><div class="flow-title">Install Tools</div><div class="flow-desc">Install Trivy scanner and Terraform</div></div>
      <div class="flow-badge" style="background:#1e3a5f;color:#60a5fa">Auto</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#3a1a10;color:#fb923c">3</div>
      <div class="flow-content"><div class="flow-title">Trivy IaC Scan</div><div class="flow-desc">Scan Terraform files for HIGH and CRITICAL vulnerabilities</div></div>
      <div class="flow-badge" style="background:#3a1a10;color:#fb923c">Scan</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#3a2800;color:#fbbf24">4</div>
      <div class="flow-content"><div class="flow-title">Human Approval</div><div class="flow-desc">Engineer reviews vulnerability report — approves sending to AI</div></div>
      <div class="flow-badge" style="background:#3a2800;color:#fbbf24">Manual</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#2a1a4a;color:#a78bfa">5</div>
      <div class="flow-content"><div class="flow-title">Groq AI Remediation</div><div class="flow-desc">llama-3.3-70b analyzes report and rewrites secure Terraform code</div></div>
      <div class="flow-badge" style="background:#2a1a4a;color:#a78bfa">AI</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#3a2800;color:#fbbf24">6</div>
      <div class="flow-content"><div class="flow-title">Human Approval</div><div class="flow-desc">Engineer reviews AI-suggested fix before applying to codebase</div></div>
      <div class="flow-badge" style="background:#3a2800;color:#fbbf24">Manual</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#0f3a2a;color:#4ade80">7</div>
      <div class="flow-content"><div class="flow-title">Trivy Re-Scan</div><div class="flow-desc">Verify zero HIGH/CRITICAL vulnerabilities after AI fix</div></div>
      <div class="flow-badge" style="background:#0f3a2a;color:#4ade80">Verify</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#1e3a5f;color:#60a5fa">8</div>
      <div class="flow-content"><div class="flow-title">Push to GitHub</div><div class="flow-desc">Commit secured Terraform code back to repository</div></div>
      <div class="flow-badge" style="background:#1e3a5f;color:#60a5fa">Auto</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#3a2800;color:#fbbf24">9</div>
      <div class="flow-content"><div class="flow-title">Human Approval</div><div class="flow-desc">Final approval before deploying secured infrastructure to AWS</div></div>
      <div class="flow-badge" style="background:#3a2800;color:#fbbf24">Manual</div>
    </div>
    <div class="flow-item">
      <div class="flow-num" style="background:#1a3a1a;color:#86efac">10</div>
      <div class="flow-content"><div class="flow-title">Terraform Apply</div><div class="flow-desc">Provision secure VPC, Security Group, and EC2 instance on AWS</div></div>
      <div class="flow-badge" style="background:#1a3a1a;color:#86efac">Deploy</div>
    </div>
  </div>
</div>

<div class="footer">
  <div class="footer-item">Project: <span>DevSecOps Assignment</span></div>
  <div class="footer-item">By: <span>Sanket Hanchate</span></div>
  <div class="footer-item">Cloud: <span>AWS ap-south-1</span></div>
  <div class="footer-item">Instance: <span>t2.micro</span></div>
  <div class="footer-item">Port: <span>3000</span></div>
  <div class="footer-item" style="color:#4ade80">● Live</div>
</div>

</body>
</html>`);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'DevSecOps App Running!', region: 'ap-south-1' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
