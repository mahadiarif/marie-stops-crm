# Marie Stopes CRM

Appointment management, discount tracking, and clinic data portal for Marie Stopes Bangladesh.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Backend | FastAPI + Uvicorn |
| Database | SQLite (local) / MySQL (production) |
| Auth | JWT (HS256) |
| Hosting | Ubuntu VPS + Nginx |

---

## Quick Start — Local Development

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py          # seed demo data (run once)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 2. Frontend

```bash
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Quick Start — Production Server

### Pull latest & rebuild

```bash
cd /var/www/html/marie-stops-crm
git pull origin main
npm run build
```

### Restart backend

```bash
pkill -f uvicorn
cd /var/www/html/marie-stops-crm/backend
nohup uvicorn main:app --host 0.0.0.0 --port 8000 &
```

### Verify backend is up

```bash
curl http://localhost:8000/docs
```

---

## First-Time Server Setup

```bash
# 1. Clone
git clone https://github.com/mahadiarif/marie-stops-crm.git /var/www/html/marie-stops-crm
cd /var/www/html/marie-stops-crm

# 2. Install Python dependencies
cd backend
pip install -r requirements.txt
pip install python-dotenv

# 3. Seed demo data
python3 seed.py

# 4. Start backend
nohup uvicorn main:app --host 0.0.0.0 --port 8000 &

# 5. Build frontend
cd ..
npm install
npm run build
```

---

## Demo Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager | manager123 | Manager |
| zeba | staff123 | Staff (Agent: Zeba Akter) |
| farhana | staff123 | Staff (Agent: Farhana Islam) |
| riya | staff123 | Staff (Agent: Riya Ahmed) |
| clinic1 | clinic123 | Clinic (Premium Dhanmondi) |
| clinic2 | clinic123 | Clinic (Premium Mirpur-10) |
| clinic3 | clinic123 | Clinic (Chattogram Centre) |

---

## Project Structure

```
marie-stops-crm/
├── backend/
│   ├── main.py          # FastAPI routes & endpoints
│   ├── models.py        # SQLAlchemy ORM models
│   ├── database.py      # DB connection (SQLite/MySQL)
│   ├── auth.py          # JWT auth helpers
│   ├── seed.py          # Demo data seeder
│   └── requirements.txt
├── src/
│   ├── api/             # axiosClient config
│   ├── context/         # AppDataContext, AuthContext, PermissionsContext
│   ├── layout/          # Layout, sidebar, header
│   └── pages/           # All page components
├── public/
└── dist/                # Production build output
```

---

## Key Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login, returns JWT |
| GET | `/appointments` | List appointments |
| POST | `/appointments` | Create appointment |
| GET | `/appointments/{id}/visits` | Get existing visits |
| GET | `/waivers` | List discounts |
| POST | `/waivers` | Create discount |
| GET | `/users` | List users (admin/manager) |
| POST | `/auth/register` | Register user (admin/manager) |
| GET | `/settings` | List all settings |
| POST | `/settings` | Add setting value |

---

## Database — Add Missing Columns (if needed)

If new columns are missing on the server after a pull:

```bash
cd /var/www/html/marie-stops-crm/backend
python3 -c "
from database import engine, Base
import models
Base.metadata.create_all(bind=engine)
print('Tables updated')
"
```

For SQLite manual column add:

```bash
python3 -c "
from database import engine
from sqlalchemy import text
with engine.connect() as c:
    c.execute(text('ALTER TABLE waivers ADD COLUMN discount_client_id VARCHAR(100)'))
    c.commit()
    print('done')
"
```

---

## RBAC — Role Permissions

| Feature | Admin | Manager | Staff | Clinic |
|---------|-------|---------|-------|--------|
| Appointments | ✓ | ✓ | ✓ | ✓ |
| Discount Tracking | ✓ | ✓ | — | ✓ |
| Clinic Data | ✓ | ✓ | — | ✓ |
| Reports | ✓ | ✓ | — | — |
| Users | ✓ | ✓ | — | — |
| Agents | ✓ | ✓ | — | — |
| Settings | ✓ | — | — | — |

---

## Deployment Details

See `ubuntu_deployment.md` for full Nginx + systemd setup.

---

*Developed & maintained by MetroNet Bangladesh Ltd.*
