const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'peiwan_secret_key';

// 微信小程序登录
router.post('/wxlogin', async (req, res) => {
  try {
    const { code, userInfo } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少登录凭证'
      });
    }

    // TODO: 调用微信API获取openid和session_key
    // 这里暂时使用模拟数据，实际需要调用微信接口
    const mockOpenid = 'mock_openid_' + Date.now();
    
    // 查找或创建用户
    let user = await User.findByOpenid(mockOpenid);
    
    if (!user) {
      // 创建新用户
      const userId = await User.create({
        openid: mockOpenid,
        nickname: userInfo?.nickName || '微信用户',
        avatar: userInfo?.avatarUrl || ''
      });
      user = await User.findById(userId);
    } else if (userInfo) {
      // 更新用户信息
      await User.update(user.id, {
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl
      });
      user = await User.findById(user.id);
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          level: user.level,
          points: user.points
        }
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 验证token中间件
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '缺少访问令牌'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '无效的访问令牌'
    });
  }
};

module.exports = router;
module.exports.verifyToken = verifyToken;