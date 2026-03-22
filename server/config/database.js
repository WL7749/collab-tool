const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',  // 重要：使用postgres
    logging: console.log,  // 开发时可以查看SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL连接成功！');
    console.log(`📊 数据库: ${process.env.DB_NAME}`);
    console.log(`👤 用户: ${process.env.DB_USER}@${process.env.DB_HOST}`);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL连接失败:');
    console.error(`错误: ${error.message}`);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 解决方案:');
      console.error('1. 启动PostgreSQL服务: net start postgresql-x64-14');
      console.error('2. 检查端口5432是否被占用');
      console.error('3. 确认PostgreSQL已安装');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 密码错误，请检查.env文件中的密码');
      console.error('或重置PostgreSQL密码');
    } else if (error.message.includes('database does not exist')) {
      console.error('\n💡 数据库不存在，请在pgAdmin中创建数据库');
    }
    return false;
  }
};

module.exports = { sequelize, testConnection };