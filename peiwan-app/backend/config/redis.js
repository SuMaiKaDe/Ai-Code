const redis = require('redis');

// Redis连接配置
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: process.env.REDIS_DB || 0
});

// 连接事件监听
redisClient.on('connect', () => {
  console.log('Redis连接成功');
});

redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err);
});

redisClient.on('ready', () => {
  console.log('Redis准备就绪');
});

// 连接Redis
redisClient.connect().catch(console.error);

module.exports = redisClient;