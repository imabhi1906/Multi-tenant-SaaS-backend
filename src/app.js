const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const bookRoutes = require('./modules/books/books.routes');
const tenantRoutes = require('./modules/tenant/tenant.routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/tenant', tenantRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
