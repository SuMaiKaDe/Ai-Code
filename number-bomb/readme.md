# 数字炸弹游戏

## 项目简介
这是一个基于 Node.js 和 Socket.IO 实现的多人实时在线数字炸弹游戏。玩家可以创建或加入房间，通过选择数字来尝试避开隐藏的炸弹。游戏支持多人同时参与，具有倒计时、颜色渲染、爆炸动画等丰富的交互效果，同时还适配了移动端页面，提供了良好的用户体验。

## 功能特性
1. **多人游戏**：支持多个玩家同时加入一个房间进行游戏。
2. **准备机制**：只有一号玩家可以点击开始游戏，其他玩家加入房间后点击准备，所有玩家准备好以后一号玩家才能开始游戏，并且页面会显示各个玩家的准备状态。
3. **倒计时**：每个玩家有 10 秒钟的选择时间，超时则游戏失败。
4. **颜色渲染**：玩家选择数字后，排除的部分会变成该玩家分配的颜色，且不能再选。
5. **爆炸动画**：当玩家选中炸弹时，会触发爆炸动画和音效。
6. **移动端适配**：游戏页面在移动端也能完美显示和操作。

## 技术栈
- **前端**：HTML、CSS、JavaScript、Socket.IO
- **后端**：Node.js、Express、Socket.IO

## 安装与运行

### 步骤 1：克隆项目
```bash
git clone https://github.com/your-repo-url/digital-bomb-game.git
cd digital-bomb-game
```

### 步骤 2：安装依赖
```bash
npm install
```

### 步骤 3：启动服务器
```bash
node server.js
```

### 步骤 4：访问游戏
打开浏览器，访问 `http://localhost:3000/`输入房间号，即可开始游戏。多人输入同一个房间号进入同一个房间

## 文件结构
```
digital-bomb-game/
├── public/
    ├── game.html
    ├── index.html
    ├── countdown.mp3
    ├── explosion.mp3
    └── select.mp3
├── server.js
├── package.json
└── README.md
```
- `public/game.html`：游戏的前端页面，包含 HTML、CSS 和 JavaScript 代码。
- `server.js`：游戏的后端服务器代码，使用 Node.js 和 Socket.IO 实现。
- `package.json`：项目的依赖配置文件。
- `README.md`：项目的说明文档。

## 使用说明
1. **加入房间**：打开浏览器，输入 `http://localhost:3000/game.html?roomCode=yourRoomCode` 加入指定房间。
2. **准备游戏**：一号玩家等待其他玩家点击 “准备” 按钮，当所有玩家都准备好后，一号玩家点击 “开始游戏”。
3. **开始游戏**：游戏开始后，每个玩家轮流选择一个数字，排除的数字会变成该玩家的颜色。
4. **游戏结束**：如果玩家选中炸弹或超时，则游戏失败，爆炸动画结束后，玩家需要重新准备开始新游戏。

## 许可证
本项目采用 [MIT 许可证](https://opensource.org/licenses/MIT)。

# 本项目由豆包Ai生成。
