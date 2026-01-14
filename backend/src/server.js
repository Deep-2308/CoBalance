import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes.js';
import ledgerRoutes from './routes/ledger.routes.js';
import groupsRoutes from './routes/groups.routes.js';
import settlementsRoutes from './routes/settlements.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import contactProfileRoutes from './routes/contact-profile.routes.js';
import profileRoutes from './routes/profile.routes.js';
import securityRoutes from './routes/security.routes.js';
import searchRoutes from './routes/search.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import reportsRoutes from './routes/reports.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- CORS (FIXED & SAFE) -------------------- */
const allowedOrigins = [
  'http://localhost:5173',
  'https://co-balance.vercel.app'
];

// Handle preflight requests FIRST
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply CORS to all routes
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ------------------------------------------------------------- */

// Helmet - configure to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'CoBalance API is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CoBalance API',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/settlements', settlementsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contacts', contactProfileRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler (MUST be last)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CoBalance API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 OTP Provider: ${process.env.OTP_PROVIDER || 'mock'}`);
});
