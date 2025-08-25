
# PetTrackCare Admin

Admin dashboard for PetTrackCare, built with Vue 3, Vite, and Vuetify. Authenticates admins using Supabase and provides management features for users, reports, moderation, and platform settings.

## Features
- Admin-only login (Supabase Auth, role checked in public.users)
- Dashboard, User Management, Reports/Feedback, Usage Monitoring, Moderation, Settings
- Responsive UI with custom theme colors
- Secure logout

## Tech Stack
- Vue 3 + Vite
- Vuetify 3 (Material Design UI)
- Supabase (Auth & Database)
- Vue Router

## Setup
1. Clone the repo
2. Install dependencies:
	```bash
	npm install
	```
3. Add your Supabase credentials to `.env`:
	```env
	VITE_SUPABASE_URL=your-supabase-url
	VITE_SUPABASE_ANON_KEY=your-anon-key
	```
4. Start the dev server:
	```bash
	npm run dev
	```

## Usage
- Login with an admin account (role must be 'Admin' in public.users)
- Use the sidebar to navigate between admin pages
- Logout securely from the navbar

## Project Structure
- `src/views/` - Main pages (Dashboard, Login, etc.)
- `src/components/` - Navbar, Sidebar, shared UI
- `src/supabase.js` - Supabase client setup

## Customization
- Update theme colors in `src/main.js`
- Add new admin features in `src/views/`

## License
MIT
