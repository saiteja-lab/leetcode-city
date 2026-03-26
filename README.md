# LeetCode City Generator

LeetCode City Generator is a full-stack web app that turns LeetCode problem-solving stats into a shared 3D city.

- Each user becomes one building in a shared skyline
- Easy problems control building footprint and width
- Medium problems control tower floors and mid-height
- Hard problems control the top spire height

This version includes Supabase authentication and persistence:

- users can sign up and sign in
- each signed-in user can generate and save their own LeetCode city
- all signed-in users can browse the shared city board
- every username hashes into a consistent building archetype

Development mode now uses a local SQLite database instead of Supabase.

## Stack

### Frontend

- React with Vite
- Tailwind CSS
- Redux
- Axios
- Three.js
- Supabase JavaScript client

### Backend

- FastAPI
- Requests

### Database and Auth

- Supabase Auth
- Supabase Postgres

## Project Structure

```text
backend/
  app.py
  requirements.txt
  routes/
    user.py
  services/
    leetcode_api.py
  utils/
    city_generator.py

frontend/
  .env.example
  package.json
  src/
    App.jsx
    components/
      AuthForm.jsx
      InputForm.jsx
      CityCanvas.jsx
      StatsCard.jsx
      CommunityCities.jsx
    pages/
      Home.jsx
    services/
      api.js
      auth.js
      community.js
      supabase.js
    store/
      store.js
    utils/
      city.js

supabase/
  schema.sql
```

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- A Supabase project(1TazOOpS04U1hauL)

## First Run Guide

If this is your first time running the project, use this order:

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Add the Supabase keys to `frontend/.env`.
4. Install backend dependencies and start the FastAPI server.
5. Install frontend dependencies and start the Vite server.
6. Open the app, sign up, log in, and generate your city from a LeetCode username.

If you follow the steps below in order, the project should work on first run.

## Supabase Setup

### 1. Create a Supabase project

Create a new project in Supabase and copy:

- Project URL
- Anon public key

### 2. Create the database table and policies

Open the SQL Editor in Supabase and run the contents of:

`supabase/schema.sql`

This creates:

- the `cities` table
- an `updated_at` trigger
- row level security policies

The policies allow:

- authenticated users to read all saved cities
- each user to insert their own city
- each user to update only their own city

### 3. Enable email authentication

In Supabase Auth:

- enable Email provider
- optionally disable email confirmation during development if you want instant sign-in after signup

### 4. Add frontend environment variables

Create `frontend/.env` from `frontend/.env.example`:

```bash
cd frontend
copy .env.example .env
```

Set the values:

```env
VITE_APP_ENV=development
VITE_DEV_API_BASE_URL=http://localhost:8000
VITE_PROD_API_BASE_URL=https://your-production-api.example.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Environment behavior:

- `VITE_APP_ENV=development` uses the local backend from `VITE_DEV_API_BASE_URL`
- in development, auth and shared city storage use local SQLite and do not call Supabase
- `VITE_APP_ENV=production` uses `VITE_PROD_API_BASE_URL`
- in production, auth and shared city storage use Supabase
- if `VITE_APP_ENV` is not set, the frontend falls back to Vite's built-in dev/prod mode

## Step-By-Step Setup

### Step 1. Backend setup

Open a terminal in the project root:

```bash
cd backend
python -m pip install -r requirements.txt
```

Then start the backend:

```bash
python app.py
```

In development mode, this automatically creates a local SQLite database in:

```text
backend/development.sqlite3
```

You should now have the backend running at:

```text
http://localhost:8000
```

You can test it in the browser:

```text
http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

### Step 2. Frontend setup

Open a second terminal in the project root:

```bash
cd frontend
npm install
```

Then start the frontend:

```bash
npm run dev
```

The frontend should start at:

```text
http://localhost:5173
```

### Step 3. First login and first city

Once both servers are running:

