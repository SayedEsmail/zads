module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
};
