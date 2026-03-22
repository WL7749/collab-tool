const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testTaskUpdate() {
  try {
    // 获取所有看板
    const boards = await axios.get(`${API_URL}/boards`);
    console.log('看板列表:', boards.data.map(b => ({ id: b.id, name: b.name })));

    if (boards.data.length > 0) {
      const boardId = boards.data[0].id;

      // 获取看板详情
      const board = await axios.get(`${API_URL}/boards/${boardId}`);
      console.log('\n看板结构:');
      board.data.columns.forEach(col => {
        const tasks = board.data.tasks.filter(t => t.columnId === col.id);
        console.log(`  ${col.title}: ${tasks.length}个任务`);
        tasks.forEach(task => {
          console.log(`    - ${task.title} (order: ${task.order})`);
        });
      });

      // 如果有任务，测试移动
      if (board.data.tasks.length > 0 && board.data.columns.length > 1) {
        const task = board.data.tasks[0];
        const newColumn = board.data.columns[1];

        console.log(`\n尝试移动任务 "${task.title}" 到列 "${newColumn.title}"...`);

        const updated = await axios.put(`${API_URL}/tasks/${task.id}`, {
          columnId: newColumn.id,
          order: 0
        });

        console.log('✅ 任务移动成功');
        console.log(`任务新位置: ${updated.data.column.title}`);
      }
    }

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testTaskUpdate();