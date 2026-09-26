const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const teachersRoutes = require('./routes/teachers.routes');
const parentsRoutes = require('./routes/parents.routes');
const subjectsRoutes = require('./routes/subjects.routes');
const stagesRoutes = require('./routes/stages.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const contactRequestsRoutes = require('./routes/contactRequests.routes');
const tutorRequestsRoutes = require('./routes/tutorRequests.routes');
const adminRoutes = require('./routes/admin.routes');
const locationsRoutes = require('./routes/locations.routes');
const uploadRoutes = require('./routes/upload.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const errorMiddleware = require('./middlewares/error');

const app = express();

// ==============================================
// MIDDLEWARES
// ==============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files: avatars and public images only
app.use('/uploads/images', express.static('public/uploads/images'));

// Protected certificate document access
const { auth: requireAuth } = require('./middlewares/auth');
const uploadCtrl = require('./controllers/upload.controller');
app.get('/uploads/certificates/:filename', requireAuth, uploadCtrl.getCertificate);
app.get('/api/uploads/certificates/:filename', requireAuth, uploadCtrl.getCertificate);
app.get('/api/upload/certificates/:filename', requireAuth, uploadCtrl.getCertificate);

// ==============================================
// ROUTES
// ==============================================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/parents', parentsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/stages', stagesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/contact-requests', contactRequestsRoutes);
app.use('/api/tutor-requests', tutorRequestsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error Handler
app.use(errorMiddleware);

// ==============================================
// START SERVER
// ==============================================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

if (require.main === module) {
    app.listen(PORT, HOST, () => {
        console.log(`🚀 Zads API running at http://${HOST}:${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

module.exports = app;
// Force nodemon reload after prisma client generation

