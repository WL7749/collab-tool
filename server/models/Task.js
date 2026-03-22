const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Board = require('./Board');
const Column = require('./Column');

const Task = sequelize.define('Task', {
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
  columnId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Column,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'tasks',
  timestamps: true
});

Board.hasMany(Task, { foreignKey: 'boardId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Board, { foreignKey: 'boardId', as: 'board' });

Column.hasMany(Task, { foreignKey: 'columnId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Column, { foreignKey: 'columnId', as: 'column' });

module.exports = Task;