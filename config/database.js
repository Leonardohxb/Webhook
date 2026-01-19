const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is not defined!');
}

const sequelize = new Sequelize(databaseUrl || 'postgres://localhost:5432/webhook_db_placeholder', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {}
});

module.exports = sequelize;
