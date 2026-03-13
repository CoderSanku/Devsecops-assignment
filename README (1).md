# DevSecOps Assignment – AI-Assisted Secure CI/CD Pipeline with Human-in-the-Loop

In this project, I created an end-to-end **DevSecOps CI/CD pipeline** with **AI-powered security remediation** and **Human-in-the-Loop approval gates** using *Git, GitHub, Jenkins, Trivy, Groq AI (llama-3.3-70b), Terraform, Docker, and AWS EC2* to achieve automated secure infrastructure deployment.

> **What makes this unique?**  
> No existing open-source project combines **Trivy IaC scanning + AI dynamic fix generation + Human approval gates** in a single pipeline. This mirrors how **GitHub Copilot Autofix** works at enterprise level — built entirely with free tools.

---

## Project Architecture

![Architecture Diagram](/Media/architecture.png)

---

## Pipeline Flow

1. Developer writes code and containerizes app using **Docker**
2. Code is pushed to **GitHub** repository
3. **Jenkins** pipeline is triggered automatically
4. **Trivy** scans Terraform IaC files for HIGH and CRITICAL vulnerabilities
5. ⏸️ **Human Approval Gate 1** — Engineer reviews vulnerability report and approves sending to AI
6. **Groq AI (llama-3.3-70b)** reads the actual Trivy JSON report and dynamically rewrites secure Terraform code
7. ⏸️ **Human Approval Gate 2** — Engineer reviews AI-suggested fix before applying to codebase
8. AI fix is applied to `main.tf` and **Trivy re-scans** — must show 0 vulnerabilities
9. Secured code is pushed back to **GitHub**
10. ⏸️ **Human Approval Gate 3** — Final approval before deploying to cloud
11. **Terraform** provisions secure VPC, Security Group, and EC2 instance on **AWS**
12. Users access the live application through the EC2 public IP

---

## Prerequisites

