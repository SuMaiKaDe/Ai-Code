const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { verifyToken } = require('./auth');

// 获取最新公告（公开接口）
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const announcements = await Announcement.getLatest(limit);

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取公告失败',
      error: error.message
    });
  }
});

// 获取公告详情（公开接口）
router.get('/:id', async (req, res) => {
  try {
    const announcementId = req.params.id;
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取公告详情失败',
      error: error.message
    });
  }
});

// 创建公告（需要管理员权限）
router.post('/', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可创建公告'
      });
    }
    
    const announcementData = req.body;
    const announcementId = await Announcement.create(announcementData);

    res.status(201).json({
      success: true,
      message: '公告创建成功',
      data: { id: announcementId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建公告失败',
      error: error.message
    });
  }
});

// 获取公告列表（管理员接口）
router.get('/admin/list', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可查看公告列表'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status !== undefined ? parseInt(req.query.status) : null;

    const announcements = await Announcement.findAll(page, limit, status);
    const total = await Announcement.count(status);

    res.json({
      success: true,
      data: {
        announcements,
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
      message: '获取公告列表失败',
      error: error.message
    });
  }
});

// 更新公告（需要管理员权限）
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可更新公告'
      });
    }
    
    const announcementId = req.params.id;
    const announcementData = req.body;

    const updated = await Announcement.update(announcementId, announcementData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    res.json({
      success: true,
      message: '公告更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新公告失败',
      error: error.message
    });
  }
});

// 删除公告（需要管理员权限）
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可删除公告'
      });
    }
    
    const announcementId = req.params.id;

    const deleted = await Announcement.delete(announcementId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    res.json({
      success: true,
      message: '公告删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除公告失败',
      error: error.message
    });
  }
});

module.exports = router;