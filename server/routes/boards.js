const express = require('express');
const router = express.Router();
const { Board, Column, Task } = require('../models');

// 获取所有看板
router.get('/', async (req, res) => {
  try {
    const boards = await Board.findAll({
      include: [
        { model: Column, as: 'columns', order: [['order', 'ASC']] },
        { model: Task, as: 'tasks', order: [['order', 'ASC']] }
      ]
    });
    res.json(boards);
  } catch (error) {
    console.error('获取看板失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个看板
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id, {
      include: [
        {
          model: Column,
          as: 'columns',
          order: [['order', 'ASC']]
        },
        {
          model: Task,
          as: 'tasks',
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!board) {
      return res.status(404).json({ error: '看板不存在' });
    }

    res.json(board);
  } catch (error) {
    console.error('获取看板详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新看板
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    // 创建看板
    const board = await Board.create({
      name,
      description
    });

    // 创建默认列
    const defaultColumns = [
      { boardId: board.id, title: '待办', order: 0 },
      { boardId: board.id, title: '进行中', order: 1 },
      { boardId: board.id, title: '已完成', order: 2 }
    ];

    const columns = await Column.bulkCreate(defaultColumns);

    // 返回完整的看板数据
    const completeBoard = await Board.findByPk(board.id, {
      include: [{ model: Column, as: 'columns' }]
    });

    res.status(201).json(completeBoard);
  } catch (error) {
    console.error('创建看板失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新看板
router.put('/:id', async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) {
      return res.status(404).json({ error: '看板不存在' });
    }

    await board.update(req.body);
    res.json(board);
  } catch (error) {
    console.error('更新看板失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除看板
router.delete('/:id', async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) {
      return res.status(404).json({ error: '看板不存在' });
    }

    await board.destroy();
    res.json({ message: '看板删除成功' });
  } catch (error) {
    console.error('删除看板失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;