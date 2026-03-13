const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><title>DevSecOps Dashboard</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif}
body{background:#0f0f1a;color:#fff;min-height:100vh;padding:2rem}
h1{font-size:28px;font-weight:600;margin-bottom:6px}
.sub{color:#888;font-size:14px;margin-bottom:2rem}
.badge{background:#1a3a2a;color:#4ade80;padding:4px 12px;border-radius:20px;font-size:12px;margin-left:10px}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:2rem}
.metric{background:#1a1a2e;border:1px solid #2a2a3e;border-radius:12px;padding:1rem}
.mlabel{font-size:12px;color:#888;margin-bottom:6px}
.mval{font-size:26px;font-weight:600}
.msub{font-size:11px;color:#666;margin-top:2px}
.red{color:#f87171}.green{color:#4ade80}.white{color:#fff}
.tools{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:2rem}
.tool{background:#1a1a2e;border:1px solid #2a2a3e;border-radius:12px;padding:1rem}
.ticon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;margin-bottom:8px}
.tname{font-size:14px;font-weight:600}
.tdesc{font-size:12px;color:#888;margin-top:2px}
.section{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px}
.vulns{margin-bottom:2rem}
.vrow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #1a1a2e}
.sev{font-size:10px;font-weight:600;padding:3px 10px;border-radius:10px}
.scrit{background:#3a1010;color:#f87171}
.shigh{background:#2a2000;color:#fbbf24}
.vid{font-size:12px;font-weight:600;min-width:90px}
.vdesc{font-size:12px;color:#888;flex:1}
.fixed{font-size:10px;padding:3px 10px;border-radius:10px;background:#1a3a2a;color:#4ade80}
.footer{background:#1a1a2e;border-radius:12px;padding:1rem 1.5rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
.fi{font-size:12px;color:#888}.fi span{color:#fff;font-weight:600}
.workflow{margin-bottom:2rem}
.steps{display:flex;flex-direction:column;gap:0}
.step{display:flex;gap:12px}
.sdot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0}
.sline{width:1px;height:20px;background:#2a2a3e;margin:2px auto}
.scont{padding-bottom:12px;padding-top:4px}
.stitle{font-size:13px;font-weight:600}
.sdet{font-size:12px;color:#888;margin-top:2px}
</style></head>
<body>
<h1>DevSecOps Dashboard <span class="badge">Live on AWS</span></h1>
<p class="sub">Automated security pipeline by Sanket Hanchate &nbsp;|&nbsp; AWS ap-south-1 &nbsp;|&nbsp; EC2: 3.108.223.227</p>

<div class="metrics">
<div class="metric"><div class="mlabel">Vulnerabilities Found</div><div class="mval red">5</div><div class="msub">Initial scan</div></div>
<div class="metric"><div class="mlabel">After AI Fix</div><div class="mval green">0</div><div class="msub">All resolved</div></div>
<div class="metric"><div class="mlabel">Pipeline Stages</div><div class="mval white">9</div><div class="msub">With approvals</div></div>
<div class="metric"><div class="mlabel">Security Status</div><div class="mval green" style="font-size:18px;padding-top:4px">Secured</div><div class="msub">Groq AI fixed</div></div>
</div>

<p class="section">Tools & Technologies</p>
<div class="tools">
<div class="tool"><div class="ticon" style="background:#1e3a5f;color:#60a5fa">J</div><div class="tname">Jenkins</div><div class="tdesc">CI/CD pipeline automation</div></div>
<div class="tool"><div class="ticon" style="background:#0f3a2a;color:#4ade80">T</div><div class="tname">Trivy</div><div class="tdesc">IaC security scanning</div></div>
<div class="tool"><div class="ticon" style="background:#2a1a4a;color:#a78bfa">TF</div><div class="tname">Terraform</div><div class="tdesc">AWS infrastructure as code</div></div>
<div class="tool"><div class="ticon" style="background:#3a2a00;color:#fbbf24">AI</div><div class="tname">Groq AI</div><div class="tdesc">Auto security remediation</div></div>
<div class="tool"><div class="ticon" style="background:#3a1a10;color:#fb923c">D</div><div class="tname">Docker</div><div class="tdesc">Containerized deployment</div></div>
<div class="tool"><div class="ticon" style="background:#1a3a1a;color:#86efac">AWS</div><div class="tname">AWS EC2</div><div class="tdesc">Cloud infrastructure</div></div>
</div>

<p class="section">Security Vulnerabilities — Fixed by AI</p>
<div class="vulns">
<div class="vrow"><span class="sev scrit">CRITICAL</span><span class="vid">AWS-0104</span><span class="vdesc">Unrestricted egress to any IP address</span><span class="fixed">Fixed</span></div>
<div class="vrow"><span class="sev shigh">HIGH</span><span class="vid">AWS-0107</span><span class="vdesc">SSH open to 0.0.0.0/0 — unrestricted ingress</span><span class="fixed">Fixed</span></div>
<div class="vrow"><span class="sev shigh">HIGH</span><span class="vid">AWS-0131</span><span class="vdesc">Root block device not encrypted</span><span class="fixed">Fixed</span></div>
<div class="vrow"><span class="sev shigh">HIGH</span><span class="vid">AWS-0164</span><span class="vdesc">Subnet auto-assigns public IP address</span><span class="fixed">Fixed</span></div>
<div class="vrow"><span class="sev shigh">HIGH</span><span class="vid">AWS-0028</span><span class="vdesc">IMDSv2 token not required on EC2 instance</span><span class="fixed">Fixed</span></div>
</div>

<div class="footer">
<div class="fi">Region: <span>ap-south-1</span></div>
<div class="fi">Instance: <span>t2.micro</span></div>
<div class="fi">App Port: <span>3000</span></div>
<div class="fi">Status: <span class="green">Live</span></div>
</div>
</body></html>`);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'DevSecOps App Running!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
