# TRUE ALPHA — Render backend foundation

Render:
- Build Command: npm install
- Start Command: npm start

Environment variables:
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY

Do not put Firebase Admin private keys in the frontend or GitHub.

This is the clean Render server foundation. The old Vercel/Netlify
/api handlers should not be copied blindly. The next step is to port
the routes used by the current TRUE ALPHA frontend: wallet, recharge,
Transaction ID, orders, notifications, messages, rewards, Free Fire,
admin, and site status.
