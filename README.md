# PetTrackCare Admin

Admin dashboard for PetTrackCare, built with Vue 3, Vite, and Vuetify. It now communicates with a FastAPI + PostgreSQL backend that handles authentication, moderation workflows, usage reporting, and other admin services.

## Features
- Admin-only login (JWT issued by FastAPI, role enforced server-side)
- Dashboard, User Management, Reports/Feedback, Usage Monitoring, Moderation, Settings
- Responsive UI with custom theme colors
- Secure logout via API token removal

## Tech Stack
- Vue 3 + Vite
- Vuetify 3 (Material Design UI)
- FastAPI + PostgreSQL (backend)
- Vue Router and vue-echarts for interactive analytics

## Setup
1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Point the dashboard to the FastAPI backend via `.env`:
   ```env
   VITE_FASTAPI_BASE_URL=http://localhost:8000
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Backend Environment
The FastAPI backend expects the following environment variables (copy into a `.env` file for backend deployments):

```
DATABASE_URL=postgresql://postgres:hershey@localhost:5432/pettrackcare
JWT_SECRET_KEY=replace-with-a-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FASTAPI_BASE_URL=http://192.168.100.23:8000
```

## Usage
- Login with an admin account (role must be 'Admin', validated by FastAPI)
- Use the sidebar to navigate between admin pages
- Logout securely from the navbar

## Project Structure
- `src/views/` - Main pages (Dashboard, Login, etc.)
- `src/components/` - Navbar, Sidebar, shared UI
- `src/apiClient.js` - FastAPI client helpers

## Customization
- Update theme colors in `src/main.js`
- Add new admin features in `src/views/`

## License
MIT