1. Open `http://localhost:5173`
2. Sign up with email and password
3. If Supabase email confirmation is enabled, confirm the email first
4. Sign in
5. Enter a LeetCode username
6. Click `Generate City`
7. Your city will be saved into Supabase
8. The saved city will appear in the community list for all logged-in users

## How To Run Later

After the first-time setup is done, you only need these two terminals.

### Backend

```bash
cd backend
python app.py
```

### Frontend

```bash
cd frontend
npm run dev
```

## Running URLs

### Backend URL

```text
http://localhost:8000
```

### Backend health check

```text
http://localhost:8000/health
```

### Frontend URL

```text
http://localhost:5173
```

## Environment Modes

The frontend now has an explicit app-mode switch.

### Development mode

```env
VITE_APP_ENV=development
VITE_DEV_API_BASE_URL=http://localhost:8000
```

In development:

- frontend API calls go to your local machine backend
- the backend creates and uses `backend/development.sqlite3`
- login and community city data are stored locally in SQLite
- Supabase is not used for auth or city storage
- this is the recommended setup for local work

### Production mode

```env
VITE_APP_ENV=production
VITE_PROD_API_BASE_URL=https://your-production-api.example.com
```

In production:

- frontend API calls go to the production backend URL
- auth and community city storage use Supabase
- if `VITE_PROD_API_BASE_URL` is not set, the frontend falls back to the current site origin

### Backend production CORS

For the FastAPI backend, set:

```env
APP_ENV=production
FRONTEND_ORIGIN=https://your-frontend-domain.example.com
```

In backend development mode, localhost Vite origins are allowed automatically.

## What Happens When You Generate a City

1. You log in with Supabase Auth.
2. You enter a LeetCode username.
3. The frontend sends the username to the FastAPI backend.
4. The backend calls LeetCode GraphQL and gets easy, medium, and hard solved counts.
5. The backend converts those counts into houses, buildings, and skyscrapers.
6. The frontend saves the generated city to Supabase.
7. All authenticated users can see saved cities in the shared community board.

## User Flow

1. Sign up or sign in with email and password.
2. Enter a LeetCode username.
3. The backend fetches LeetCode stats from GraphQL.
4. The app converts those stats into a city model.
5. The frontend saves the generated city to Supabase.
6. All signed-in users can view saved cities in the community panel.

## API Endpoint

### `POST /api/user-city`

Request body:

```json
{
  "username": "leetcode_username"
}
```

Response example:

```json
{
  "username": "leetcode_username",
  "easy": 120,
  "medium": 45,
  "hard": 8,
  "city": {
    "houses": 12,
    "buildings": 9,
    "skyscrapers": 4,
    "level": "Intermediate"
  }
}
```

## Skyline Rules

- each saved user is rendered as one unique building
- easy problems widen the building footprint
- medium problems add floors and tower body height
- hard problems extend the spire
- username hashing assigns a stable archetype

Available archetypes:

- Glass Tower
- Brutalist Block
- Art Deco Spire
- Crystal Pyramid
- Neon Pagoda
- Cyber Monolith
- Obsidian Fortress
- Copper Dome

City level:

- `Beginner`
- `Intermediate`
- `Advanced`

## Production Notes

- In development, the frontend uses the local backend URL from `VITE_DEV_API_BASE_URL`.
- In development, local auth and saved skyline data live in `backend/development.sqlite3`.
- In production, the frontend uses `VITE_PROD_API_BASE_URL`.
- Each user has one saved city row in Supabase and regenerating updates it.
- All authenticated users can read the shared city board.
- The shared 3D skyline supports drag-to-rotate, scroll-to-zoom, hover stats, and click-to-select buildings.
- The Three.js bundle is the largest frontend asset, so the production build may show a chunk-size warning.

## PowerShell Tip

If PowerShell blocks `npm`, use:

```bash
npm.cmd install
npm.cmd run dev
```

For the first backend install, if needed:

```bash
python -m pip install -r requirements.txt
```
