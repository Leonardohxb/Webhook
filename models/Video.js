const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: true
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Video;
