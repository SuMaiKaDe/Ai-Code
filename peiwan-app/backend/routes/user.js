const express = require('express');
const router = express.Router();
const User = require('../models/User');
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
router.get('/points/history', verifyToken, async (req, res) => {
  try {
    // TODO: 实现积分记录查询
    res.json({
      success: true,
      data: [],
      message: '积分记录功能开发中'
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
    // TODO: 添加管理员权限验证
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

// 获取用户列表（管理员接口）
router.get('/admin/list', verifyToken, async (req, res) => {
  try {
    // TODO: 添加管理员权限验证和分页功能
    res.json({
      success: true,
      data: [],
      message: '用户列表功能开发中'
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