# CoBalance - Smart Finance Tracking SaaS

CoBalance is a production-ready SaaS application that combines digital ledger bookkeeping with shared expense management. Built for Indian MSME owners, shopkeepers, freelancers, and friends/families managing shared expenses.

## Features

### 🔐 Authentication
- Mobile number-based OTP authentication
- Secure JWT token management
- Multi-language support (English, Hindi)

### 📊 Digital Ledger
- Track personal and business transactions
- Manage contacts (customers, friends, suppliers)
- Automatic balance calculation
- Transaction history with running balance

### 👥 Group Expense Management
- Create groups for shared expenses
- Add expenses with flexible splitting
- Automatic member balance calculation
- Real-time expense tracking

### 💰 Smart Settlements
- Debt simplification algorithm
- Minimized settlement transactions
- Clear payment suggestions
- Mark settlements as paid

### 📱 Reminders
- WhatsApp deep-link integration
- Send payment reminders to contacts
- Pre-filled reminder messages

## Tech Stack

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Formatting**: date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT
- **CORS**: Enabled for cross-origin requests
- **Security**: Helmet for secure headers

### Database
- **Provider**: Supabase (PostgreSQL)
- **ORM**: Direct SQL queries via Supabase client

## Project Structure

```
CoBalance_SAASapp/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth, validation
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Shared services
│   │   ├── utils/             # Helpers
│   │   └── server.js          # Entry point
│   ├── .env                   # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React Context
│   │   ├── pages/             # Route components
│   │   ├── services/          # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── database/
    └── schema.sql             # Database schema
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account (or PostgreSQL database)
- npm or yarn

### 1. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
3. Get your Supabase credentials:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file (copy from .env.example)
# Add your Supabase credentials

npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# .env file already configured for local development

npm run dev
```

Frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5000
OTP_PROVIDER=mock
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/update-profile` - Update user profile
- `GET /api/auth/me` - Get current user

### Ledger
- `POST /api/ledger/contacts` - Create contact
- `GET /api/ledger/contacts` - List contacts
- `GET /api/ledger/contacts/:id` - Get contact details
- `PUT /api/ledger/contacts/:id` - Update contact
- `DELETE /api/ledger/contacts/:id` - Delete contact
- `POST /api/ledger/transactions` - Add transaction
- `GET /api/ledger/summary` - Get ledger summary

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - List groups
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:userId` - Remove member
- `POST /api/groups/:id/expenses` - Add expense
- `GET /api/groups/:id/balances` - Get member balances

### Settlements
- `GET /api/settlements/group/:groupId` - Get group settlements
- `POST /api/settlements/mark-paid` - Mark settlement as paid
- `GET /api/settlements/all` - Get all settlements

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary

### Reminders
- `POST /api/reminders/generate` - Generate WhatsApp reminder

## Development Mode

### Mock OTP
In development mode (`OTP_PROVIDER=mock`), OTP codes are logged to the console:
```
📱 Mock OTP for +919876543210: 123456
```
The OTP is also returned in the API response for testing.

## Production Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `VITE_API_BASE_URL=https://your-backend-url.com`
4. Deploy

### Backend (Render)
1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy

### Database (Supabase)
- Already hosted on Supabase
- Ensure Row Level Security is configured for production

## Features Roadmap

- [ ] Email/Password authentication fallback
- [ ] Production SMS OTP integration (Twilio/Firebase)
- [ ] More languages (Tamil, Telugu, etc.)
- [ ] Export statements (PDF/Excel)
- [ ] Recurring expenses
- [ ] Payment gateway integration
- [ ] Mobile apps (React Native)

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
