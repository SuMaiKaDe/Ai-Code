# 陪玩小程序

一个完整的陪玩服务平台，包含管理后台、微信小程序和后端API服务。

## 项目结构

```
peiwan-app/
├── backend/          # Node.js 后端服务
│   ├── config/       # 配置文件
│   ├── models/       # 数据模型
│   ├── routes/       # 路由文件
│   ├── middleware/   # 中间件
│   ├── utils/        # 工具函数
│   └── uploads/      # 上传文件目录
├── admin/            # Vue 管理后台
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── views/       # 页面
│   │   ├── router/      # 路由
│   │   ├── store/       # 状态管理
│   │   ├── utils/       # 工具函数
│   │   └── api/         # API接口
└── miniprogram/      # 微信小程序
    ├── pages/         # 页面
    ├── components/    # 组件
    ├── utils/         # 工具函数
    ├── images/        # 图片资源
    └── styles/        # 样式文件
```

## 功能特性

### 后端服务 (Node.js)
- 用户认证和授权
- 商品管理
- 订单管理
- 公告管理
- 微信支付集成
- 数据统计分析

### 管理后台 (Vue)
- 商品管理（增删改查）
- 订单管理（状态更新、退款）
- 用户管理（等级、积分调整）
- 公告管理
- 数据统计仪表盘

### 微信小程序
- 用户登录（微信授权）
- 商品浏览和搜索
- 下单支付
- 订单管理
- 公告查看
- 个人中心

## 技术栈

### 后端
- Node.js
- Express.js
- MySQL
- Redis
- JWT

### 管理后台
- Vue 3
- Element Plus
- Vue Router
- Pinia
- Axios

### 小程序
- 原生微信小程序
- 微信支付

## 快速开始

### 1. 环境准备
- Node.js 16+
- MySQL 5.7+
- Redis 6+
- 微信开发者工具

### 2. 后端服务
```bash
cd backend
npm install
# 配置数据库连接
# 创建数据库并导入 database.sql
npm run dev
```

### 3. 管理后台
```bash
cd admin
npm install
npm run dev
```

### 4. 微信小程序
- 使用微信开发者工具打开 miniprogram 目录
- 配置小程序 AppID
- 预览或发布

### 5. 数据库配置
1. 创建数据库 `peiwan`
2. 导入 `backend/database.sql` 文件
3. 修改 `backend/config/database.js` 中的数据库连接信息

### 6. 环境变量配置
在后端项目根目录创建 `.env` 文件：
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=peiwan

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=your_jwt_secret
```

## API 文档

### 认证接口
- POST `/api/auth/wxlogin` - 微信登录

### 商品接口
- GET `/api/product/list` - 获取商品列表
- GET `/api/product/:id` - 获取商品详情
- POST `/api/product` - 创建商品（管理员）
- PUT `/api/product/:id` - 更新商品（管理员）
- DELETE `/api/product/:id` - 删除商品（管理员）

### 订单接口
- POST `/api/order` - 创建订单
- GET `/api/order/my` - 获取我的订单
- GET `/api/order/:orderNo` - 获取订单详情
- PUT `/api/order/:orderId/status` - 更新订单状态（管理员）

### 公告接口
- GET `/api/announcement/latest` - 获取最新公告
- GET `/api/announcement/:id` - 获取公告详情
- POST `/api/announcement` - 创建公告（管理员）
- PUT `/api/announcement/:id` - 更新公告（管理员）
- DELETE `/api/announcement/:id` - 删除公告（管理员）

### 支付接口
- POST `/api/payment/wxpay` - 创建微信支付订单
- POST `/api/payment/wxpay/notify` - 微信支付回调
- GET `/api/payment/status/:orderId` - 查询支付状态

## 部署说明

### 后端部署
1. 使用 PM2 管理进程
2. 配置 Nginx 反向代理
3. 设置 SSL 证书

### 管理后台部署
1. 执行 `npm run build` 构建静态文件
2. 使用 Nginx 或其他 Web 服务器托管

### 小程序发布
1. 在微信公众平台注册小程序
2. 配置服务器域名
3. 提交审核并发布

## 注意事项

1. 微信支付需要配置真实的商户信息
2. 小程序需要配置合法域名
3. 生产环境建议使用 HTTPS
4. 定期备份数据库

## 许可证

MIT License