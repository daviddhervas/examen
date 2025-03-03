const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Definir el modelo de actividad
const Activity = sequelize.define('Activity', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  failedAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isLoggedIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
});

// Establecer la relación: Una actividad pertenece a un usuario
Activity.belongsTo(require('./user'), { foreignKey: 'userId' });

module.exports = Activity;
