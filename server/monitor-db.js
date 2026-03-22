const { sequelize, Task, Column, Board } = require('./models');
const { Op } = require('sequelize');
require('dotenv').config();

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// 监控拖拽事件
class DragMonitor {
  constructor() {
    this.lastTasksState = new Map();
    this.lastColumnsState = new Map();
    this.eventCount = 0;
  }

  // 获取当前所有任务的状态
  async getCurrentState() {
    const tasks = await Task.findAll({
      include: [
        { model: Column, as: 'column' },
        { model: Board, as: 'board' }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const columns = await Column.findAll({
      include: [{ model: Board, as: 'board' }],
      order: [['order', 'ASC']]
    });

    return { tasks, columns };
  }

  // 比较任务状态变化
  compareTaskChanges(oldTask, newTask) {
    const changes = [];

    if (oldTask.columnId !== newTask.columnId) {
      changes.push({
        type: 'column_change',
        old: oldTask.column?.title || '未知列',
        new: newTask.column?.title || '未知列'
      });
    }

    if (oldTask.order !== newTask.order) {
      changes.push({
        type: 'order_change',
        old: oldTask.order,
        new: newTask.order
      });
    }

    if (oldTask.title !== newTask.title) {
      changes.push({
        type: 'title_change',
        old: oldTask.title,
        new: newTask.title
      });
    }

    if (oldTask.completed !== newTask.completed) {
      changes.push({
        type: 'status_change',
        old: oldTask.completed ? '已完成' : '未完成',
        new: newTask.completed ? '已完成' : '未完成'
      });
    }

    return changes;
  }

  // 显示任务移动的详细信息
  displayDragEvent(task, changes, eventNumber) {
    console.log('\n' + '='.repeat(80));
    log(colors.bright + colors.cyan, `🎯 拖拽事件 #${eventNumber}`);
    console.log('='.repeat(80));

    log(colors.bright, `📋 任务: ${task.title}`);
    log(colors.bright, `🆔 ID: ${task.id}`);
    log(colors.bright, `⏰ 时间: ${new Date().toLocaleString()}`);

    console.log('\n📊 变化详情:');
    changes.forEach(change => {
      if (change.type === 'column_change') {
        log(colors.yellow, `   ├─ 列移动: ${change.old} → ${change.new}`);
      } else if (change.type === 'order_change') {
        log(colors.blue, `   ├─ 顺序变化: ${change.old} → ${change.new}`);
      } else if (change.type === 'title_change') {
        log(colors.magenta, `   ├─ 标题变化: ${change.old} → ${change.new}`);
      } else if (change.type === 'status_change') {
        log(colors.green, `   └─ 状态变化: ${change.old} → ${change.new}`);
      }
    });

    // 显示优先级
    if (task.priority) {
      const priorityColor = task.priority === 'high' ? colors.red :
                           task.priority === 'medium' ? colors.yellow : colors.green;
      log(priorityColor, `   └─ 优先级: ${task.priority.toUpperCase()}`);
    }
  }

  // 显示完整的看板状态
  async displayBoardState() {
    const boards = await Board.findAll({
      include: [
        {
          model: Column,
          as: 'columns',
          include: [{ model: Task, as: 'tasks' }],
          order: [['order', 'ASC']]
        }
      ]
    });

    console.log('\n' + '='.repeat(80));
    log(colors.bright + colors.cyan, '📊 当前看板状态');
    console.log('='.repeat(80));

    for (const board of boards) {
      log(colors.bright, `\n🏷️  看板: ${board.name} (${board.id})`);
      console.log('─'.repeat(50));

      for (const column of board.columns) {
        const taskCount = column.tasks.length;
        const completedCount = column.tasks.filter(t => t.completed).length;

        console.log(`\n  📌 ${column.title} [${taskCount}个任务]`);
        if (completedCount > 0) {
          console.log(`     已完成: ${completedCount}`);
        }

        column.tasks.forEach((task, idx) => {
          const statusIcon = task.completed ? '✅' : '⭕';
          const priorityIcon = task.priority === 'high' ? '🔴' :
                              task.priority === 'medium' ? '🟡' : '🟢';
          console.log(`     ${idx + 1}. ${statusIcon} ${priorityIcon} ${task.title}`);
        });
      }
    }
  }

  // 开始监控
  async startMonitoring() {
    log(colors.green, '🔍 开始监控拖拽事件...');
    log(colors.yellow, '💡 提示: 在前端拖拽任务，这里会实时显示变化\n');

    // 先显示当前状态
    await this.displayBoardState();

    // 保存初始状态
    let previousState = await this.getCurrentState();
    this.lastTasksState = new Map(
      previousState.tasks.map(task => [task.id, task])
    );

    // 每2秒检查一次变化
    setInterval(async () => {
      try {
        const currentState = await this.getCurrentState();
        const changes = [];

        // 检查每个任务的变化
        for (const currentTask of currentState.tasks) {
          const previousTask = this.lastTasksState.get(currentTask.id);

          if (previousTask) {
            const taskChanges = this.compareTaskChanges(previousTask, currentTask);
            if (taskChanges.length > 0) {
              changes.push({
                task: currentTask,
                changes: taskChanges
              });
            }
          }
        }

        // 如果有变化，显示详细信息
        if (changes.length > 0) {
          this.eventCount++;

          for (const change of changes) {
            this.displayDragEvent(change.task, change.changes, this.eventCount);
          }

          // 显示更新后的看板状态
          await this.displayBoardState();

          // 播放提示音（可选，如果支持）
          // process.stdout.write('\x07');
        }

        // 更新状态
        this.lastTasksState = new Map(
          currentState.tasks.map(task => [task.id, task])
        );

      } catch (error) {
        console.error('监控错误:', error);
      }
    }, 2000);
  }
}

// 创建带统计的监控器
class EnhancedDragMonitor extends DragMonitor {
  constructor() {
    super();
    this.statistics = {
      totalDrags: 0,
      columnChanges: {},
      hourlyStats: new Map(),
      startTime: new Date()
    };
  }

  // 更新统计信息
  updateStatistics(changes, task) {
    this.statistics.totalDrags++;

    changes.forEach(change => {
      if (change.type === 'column_change') {
        const key = `${change.old} → ${change.new}`;
        this.statistics.columnChanges[key] =
          (this.statistics.columnChanges[key] || 0) + 1;
      }
    });

    // 按小时统计
    const hour = new Date().getHours();
    const hourKey = `${hour}:00`;
    this.statistics.hourlyStats.set(
      hourKey,
      (this.statistics.hourlyStats.get(hourKey) || 0) + 1
    );
  }

  // 显示统计报告
  displayStatistics() {
    const runtime = Math.floor((new Date() - this.statistics.startTime) / 1000);
    const minutes = Math.floor(runtime / 60);
    const seconds = runtime % 60;

    console.log('\n' + '='.repeat(80));
    log(colors.bright + colors.cyan, '📈 拖拽统计报告');
    console.log('='.repeat(80));

    log(colors.bright, `⏱️  运行时间: ${minutes}分${seconds}秒`);
    log(colors.bright, `🔄 总拖拽次数: ${this.statistics.totalDrags}`);

    if (Object.keys(this.statistics.columnChanges).length > 0) {
      console.log('\n📊 列移动统计:');
      Object.entries(this.statistics.columnChanges).forEach(([move, count]) => {
        console.log(`   ${move}: ${count}次`);
      });
    }

    if (this.statistics.hourlyStats.size > 0) {
      console.log('\n⏰ 按小时统计:');
      for (const [hour, count] of this.statistics.hourlyStats) {
        console.log(`   ${hour}: ${count}次`);
      }
    }

    console.log('\n' + '='.repeat(80));
  }

  // 重写显示拖拽事件的方法，加入统计
  displayDragEvent(task, changes, eventNumber) {
    this.updateStatistics(changes, task);
    super.displayDragEvent(task, changes, eventNumber);

    // 显示实时统计
    console.log('\n📈 实时统计:');
    console.log(`   总拖拽次数: ${this.statistics.totalDrags}`);
    console.log(`   当前时间: ${new Date().toLocaleTimeString()}`);
  }
}

// 启动监控
async function startDragMonitor() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 创建监控器实例
    const monitor = new EnhancedDragMonitor();

    // 开始监控
    await monitor.startMonitoring();

    // 每30秒显示一次统计（可选）
    setInterval(() => {
      if (monitor.statistics.totalDrags > 0) {
        console.log('\n' + '-'.repeat(40));
        log(colors.yellow, '⏲️  定期统计更新:');
        console.log(`总拖拽次数: ${monitor.statistics.totalDrags}`);
        console.log('-'.repeat(40));
      }
    }, 30000);

    // 处理退出信号
    process.on('SIGINT', () => {
      console.log('\n');
      monitor.displayStatistics();
      console.log('\n👋 监控已停止');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 启动监控失败:', error);
    process.exit(1);
  }
}

// 运行监控
startDragMonitor();