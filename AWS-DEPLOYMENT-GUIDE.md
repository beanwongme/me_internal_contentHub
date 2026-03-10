# AWS Deployment Guide - ContentHub

A simple step-by-step guide to deploy this project to AWS EC2 with a public IP.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS EC2 Instance                          │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │  Nginx (Port 80) │───────►│  Static Files    │            │
│  │  - Serves React  │        │  (Built App)     │            │
│  └──────────────────┘        └──────────────────┘            │
│           │                                                  │
│           │ /api/*                                           │
│           ▼                                                  │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │  Node.js Server  │───────►│  Kimi AI API     │            │
│  │  (Port 3001)     │        │  (External)      │            │
│  └──────────────────┘        └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
    Public IP: 3.XX.XX.XX
```

---

## Prerequisites

- AWS Account
- Your Kimi API Key (already configured in `proxy-server/.env`)

---

## Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Name**: `contenthub-server`
3. **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance type**: `t3.micro` (or `t2.micro` for free tier)
5. **Key pair**: Create new or select existing (you'll need this to SSH)
6. **Network settings**:
   - VPC: Default
   - Auto-assign public IP: **Enable**
   - Security group: Create new
     - **Inbound rules**:
       - Type: SSH, Source: My IP
       - Type: HTTP, Source: Anywhere (0.0.0.0/0)
       - Type: HTTPS, Source: Anywhere (0.0.0.0/0)
7. **Launch instance**

---

## Step 2: Connect to Your Server

```bash
# Replace with your key file and public IP
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify installations
node -v   # Should show v20.x.x
npm -v    # Should show 10.x.x
```

---

## Step 4: Upload Project Files

**From your local machine** (in a new terminal):

```bash
# 1. Build your app first
cd app
npm run build

# 2. Create a deployment package
cd ..
mkdir -p deploy
mkdir -p deploy/proxy-server
mkdir -p deploy/app-dist

# 3. Copy files
cp -r proxy-server/* deploy/proxy-server/
cp -r app/dist/* deploy/app-dist/

# 4. Create .env for production
cat > deploy/proxy-server/.env << 'EOF'
PORT=3001
KIMI_API_KEY=your-actual-api-key-here
KIMI_API_URL=https://api.moonshot.cn/v1
ALLOWED_ORIGINS=*
EOF

# 5. Upload to EC2 (replace YOUR_EC2_PUBLIC_IP)
scp -i your-key.pem -r deploy/* ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/
```

---

## Step 5: Setup on Server

**Back on your EC2 server**:

```bash
# Install proxy server dependencies
cd ~/proxy-server
npm install --production

# Test the server
npm start
# Press Ctrl+C after confirming it works

# Start with PM2 (keeps it running)
pm2 start server.js --name "proxy-server"
pm2 save
pm2 startup
```
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
---

## Step 6: Configure Nginx

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Create new config
sudo tee /etc/nginx/sites-available/contenthub << 'EOF'
server {
    listen 80;
    server_name _;

    # Serve static files (React app)
    location / {
        root /home/ubuntu/app-dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js server
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/contenthub /etc/nginx/sites-enabled/

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7: Access Your App

🎉 **Done!** Open your browser to:

```
http://YOUR_EC2_PUBLIC_IP
```

**Find your public IP** in AWS Console → EC2 → Instances → select instance

---

## Useful Commands

```bash
# Check proxy server logs
pm2 logs proxy-server

# Restart proxy server
pm2 restart proxy-server

# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Optional: Add HTTPS (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

> Note: You need a domain name pointing to your EC2 IP for HTTPS to work.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't access site | Check Security Group (port 80 open) |
| 502 Bad Gateway | Check if proxy server is running: `pm2 status` |
| API not working | Check proxy logs: `pm2 logs` |
| Changes not showing | Clear browser cache or check Nginx config |

---

## Quick Reference

| Component | Local (Dev) | AWS (Production) |
|-----------|-------------|------------------|
| Frontend | `localhost:5173` | `http://EC2_IP` (Nginx port 80) |
| Proxy API | `localhost:3001` | `http://EC2_IP/api/` (via Nginx) |
| API Key | `.env` file | `.env` file on EC2 |
