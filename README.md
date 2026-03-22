# Collab Tool - 在线协作工具

```markdown

[![GitHub stars](https://img.shields.io/github/stars/WL7749/colab-tool)](https://github.com/WL7749/colab-tool/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/WL7749/colab-tool)](https://github.com/WL7749/colab-tool/network)
[![GitHub issues](https://img.shields.io/github/issues/WL7749/colab-tool)](https://github.com/WL7749/colab-tool/issues)
[![GitHub license](https://img.shields.io/github/license/WL7749/colab-tool)](https://github.com/WL7749/colab-tool/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791)](https://www.postgresql.org/)

一个功能完整的在线协作工具，支持看板管理、任务拖拽、实时同步等功能。

## 功能特点

### 核心功能
- 用户认证系统 - 安全的注册/登录功能，JWT令牌认证
- 看板管理 - 创建、编辑、删除看板，多项目并行管理
- 任务管理 - 添加、编辑、删除任务，支持优先级设置
- 拖拽排序 - 流畅的拖拽体验，支持任务跨列移动
- 实时同步 - WebSocket实现多用户实时协作
- 优先级标记 - 高/中/低三级优先级
- 数据统计 - 实时统计任务数量和完成情况

### 技术亮点
- 前后端分离架构
- RESTful API设计
- JWT身份认证
- WebSocket实时通信
- 响应式UI设计
- 数据库关联查询优化

## 技术栈

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 16+ | JavaScript运行时 |
| Express | 4.18+ | Web框架 |
| PostgreSQL | 14+ | 关系型数据库 |
| Sequelize | 6.35+ | ORM框架 |
| Socket.io | 4.6+ | 实时通信 |
| JWT | 9.0+ | 身份认证 |
| bcryptjs | 2.4+ | 密码加密 |
| dotenv | 16.0+ | 环境变量管理 |

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.2 | UI框架 |
| React Router | 6.14+ | 路由管理 |
| Axios | 1.4+ | HTTP请求 |
| Socket.io-client | 4.6+ | WebSocket客户端 |
| react-beautiful-dnd | 13.1+ | 拖拽功能 |

## 项目结构

```
colab-tool/
├── client/                      # 前端项目
│   ├── public/                  # 静态资源
│   │   ├── index.html          # HTML模板
│   │   └── favicon.ico         # 网站图标
│   ├── src/
│   │   ├── components/         # React组件
│   │   │   ├── Board/          # 看板组件
│   │   │   ├── Column/         # 列组件
│   │   │   └── Task/           # 任务组件
│   │   ├── pages/              # 页面组件
│   │   │   ├── Login.js        # 登录页面
│   │   │   ├── Register.js     # 注册页面
│   │   │   └── Boards.js       # 看板列表
│   │   ├── context/            # React Context
│   │   │   └── AuthContext.js  # 认证上下文
│   │   ├── services/           # API服务
│   │   │   └── api.js          # API请求封装
│   │   ├── App.js              # 主应用组件
│   │   └── index.js            # 应用入口
│   └── package.json            # 前端依赖
├── server/                      # 后端项目
│   ├── config/                 # 配置文件
│   │   └── database.js         # 数据库配置
│   ├── models/                 # 数据模型
│   │   ├── User.js             # 用户模型
│   │   ├── Board.js            # 看板模型
│   │   ├── Column.js           # 列模型
│   │   ├── Task.js             # 任务模型
│   │   └── index.js            # 模型导出
│   ├── routes/                 # 路由
│   │   ├── auth.js             # 认证路由
│   │   ├── boards.js           # 看板路由
│   │   └── tasks.js            # 任务路由
│   ├── middleware/             # 中间件
│   │   └── auth.js             # 认证中间件
│   ├── server.js               # 服务器入口
│   └── package.json            # 后端依赖
├── .gitignore                  # Git忽略文件
└── README.md                   # 项目说明
```

## 数据库设计

### 表结构

#### users (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名，唯一 |
| email | VARCHAR(100) | 邮箱，唯一 |
| password | VARCHAR(255) | 加密密码 |
| role | ENUM | 角色：user/admin |
| isActive | BOOLEAN | 是否激活 |
| lastLogin | TIMESTAMP | 最后登录时间 |

#### boards (看板表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(100) | 看板名称 |
| description | TEXT | 看板描述 |

#### columns (列表表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| boardId | UUID | 所属看板ID |
| title | VARCHAR(50) | 列标题 |
| order | INTEGER | 排序序号 |

#### tasks (任务表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| boardId | UUID | 所属看板ID |
| columnId | UUID | 所属列ID |
| title | VARCHAR(200) | 任务标题 |
| description | TEXT | 任务描述 |
| priority | ENUM | 优先级：low/medium/high |
| completed | BOOLEAN | 是否完成 |
| order | INTEGER | 排序序号 |

## 快速开始

### 环境要求
- Node.js (v16 或更高)
- PostgreSQL (v14 或更高)
- npm 或 yarn

### 安装步骤

#### 1. 克隆项目
```bash
git clone https://github.com/WL7749/colab-tool.git
cd colab-tool
```

#### 2. 配置数据库

创建 PostgreSQL 数据库：
```sql
CREATE DATABASE collab_tool;
```

#### 3. 配置环境变量

复制环境变量模板：
```bash
cd server
cp .env.example .env
```

编辑 `.env` 文件：
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=collab_tool
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_change_this
PORT=5000
```

