const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Board = require('./Board');

const Column = sequelize.define('Column', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  boardId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Board,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'columns',
  timestamps: true
});

Board.hasMany(Column, { foreignKey: 'boardId', as: 'columns', onDelete: 'CASCADE' });
Column.belongsTo(Board, { foreignKey: 'boardId', as: 'board' });

module.exports = Column;