const sequelize = require('../config/database');
const Topic = require('./Topic');
const Image = require('./Image');
const Video = require('./Video');

// Associations
Topic.hasMany(Image, { foreignKey: 'topicId', as: 'images' });
Image.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

Topic.hasMany(Video, { foreignKey: 'topicId', as: 'videos' });
Video.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

module.exports = {
    sequelize,
    Topic,
    Image,
    Video
};