1. Git & GitHub
2. Docker Desktop
3. Jenkins (running in Docker)
4. Groq API Key — [console.groq.com](https://console.groq.com) (free)
5. AWS Account with CLI configured
6. Terraform

---

# Want to create this Project yourself? Follow these steps:

## Step 1: Installation

### Stage-01: Clone Repository and Set Up Node.js App

```bash
git clone https://github.com/CoderSanku/DevSecOps-Assignment.git
cd DevSecOps-Assignment
```

App runs on port 3000. To run locally:

```bash
cd app
npm install
node server.js
```

Open browser: `http://localhost:3000`

![App Running](/Media/ss7.png)

---

### Stage-02: Install Jenkins in Docker

```bash
docker run -u root -d --name jenkins \
  -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

Open Jenkins: `http://localhost:8080`

After installation, install suggested plugins.

![Jenkins Dashboard](/Media/jenkins.png)

---

### Stage-03: Build Docker Image

```bash
docker build -t devsecops-app .
docker run -d -p 3000:3000 devsecops-app
```

The Dockerfile uses a **multi-stage build** with a non-root user `nodeuser:1001` for security.

---

### Stage-04: Install Trivy for IaC Scanning

Trivy is installed automatically inside the Jenkins pipeline. To install manually:

```bash
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update && sudo apt-get install trivy
```

To scan Terraform files:

```bash
trivy config --format json -o trivy-report.json ./terraform/
```

---

### Stage-05: Set Up Groq AI API

1. Go to [console.groq.com](https://console.groq.com) and create a free account
2. Generate an API key
3. Add to Jenkins credentials as `groq-api-key` (Secret text)

**Why Groq AI?**  
Groq offers the fastest inference speed among free AI APIs. The `llama-3.3-70b-versatile` model understands Terraform HCL and generates accurate security fixes. Unlike static fix templates, Groq reads the actual Trivy JSON report and generates a dynamic fix specific to the vulnerabilities found.

---

### Stage-06: Configure AWS CLI

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, region (`ap-south-1`), and output format (`json`).

---

## Step 2: Jenkins Credentials Setup

Add the following credentials in **Jenkins > Manage Jenkins > Credentials > System > Global**:

| Credential ID | Type | Value |
|---|---|---|
| `groq-api-key` | Secret text | Groq API Key |
| `github-credentials` | Username + Password | GitHub username + Personal Access Token |
| `aws-access-key` | Secret text | AWS Access Key ID |
| `aws-secret-key` | Secret text | AWS Secret Access Key |

![Jenkins Credentials](/Media/credentials.png)

---

## Step 3: Pipeline Creation

### Stage-01: Checkout

```groovy
stage('Checkout') {
    steps {
        git branch: 'main', url: 'https://github.com/CoderSanku/DevSecOps-Assignment'
    }
}
```

---

### Stage-02: Install Tools

```groovy
stage('Install Tools') {
    steps {
        sh '''
            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
            wget -O terraform.zip https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
            unzip -o terraform.zip -d /usr/local/bin/
        '''
    }
}
```

---

### Stage-03: Trivy IaC Scan

```groovy
stage('Trivy IaC Scan') {
    steps {
        sh '''
            trivy config --severity HIGH,CRITICAL \
              --format json -o /tmp/trivy-report.json ./terraform/
        '''
    }
}
```

Trivy finds **5 intentional vulnerabilities** in the Terraform code:

![Trivy Scan - 5 Vulnerabilities Found](/Media/ss1.png)

---

### Stage-04: Human Approval — Send to AI?

```groovy
stage('Human Approval: Send to AI?') {
    steps {
        input message: '⚠️ Trivy found vulnerabilities. Send report to Groq AI for fix?',
              ok: 'Yes, Send to AI'
    }
}
```

Pipeline pauses and waits for engineer to review and approve:

![Human Approval Gate 1](/Media/ss2.png)

---

### Stage-05: Groq AI Remediation

```groovy
stage('Groq AI Suggests Fix') {
    steps {
        withCredentials([string(credentialsId: 'groq-api-key', variable: 'GROQ_KEY')]) {
            sh '''
                python3 << 'PYEOF'
import json, urllib.request

with open('/tmp/trivy-report.json') as f:
    report = json.load(f)

with open('terraform/main.tf') as f:
    main_tf = f.read()

summary = []
for result in report.get('Results', []):
    for m in result.get('Misconfigurations', []):
        summary.append(f"{m['ID']} ({m['Severity']}): {m['Title']}")

payload = json.dumps({
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "system", "content": "You are a DevSecOps expert. Fix ALL vulnerabilities. Return ONLY valid HCL Terraform code. No markdown, no explanation."},
        {"role": "user", "content": f"Fix these:\\n{'\\n'.join(summary)}\\n\\nCode:\\n{main_tf}"}
    ],
    "max_tokens": 4000,
    "temperature": 0.1
}).encode()

req = urllib.request.Request(
    'https://api.groq.com/openai/v1/chat/completions',
    data=payload,
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer $GROQ_KEY'}
)
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read())

fixed_code = result['choices'][0]['message']['content']
with open('/tmp/fixed_main.tf', 'w') as f:
    f.write(fixed_code)
print("Groq AI fix generated successfully")
PYEOF
            '''
        }
    }
}
```

Groq AI reads the actual Trivy JSON report and dynamically generates a secure Terraform file:

![Groq AI Fix Generated](/Media/ss3.png)

---

### Stage-06: Human Approval — Apply AI Fix?

```groovy
stage('Human Approval: Apply AI Fix?') {
    steps {
        input message: 'AI has suggested a fix. Review /tmp/fixed_main.tf — Apply it?',
              ok: 'Yes, Apply Fix'
    }
}
```

![Human Approval Gate 2](/Media/ss4.png)

---

### Stage-07: Apply Fix + Trivy Re-Scan

```groovy
stage('Apply Fix & Re-Scan') {
    steps {
        sh 'cp /tmp/fixed_main.tf terraform/main.tf'
        sh 'trivy config --severity HIGH,CRITICAL --format json -o /tmp/trivy-rescan.json ./terraform/'
    }
}
```

After AI fix — Trivy finds **0 vulnerabilities**:

![Trivy Re-Scan - 0 Vulnerabilities](/Media/ss5.png)

---

### Stage-08: Push Secured Code to GitHub

```groovy
stage('Push Fix to GitHub') {
    steps {
        withCredentials([usernamePassword(credentialsId: 'github-credentials',
            usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
            sh '''
                git config user.email "jenkins@devsecops"
                git config user.name "Jenkins Pipeline"
                git add terraform/main.tf
                git commit -m "fix: AI-remediated security vulnerabilities [Jenkins Build #$BUILD_ID]"
                git push https://$GIT_USER:$GIT_TOKEN@github.com/CoderSanku/DevSecOps-Assignment.git HEAD:main
            '''
        }
    }
}
```

---

### Stage-09: Human Approval — Deploy to AWS?

```groovy
stage('Human Approval: Deploy to AWS?') {
    steps {
        input message: 'Secured infrastructure ready. Deploy to AWS EC2?',
              ok: 'Yes, Deploy to AWS'
    }
}
```

---

### Stage-10: Terraform Apply — AWS Deployment

```groovy
stage('Deploy to AWS') {
    steps {
        withCredentials([
            string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
            sh '''
                cd terraform
                terraform init
                terraform apply -auto-approve -input=false
                terraform output
            '''
        }
    }
}
```

Find the complete Jenkinsfile here: [jenkins/Jenkinsfile](https://github.com/CoderSanku/DevSecOps-Assignment/blob/main/jenkins/Jenkinsfile)

---

## Step 4: Project Output

### Jenkins Pipeline — All Stages SUCCESS

![Jenkins All Stages Green](/Media/ss6.png)

---

### Trivy Initial Scan — 5 Vulnerabilities Found

```
main.tf (terraform)
Tests: 5 (SUCCESSES: 0, FAILURES: 5)

AWS-0028 (HIGH)     Instance does not require IMDS access token
AWS-0104 (CRITICAL) Unrestricted egress rule allows all traffic
AWS-0107 (HIGH)     An ingress security group rule allows traffic from /0
AWS-0131 (HIGH)     Root block device is not encrypted
AWS-0164 (HIGH)     Subnet associates public IP address
```

![Trivy Initial Scan](/Media/ss1.png)

---

### Groq AI Fix — Actual Code Generated Dynamically

Groq AI (llama-3.3-70b) reads the Trivy JSON report and generates a fixed `main.tf`:

| Vulnerability | AI Fix Applied |
|---|---|
| IMDSv2 not required | `http_tokens = "required"` added to metadata_options |
| Unrestricted egress | Egress CIDR restricted |
| SSH open to internet | Ingress restricted |
| Root volume not encrypted | `encrypted = true` + KMS key |
| Public IP auto-assign | `map_public_ip_on_launch = false` |

![AI Generated Fix](/Media/ss3.png)

---

### Trivy Re-Scan — 0 Vulnerabilities

```
main.tf (terraform)
Tests: 5 (SUCCESSES: 5, FAILURES: 0)
No HIGH or CRITICAL vulnerabilities found!
```

![Trivy Re-Scan 0 Vulnerabilities](/Media/ss5.png)

---

### Application Live on AWS EC2

**URL:** `http://13.126.144.121:3000`

![App Live on AWS](/Media/ss7.png)

---

## AI Usage Log

### Why Groq AI?

| Option | Cost | Speed | Privacy |
|---|---|---|---|
| Groq API (used) | Free | Fastest (700 tok/s) | Cloud |
| OpenAI GPT-4 | Paid | Fast | Cloud |
| Ollama + Llama3 (local) | Free | Moderate | On-premise |
| AWS Bedrock | Paid | Fast | Private VPC |

### Groq vs Local LLM (Ollama) for Enterprise

In this project, the Groq cloud API is used because it is free and fast for a demo. However, in a real production environment, sending Terraform code to an external API is a security risk — it reveals your cloud architecture to a third party.

**Production-grade solution — Run Ollama locally inside Jenkins:**

```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
docker exec -it ollama ollama pull llama3

# Replace Groq API call in Jenkinsfile with:
curl http://localhost:11434/api/generate \
  -d '{"model":"llama3","prompt":"Fix this Terraform..."}'
```

Zero data leaves your network. Same AI capability. This is how enterprise DevSecOps teams implement AI-assisted remediation.

---

## Alternative Tools & Enterprise Scale

### Security Scanning Alternatives

| Tool | Purpose | When to Use Over Trivy |
|---|---|---|
| **SonarQube** | Code quality + security | When you need code smells, coverage, and bug metrics |
| **Checkov** | Terraform/K8s IaC | More customizable policy enforcement |
| **Snyk** | Dependencies + IaC | When scanning npm/pip packages alongside infrastructure |
| **tfsec** | Terraform only | Faster for pure Terraform projects |

**SonarQube Integration Example:**

```groovy
stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube-server') {
            sh 'mvn sonar:sonar -Dsonar.projectKey=devsecops'
        }
    }
}
stage('Quality Gate') {
    steps {
        timeout(time: 1, unit: 'HOURS') {
            waitForQualityGate abortPipeline: true
        }
    }
}
```

---

### Secrets Management — HashiCorp Vault

This project uses Jenkins credentials for simplicity. In production, **HashiCorp Vault** provides secret rotation, audit logs, and fine-grained access control:

```bash
vault write secrets/creds/groq api_key=your-groq-key
vault write secrets/creds/aws access_key=xxx secret_key=yyy
```

```groovy
withVault(vaultSecrets: [[path: 'secrets/creds/groq',
    secretValues: [[vaultKey: 'api_key', envVar: 'GROQ_KEY']]]]) {
    sh 'python3 groq_fix.py'
}
```

---

### Container Orchestration — Kubernetes

This project deploys to a single EC2 instance. At scale, **Kubernetes (EKS)** provides auto-scaling, self-healing, and rolling deployments:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: devsecops-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: devsecops
  template:
    spec:
      containers:
      - name: app
        image: codersanku/devsecops-app:latest
        ports:
        - containerPort: 3000
```

```groovy
stage('Deploy to K8s') {
    steps {
        kubernetesDeploy configs: 'kubernetes-deployment.yaml',
                        kubeconfigId: 'kubernetes'
    }
}
```

---

### Full Enterprise Scale Comparison

| Component | This Project | Enterprise Scale |
|---|---|---|
| CI/CD | Jenkins | Jenkins + ArgoCD (GitOps) |
| IaC Scanner | Trivy | Trivy + SonarQube + Checkov |
| AI Remediation | Groq Cloud API | Self-hosted Ollama + Llama3 |
| Secrets | Jenkins Credentials | HashiCorp Vault |
| Deployment | Single EC2 | Kubernetes (AWS EKS) |
| Notifications | Console output | Slack / MS Teams |
| State Management | Local tfstate | Terraform Cloud / S3 backend |
| Approvals | Jenkins input step | PagerDuty / ServiceNow |

---

## Project Structure

```
DevSecOps-Assignment/
├── app/
│   ├── server.js              # Node.js app with pipeline dashboard UI
│   ├── package.json
│   └── Dockerfile             # Multi-stage build, non-root user
├── terraform/
│   ├── main.tf                # Infrastructure with 5 intentional vulnerabilities
│   ├── variables.tf           # Region, AMI, key pair
│   └── outputs.tf             # Public IP, app URL
├── jenkins/
│   └── Jenkinsfile            # 10-stage pipeline with Human-in-the-Loop
└── docker-compose.yml
```

---

## Screenshots

| Screenshot | Stage |
|---|---|
| ![](/Media/ss1.png) | Trivy scan — 5 vulnerabilities found |
| ![](/Media/ss2.png) | Human Approval Gate 1 — pause screen |
| ![](/Media/ss3.png) | Groq AI generated fix in console |
| ![](/Media/ss4.png) | Human Approval Gate 2 — review AI fix |
| ![](/Media/ss5.png) | Trivy re-scan — 0 vulnerabilities |
| ![](/Media/ss6.png) | All pipeline stages green — SUCCESS |
| ![](/Media/ss7.png) | App live at EC2 public IP |

---

## Demo Video

Full pipeline walkthrough — vulnerabilities detected, AI fix generated, human approvals, live AWS deployment.

```
https://drive.google.com/YOUR_VIDEO_LINK
```

---

## Learning Outcomes

- **Shift-Left Security** — Scan infrastructure before deployment, not after
- **Human-in-the-Loop AI** — AI suggests fixes, engineers make final decisions
- **Dynamic AI Remediation** — No hardcoded fixes, AI reads actual scan output and generates real code
- **Infrastructure as Code** — All AWS resources version-controlled in Terraform
- **Defense in Depth** — IaC scanning + encryption + restricted network access + IMDSv2
- **GitOps** — Secured code committed back to GitHub after AI remediation

---

*Built by Sanket Hanchate | DevSecOps Assignment | AWS ap-south-1 Mumbai*
