const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken } = require('./auth');

// 创建订单
router.post('/', verifyToken, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      user_id: req.user.userId
    };

    const result = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建订单失败',
      error: error.message
    });
  }
});

// 获取用户订单列表
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.findByUserId(userId, page, limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取订单列表失败',
      error: error.message
    });
  }
});

// 获取订单详情
router.get('/:orderNo', verifyToken, async (req, res) => {
  try {
    const orderNo = req.params.orderNo;
    const order = await Order.findByOrderNo(orderNo);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 验证订单是否属于当前用户（非管理员）
    if (order.user_id !== req.user.userId) {
      // 检查用户是否为管理员
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '无权访问此订单'
        });
      }
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: error.message
    });
  }
});

// 更新订单状态（管理员接口）
router.put('/:orderId/status', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可更新订单状态'
      });
    }
    
    const orderId = req.params.orderId;
    const { status } = req.body;

    const updated = await Order.updateStatus(orderId, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      message: '订单状态更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新订单状态失败',
      error: error.message
    });
  }
});

// 获取所有订单（管理员接口）
router.get('/admin/list', verifyToken, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可查看所有订单'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;

    const orders = await Order.findAll(page, limit, status);
    const total = await Order.count(status);

    res.json({
      success: true,
      data: {
        orders,
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
      message: '获取订单列表失败',
      error: error.message
    });
  }
});

module.exports = router;