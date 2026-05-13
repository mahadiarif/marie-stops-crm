# Ubuntu Deployment Guide: Marie Stopes CRM

This guide provides step-by-step instructions to deploy the Marie Stopes CRM (FastAPI backend + React frontend) on an Ubuntu 22.04+ server.

## Prerequisites

- Ubuntu 22.04+ Server
- Python 3.10+
- Node.js 18+ & npm
- Nginx
- Git

---

## 1. System Update & Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx git
```

## 2. Clone the Repository

```bash
cd /var/www
sudo git clone https://github.com/mahadiarif/marie-stops-crm.git
sudo chown -R $USER:$USER /var/www/marie-stops-crm
cd /var/www/marie-stops-crm
```

## 3. Backend Setup (FastAPI)

### Create Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn  # Recommended for production
```

### Seed Initial Data (Optional)
```bash
python3 seed.py
```

### Setup Systemd Service for Backend
Create a service file to keep the backend running:

```bash
sudo nano /etc/systemd/system/mscrm-backend.service
```

Paste the following (replace `youruser` with your Ubuntu username):
```ini
[Unit]
Description=Gunicorn instance to serve Marie Stopes CRM API
After=network.target

[Service]
User=youruser
Group=www-data
WorkingDirectory=/var/www/marie-stops-crm/backend
Environment="PATH=/var/www/marie-stops-crm/backend/venv/bin"
ExecStart=/var/www/marie-stops-crm/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

**Start the service:**
```bash
sudo systemctl start mscrm-backend
sudo systemctl enable mscrm-backend
```

---

## 4. Frontend Setup (React + Vite)

### Install Dependencies & Build
```bash
cd /var/www/marie-stops-crm
npm install
# Set your server's public IP or Domain for the API
echo "VITE_API_URL=http://your-server-ip:8000" > .env
npm run build
```
This creates a `dist/` folder in the root directory.

---

## 5. Nginx Configuration

Create a configuration file for the CRM:

```bash
sudo nano /etc/nginx/sites-available/mscrm
```

Paste the following:
```nginx
server {
    listen 80;
    server_name your-server-ip-or-domain;

    # Frontend (React)
    location / {
        root /var/www/marie-stops-crm/dist;
        index index.html;
        try_files $uri /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable the site and restart Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/mscrm /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Security (Firewall)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 8000
```

## Summary
- **Frontend:** Accessible at `http://your-server-ip`
- **Backend API:** Accessible at `http://your-server-ip:8000` or proxied via `http://your-server-ip/api/` (Update `src/config.js` or `.env` if using the proxy).
