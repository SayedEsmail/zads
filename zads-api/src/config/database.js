const { PrismaClient } = require('@prisma/client');

const logQueries = process.env.PRISMA_QUERY_LOG === 'true';

const prisma = new PrismaClient({
    log: logQueries ? ['query', 'info', 'warn', 'error'] : ['warn', 'error']
});

module.exports = prisma;