#### 4. 安装依赖并启动后端

```bash
cd server
npm install
npm start
```

#### 5. 安装依赖并启动前端

打开新终端：
```bash
cd client
npm install
npm start
```

#### 6. 访问应用

- 前端地址：http://localhost:3000
- 后端API：http://localhost:5000

### 默认账号
| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |

## API文档

### 认证接口

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

响应：
```json
{
  "message": "注册成功",
  "user": {
    "id": "uuid",
    "username": "zhangsan",
    "email": "zhangsan@example.com"
  },
  "token": "jwt_token"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "zhangsan",
  "password": "123456"
}
```

响应：
```json
{
  "message": "登录成功",
  "user": {
    "id": "uuid",
    "username": "zhangsan",
    "email": "zhangsan@example.com"
  },
  "token": "jwt_token"
}
```

### 看板接口

#### 获取所有看板
```http
GET /api/boards
Authorization: Bearer <token>
```

#### 创建看板
```http
POST /api/boards
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "我的看板",
  "description": "看板描述"
}
```

### 任务接口

#### 获取所有任务
```http
GET /api/tasks
Authorization: Bearer <token>
```

#### 创建任务
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "任务标题",
  "description": "任务描述",
  "columnId": "column_uuid",
  "boardId": "board_uuid",
  "priority": "medium"
}
```

#### 更新任务
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新标题",
  "columnId": "new_column_uuid",
  "order": 0
}
```

#### 删除任务
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

## 部署

### 前端部署到Vercel
```bash
cd client
npm run build
vercel --prod
```

### 后端部署到Railway
```bash
cd server
railway login
railway init
railway up
```

### 使用Docker部署

创建 `Dockerfile`：
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

构建并运行：
```bash
docker build -t collab-tool .
docker run -p 5000:5000 collab-tool
```

## 常见问题

### 1. 数据库连接失败
- 检查PostgreSQL服务是否启动
- 确认.env文件中的数据库配置正确
- 验证用户名和密码是否正确

### 2. 端口被占用
```bash
# 查看占用5000端口的进程
netstat -ano | findstr :5000
# 结束进程
taskkill /PID <PID> /F
```

### 3. 前端无法连接后端
- 确认后端服务已启动
- 检查API地址配置是否正确
- 查看浏览器控制台错误信息

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目地址: https://github.com/WL7749/colab-tool
- 问题反馈: https://github.com/WL7749/colab-tool/issues

## 致谢

感谢所有为这个项目做出贡献的开发者。

这份README文档包含了项目的完整介绍，包括功能特点、技术栈、项目结构、数据库设计、快速开始指南、API文档、部署说明等内容，格式清晰专业。
