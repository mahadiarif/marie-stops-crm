# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

# Marie Stopes CRM

A professional administrative portal for managing appointments, client logs, and system settings.

## Project Structure
- `backend/`: FastAPI backend with SQLite database.
- `src/`: React frontend built with Vite.
- `public/`: Static assets.

## Local Setup

### Backend
1. Navigate to the `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate it:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Seed the database: `python seed.py`
6. Start the server: `python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

### Frontend
1. Navigate to the root directory.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Access at `http://localhost:5173`

## Deployment
See `ubuntu_deployment.md` for detailed Ubuntu server deployment instructions.
