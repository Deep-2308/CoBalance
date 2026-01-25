# CoBalance

CoBalance is a fintech SaaS application built for personal and small business finance tracking. It combines a digital ledger for managing money you owe and are owed (inspired by Khatabook) with shared expense management for groups. Designed for individuals, shopkeepers, freelancers, and small businesses who need a simple, reliable way to track balances and settlements.

## Key Features

### Authentication

- OTP-based mobile authentication
- Secure JWT token management
- Protected routes and session persistence

### Personal Ledger

- Add contacts (customers, friends, suppliers)
- Record transactions: "You Paid" or "You Received"
- Automatic balance calculation per contact
- Contact-wise transaction history with running balance
- Search, filter, and sort transactions

### Settlement Flow

- "Settle Up" button for contacts with outstanding balance
- Full settlement creates a clearing transaction
- Balance resets to zero after settlement
- Settlement history tracked per contact

### Groups and Shared Expenses

- Create groups for shared expenses
- Add members (including non-registered users via shadow accounts)
- Add expenses with flexible splitting options
- Per-member balance calculation
- SMS invitations for new users

### Payment Reminders

- WhatsApp deep-link integration
- Send reminders to contacts with outstanding balances
- Pre-filled reminder messages
- Reminder history tracking

### Dashboard and Reports

- Overview of total balances (You'll Get / You Owe)
- Recent activity summary
- Monthly reports with daily breakdown chart
- Category-wise spending summary
- "Today's Spending" card

### Profile Management

- View and edit user profile
- Business information (optional)
- App preferences

### Expense Categories

- Predefined expense categories
- Assign categories to transactions
- Monthly category summary

## Screenshots

> Screenshots to be added.

## Tech Stack

### Frontend

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT
- **Security**: Helmet, CORS

### Database

- **Provider**: PostgreSQL (Supabase)
- **Access**: Supabase client with direct queries

## Project Structure

```
CoBalance_SAASapp/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers and business logic
│   │   ├── middleware/        # Auth middleware
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Shared services (SMS, etc.)
│   │   ├── utils/             # Helper functions
│   │   └── server.js          # Express app entry point
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API client
│   │   ├── utils/             # Helper functions
│   │   ├── App.jsx            # App routes
│   │   └── main.jsx           # Entry point
│   ├── .env                   # Frontend environment
│   └── package.json
├── database/
│   ├── schema.sql             # Database schema
│   ├── rls_policies.sql       # Row Level Security policies
│   └── migrations/            # Schema migrations
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (or self-hosted PostgreSQL)

### Backend Setup

```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env

# Configure environment variables (see below)
# Then start the development server
npm run dev
```

The backend runs on `http://localhost:5000` by default.

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
# VITE_API_BASE_URL=http://localhost:5000

npm run dev
```

The frontend runs on `http://localhost:5173` by default.

### Environment Variables

**Backend (.env)**

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Server port (default: 5000)
- `OTP_PROVIDER` - Set to `mock` for development
- `FRONTEND_URL` - Frontend URL for CORS

**Frontend (.env)**

- `VITE_API_BASE_URL` - Backend API URL

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the environment variable `VITE_API_BASE_URL` to your production backend URL
3. Deploy

### Backend

1. Deploy to your preferred hosting (Render, Railway, etc.)
2. Configure all required environment variables
3. Ensure `OTP_PROVIDER` is set to your production SMS provider

### Database

- Supabase handles hosting and backups
- Run `schema.sql` in the Supabase SQL editor for initial setup
- Apply `rls_policies.sql` for Row Level Security

## Ledger Semantics

CoBalance uses a clear mental model for tracking money:

| Transaction  | Meaning                      | Balance Effect        | Display              |
| ------------ | ---------------------------- | --------------------- | -------------------- |
| You Paid     | You gave money to a contact  | Contact owes you      | Green - "You'll get" |
| You Received | You got money from a contact | You owe contact       | Red - "You owe"      |
| Settled      | Balance is zero              | No outstanding amount | Gray - "Settled"     |

This matches the Khatabook-style ledger approach where:

- **Positive balance** = Money owed TO you
- **Negative balance** = Money YOU owe

## Settlement Flow

When you want to clear the outstanding balance with a contact:

1. Open the contact's detail page
2. Click "Settle Up" (visible when balance is non-zero)
3. Confirm the settlement amount in the modal
4. A settlement transaction is created that clears the balance
5. The contact's balance becomes zero

Settlements are recorded as transactions, so you have a complete history of all financial activity.

## Project Status

CoBalance is in **active development**. The core ledger functionality is stable and production-ready:

- OTP authentication: Stable
- Personal ledger: Stable
- Groups and expenses: Stable
- Settlements: Stable
- Reports and categories: Stable

## License

MIT
