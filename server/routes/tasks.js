const express = require('express');
const router = express.Router();
const { Task, Column } = require('../models');
const { sequelize } = require('../config/database');

// 获取所有任务
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [{ model: Column, as: 'column' }],
      order: [['order', 'ASC']]
    });
    res.json(tasks);
  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新任务
router.post('/', async (req, res) => {
  try {
    const { title, description, columnId, boardId, priority } = req.body;

    // 获取该列的任务数量作为order
    const taskCount = await Task.count({ where: { columnId } });

    const task = await Task.create({
      title,
      description,
      columnId,
      boardId,
      priority: priority || 'medium',
      order: taskCount
    });

    const completeTask = await Task.findByPk(task.id, {
      include: [{ model: Column, as: 'column' }]
    });

    res.status(201).json(completeTask);
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新任务（简化版）
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    const { columnId, order, title, description, priority, completed } = req.body;

    // 更新任务属性
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) updateData.completed = completed;
    if (columnId !== undefined) updateData.columnId = columnId;
    if (order !== undefined) updateData.order = order;

    await task.update(updateData);

    // 如果移动了列，重新整理顺序
    if (columnId !== undefined && columnId !== task.columnId) {
      // 重新整理原列的顺序
      const oldColumnTasks = await Task.findAll({
        where: { columnId: task.columnId },
        order: [['order', 'ASC']]
      });

      for (let i = 0; i < oldColumnTasks.length; i++) {
        await oldColumnTasks[i].update({ order: i });
      }

      // 重新整理新列的顺序
      const newColumnTasks = await Task.findAll({
        where: { columnId: columnId },
        order: [['order', 'ASC']]
      });

      for (let i = 0; i < newColumnTasks.length; i++) {
        await newColumnTasks[i].update({ order: i });
      }
    }

    const updatedTask = await Task.findByPk(task.id, {
      include: [{ model: Column, as: 'column' }]
    });

    res.json(updatedTask);

  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: '任务不存在' });
    }

    await task.destroy();

    // 重新整理同一列的顺序
    const remainingTasks = await Task.findAll({
      where: { columnId: task.columnId },
      order: [['order', 'ASC']]
    });

    for (let i = 0; i < remainingTasks.length; i++) {
      await remainingTasks[i].update({ order: i });
    }

    res.json({ message: '任务删除成功' });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;