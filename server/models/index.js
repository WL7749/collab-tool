const { sequelize } = require('../config/database');
const Board = require('./Board');
const Column = require('./Column');
const Task = require('./Task');
const User = require('./User');
const UserBoard = require('./UserBoard');

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL连接成功');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL连接失败:', error.message);
    return false;
  }
};

const syncDatabase = async () => {
  try {
    // 同步所有模型（注意顺序）
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库同步完成');

    // 检查是否需要创建默认管理员账户
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      console.log('📝 创建默认管理员账户...');

      const admin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });

      // 为管理员创建默认看板
      const defaultBoard = await Board.create({
        name: '管理控制台',
        description: '默认看板'
      });

      const columns = await Column.bulkCreate([
        { boardId: defaultBoard.id, title: '待办', order: 0 },
        { boardId: defaultBoard.id, title: '进行中', order: 1 },
        { boardId: defaultBoard.id, title: '已完成', order: 2 }
      ]);

      await Task.bulkCreate([
        {
          boardId: defaultBoard.id,
          columnId: columns[0].id,
          title: '欢迎使用协作工具',
          description: '您可以创建更多看板',
          order: 0,
          priority: 'high'
        }
      ]);

      await UserBoard.create({
        userId: admin.id,
        boardId: defaultBoard.id,
        role: 'owner'
      });

      console.log('✅ 默认管理员创建完成');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
    }

  } catch (error) {
    console.error('❌ 同步失败:', error.message);
  }
};

module.exports = {
  sequelize,
  Board,
  Column,
  Task,
  User,
  UserBoard,
  testConnection,
  syncDatabase
};