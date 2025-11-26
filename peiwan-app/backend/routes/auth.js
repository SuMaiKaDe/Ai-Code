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

    // 调用微信API获取openid和session_key
    const wxLoginUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WX_MINI_APPID}&secret=${process.env.WX_MINI_SECRET}&js_code=${code}&grant_type=authorization_code`;
    
    const response = await fetch(wxLoginUrl);
    const wxData = await response.json();
    
    if (!wxData.openid) {
      return res.status(400).json({
        success: false,
        message: '微信登录失败: ' + wxData.errmsg
      });
    }
    
    const openid = wxData.openid;
    
    // 查找或创建用户
    let user = await User.findByOpenid(openid);
    
    if (!user) {
      // 创建新用户
      const userId = await User.create({
        openid: openid,
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
const verifyToken = async (req, res, next) => {
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
    
    // 检查是否为管理员
    if (req.path.startsWith('/api/products') || req.path.startsWith('/api/orders') || 
        req.path.startsWith('/api/users') || req.path.startsWith('/api/announcements')) {
      // 对于管理接口，需要验证管理员身份
      const adminSql = 'SELECT id, username, role FROM admins WHERE id = ? AND status = 1';
      const [adminRows] = await require('../config/database').pool.execute(adminSql, [decoded.userId]);
      
      if (adminRows.length > 0) {
        req.user.role = adminRows[0].role;
      } else {
        return res.status(403).json({
          success: false,
          message: '权限不足，仅管理员可访问'
        });
      }
    }
    
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