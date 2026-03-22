const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Board = require('./Board');

const UserBoard = sequelize.define('UserBoard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  boardId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Board,
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('owner', 'editor', 'viewer'),
    defaultValue: 'editor'
  }
}, {
  tableName: 'user_boards',
  timestamps: true
});

// 定义关联关系
User.belongsToMany(Board, { through: UserBoard, foreignKey: 'userId', as: 'boards' });
Board.belongsToMany(User, { through: UserBoard, foreignKey: 'boardId', as: 'users' });

User.hasMany(UserBoard, { foreignKey: 'userId' });
UserBoard.belongsTo(User, { foreignKey: 'userId' });

Board.hasMany(UserBoard, { foreignKey: 'boardId' });
UserBoard.belongsTo(Board, { foreignKey: 'boardId' });

module.exports = UserBoard;