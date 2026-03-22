const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./models');
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const taskRoutes = require('./routes/tasks');
const { authenticate, optionalAuth } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接和同步
testConnection();
syncDatabase();

// 路由
app.use('/api/auth', authRoutes);  // 认证路由（不需要认证）
app.use('/api/boards', authenticate, boardRoutes);  // 看板路由（需要认证）
app.use('/api/tasks', authenticate, taskRoutes);  // 任务路由（需要认证）

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '协作工具API运行中', database: 'PostgreSQL' });
});

// Socket.io实时通信（需要认证）
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`用户 ${socket.userId} 已连接`);

  socket.on('task-update', (data) => {
    socket.broadcast.emit('task-updated', data);
  });

  socket.on('board-update', (data) => {
    socket.broadcast.emit('board-updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`用户 ${socket.userId} 断开连接`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});