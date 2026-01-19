const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is not defined!');
}

// Internal Railway connections usually don't need SSL and might fail if required
const isInternalConnection = databaseUrl && databaseUrl.includes('.railway.internal');

const sequelize = new Sequelize(databaseUrl || 'postgres://localhost:5432/webhook_db_placeholder', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: (process.env.NODE_ENV === 'production' && !isInternalConnection) ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {}
});

module.exports = sequelize;
