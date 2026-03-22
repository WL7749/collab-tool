const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User, Board, Column } = require('../models');
const { generateToken, authenticate } = require('../middleware/auth');

// 注册
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度3-50个字符'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('两次输入的密码不一致');
    }
    return true;
  })
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: '用户名或邮箱已被注册'
      });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password
    });

    // 为用户创建默认看板
    const defaultBoard = await Board.create({
      name: `${username}的工作台`,
      description: '默认看板，您可以创建更多看板'
    });

    // 创建默认列
    const columns = await Column.bulkCreate([
      { boardId: defaultBoard.id, title: '待办', order: 0 },
      { boardId: defaultBoard.id, title: '进行中', order: 1 },
      { boardId: defaultBoard.id, title: '已完成', order: 2 }
    ]);

    // 创建示例任务
    await require('../models/Task').bulkCreate([
      {
        boardId: defaultBoard.id,
        columnId: columns[0].id,
        title: '欢迎使用协作工具！',
        description: '这是一个示例任务',
        order: 0,
        priority: 'high'
      },
      {
        boardId: defaultBoard.id,
        columnId: columns[0].id,
        title: '试试拖拽任务',
        description: '可以拖拽任务到不同列',
        order: 1,
        priority: 'medium'
      }
    ]);

    // 关联用户和看板
    await require('../models/UserBoard').create({
      userId: user.id,
      boardId: defaultBoard.id,
      role: 'owner'
    });

    // 生成Token
    const token = generateToken(user);

    res.status(201).json({
      message: '注册成功',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// 登录
router.post('/login', [
  body('username').notEmpty().withMessage('请输入用户名或邮箱'),
  body('password').notEmpty().withMessage('请输入密码')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: '账户已被禁用' });
    }

    // 更新最后登录时间
    await user.update({ lastLogin: new Date() });

    // 生成Token
    const token = generateToken(user);

    res.json({
      message: '登录成功',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: require('../models/Board'),
        as: 'boards',
        through: { attributes: ['role'] }
      }]
    });

    res.json(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 修改密码
router.put('/change-password', authenticate, [
  body('oldPassword').notEmpty().withMessage('请输入原密码'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码长度至少6个字符'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('两次输入的密码不一致');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;

    // 验证原密码
    const isValid = await req.user.validatePassword(oldPassword);
    if (!isValid) {
      return res.status(401).json({ error: '原密码错误' });
    }

    // 更新密码
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: '密码修改成功，请重新登录' });

  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 登出（前端清除Token即可，后端可选记录登出）
router.post('/logout', authenticate, async (req, res) => {
  // 可以在这里记录登出日志
  res.json({ message: '登出成功' });
});

module.exports = router;