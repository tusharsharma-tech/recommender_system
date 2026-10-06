# CineMatch 3D

CineMatch is a movie and music discovery app with account preferences, a searchable media library, watch history, personalized recommendations, analytics, and admin uploads.

## Run locally

1. Make sure PostgreSQL is running and create a database named `CINEMATCH` (or use another database in the URL).
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`, `ADMIN_SIGNUP_KEY`, and `SECRET_KEY`. Use a URL such as `postgresql://postgres:your_password@localhost:5432/CINEMATCH`.
3. Install backend dependencies with `python -m pip install -r backend/requirements.txt`.
4. Start the API from `backend/` with `uvicorn main:app --reload`.
5. In another terminal, run `npm install` and `npm run dev` from `cinematch-3d/`.

The frontend runs at `http://localhost:5173` and the API at `http://localhost:8000`. Vite proxies `/api` and `/media` to the API. Tables and indexes are created automatically at backend startup. Uploaded media files are stored under `backend/media/files`.

## Open on a phone or another device

1. Connect the device and development PC to the same Wi-Fi network. Guest Wi-Fi or router client isolation can prevent devices from connecting.
2. Keep the frontend running with `npm run dev`; Vite listens on all PC network interfaces.
3. On Windows, run `ipconfig` and find the PC's IPv4 address for the active Wi-Fi/Ethernet adapter (for example, `192.168.1.25`).
4. On the phone, open `http://192.168.1.25:5173`, replacing the example address with the PC's IPv4 address.

If it still does not open, allow Node.js (or TCP port 5173) through Windows Defender Firewall on the **Private** network, and confirm both devices are on the same non-guest network. The frontend proxies API and media requests through the PC, so the phone does not need direct access to port 8000 or PostgreSQL.

The recommender ranks PostgreSQL-backed media using saved interests, preferences, and viewing history. The separate model-comparison chart uses deterministic sample benchmark values; dashboard catalog, user, and viewing totals come from PostgreSQL.

Admin registration requires the private `ADMIN_SIGNUP_KEY`; set it in `backend/.env` and share it only with trusted admins. `backend/.env` is ignored by Git.

## Deploy the backend to Render

1. Push the `cinematch-3d` project folder, including `render.yaml`, to a GitHub repository.
2. In Render, choose **New + > Blueprint** and connect that repository. Render reads `render.yaml` and creates the `cinematch-api` web service.
3. When prompted, set `DATABASE_URL` to a PostgreSQL connection URL that Render can reach, and set a private `ADMIN_SIGNUP_KEY`. Render generates `SECRET_KEY` for the service.
4. Deploy and use the service's `https://...onrender.com` URL for API requests.

The PostgreSQL server on your PC is not reachable from Render using `localhost`; this Blueprint cannot use that local database as-is. Use a hosted PostgreSQL database for a reliable Render deployment. Do not expose PostgreSQL port 5432 directly to the public internet. Also, Render's ordinary web-service filesystem is temporary, so uploaded files need a persistent disk or object storage if they must survive restarts and redeploys. The Vite proxy is development-only; configure the deployed frontend to call the Render API URL before publishing the full website.

## Deploy the frontend as a Render Static Site

The backend Web Service serves the API, not the React website. Create a separate **Static Site** in Render using the same GitHub repository:

- Root Directory: `cinematch-3d`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment variable: `VITE_API_URL=https://recommender-system-1-lkt9.onrender.com/api`

Add a rewrite rule `/*` to `/index.html` with status `200` so direct links such as `/profile` and `/watch/1` load the React app. Replace the API URL above if your Render backend has a different public URL. The local `.env.example` is only a template; set the production `VITE_API_URL` in Render's Static Site environment settings.
