# CoBalance

A personal finance tracking app I built to replace the spreadsheet I was using to track money owed between friends and family. Think of it as a digital "khata" (ledger book) that also handles group expenses.

## What It Does

- **Personal Ledger**: Track who owes you and who you owe. Add contacts, log transactions, see running balances.
- **Group Expenses**: Split bills with roommates, trips with friends, etc. Handles unequal splits.
- **Settlements**: One tap to settle up when someone pays you back.
- **WhatsApp Reminders**: Quick link to nudge someone who owes you (we've all been there).
- **Monthly Reports**: See where your money went each month.

## Who It's For

Built this for myself, but it works well for:

- Anyone tracking personal loans to friends/family
- Small shopkeepers keeping customer tabs
- Roommates splitting rent and utilities
- Trip groups tracking shared expenses

## Tech Stack

**Frontend**

- React 18 + Vite
- Tailwind CSS
- React Router

**Backend**

- Node.js + Express
- PostgreSQL via Supabase
- JWT auth with OTP login

## Project Structure

```
├── frontend/src/
│   ├── components/    # Reusable UI bits
│   ├── pages/         # Route pages + auth flow
│   ├── services/      # API client
│   ├── context/       # Auth state
│   └── utils/         # Helpers
│
├── backend/src/
│   ├── controllers/   # Route handlers
│   ├── routes/        # API routes
│   └── middleware/    # Auth checks
│
└── database/          # Schema and migrations
```

## Local Setup

**Backend**

```bash
cd backend
npm install
cp .env.example .env
# Fill in your Supabase creds and a JWT secret
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
# Set VITE_API_BASE_URL=http://localhost:5000 in .env
npm run dev
```

Backend runs on port 5000, frontend on 5173.

## Environment Variables

**Backend**

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` - Supabase project creds
- `JWT_SECRET` - Any random string for signing tokens
- `OTP_PROVIDER` - Set to `mock` for local dev (logs OTP to console)

**Frontend**

- `VITE_API_BASE_URL` - Usually `http://localhost:5000` for dev

## Current Status

Core features work and are stable:

- OTP login ✓
- Personal ledger with contacts ✓
- Group expenses ✓
- Settlements ✓
- Monthly reports ✓

## Roadmap

Things I'm planning to add:

- [ ] Export transactions to CSV
- [ ] Better category management
- [ ] Push notifications for reminders
- [ ] Dark mode

## License

MIT
