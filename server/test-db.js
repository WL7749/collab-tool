const { sequelize, Board, Column, Task } = require('./models');

const testDatabase = async () => {
  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 创建测试看板
    const testBoard = await Board.create({
      name: '测试看板',
      description: '这是一个测试看板'
    });
    console.log('✅ 创建测试看板:', testBoard.toJSON());

    // 创建列
    const columns = await Column.bulkCreate([
      { boardId: testBoard.id, title: '待办', order: 0 },
      { boardId: testBoard.id, title: '进行中', order: 1 },
      { boardId: testBoard.id, title: '已完成', order: 2 }
    ]);
    console.log('✅ 创建了', columns.length, '个列');

    // 创建任务
    const task = await Task.create({
      boardId: testBoard.id,
      columnId: columns[0].id,
      title: '测试任务',
      description: '这是一个测试任务',
      order: 0
    });
    console.log('✅ 创建测试任务:', task.toJSON());

    // 查询数据
    const board = await Board.findByPk(testBoard.id, {
      include: [
        { model: Column, as: 'columns' },
        { model: Task, as: 'tasks' }
      ]
    });
    console.log('✅ 查询看板数据:', JSON.stringify(board, null, 2));

    // 清理测试数据
    await testBoard.destroy();
    console.log('✅ 清理测试数据完成');

    console.log('\n🎉 数据库测试全部通过！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await sequelize.close();
  }
};

testDatabase();