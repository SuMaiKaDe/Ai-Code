const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { pool } = require('../config/database');
const { verifyToken } = require('./auth');

// 获取用户信息
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        level: user.level,
        points: user.points,
        created_at: user.created_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

// 更新用户信息
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nickname, avatar, phone } = req.body;

    await User.update(userId, { nickname, avatar, phone });
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        level: updatedUser.level,
        points: updatedUser.points
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
      error: error.message
    });
  }
});

// 获取用户积分记录
router.get('/:id/points', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可查看用户积分记录'
      });
    }
    
    const userId = req.params.id;
    const sql = `
      SELECT ph.*, u.nickname 
      FROM points_history ph 
      LEFT JOIN users u ON ph.user_id = u.id 
      WHERE ph.user_id = ?
      ORDER BY ph.created_at DESC
    `;
    const [rows] = await pool.execute(sql, [userId]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取积分记录失败',
      error: error.message
    });
  }
});

// 升级用户等级（管理员接口）
router.put('/:userId/level', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可更新用户等级'
      });
    }
    
    const userId = req.params.userId;
    const { level } = req.body;

    if (!level || level < 1) {
      return res.status(400).json({
        success: false,
        message: '无效的等级'
      });
    }

    const updated = await User.upgradeLevel(userId, level);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '用户等级更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户等级失败',
      error: error.message
    });
  }
});

// 获取用户列表
router.get('/list', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可查看用户列表'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sql = 'SELECT id, nickname, avatar, level, points, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.execute(sql, [limit, offset]);

    const countSql = 'SELECT COUNT(*) as total FROM users';
    const [countRows] = await pool.execute(countSql);
    const total = countRows[0].total;

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
});

module.exports = router;