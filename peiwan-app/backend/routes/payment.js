const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken } = require('./auth');

// 创建微信支付订单
router.post('/wxpay', verifyToken, async (req, res) => {
  try {
    const { order_id, total_amount } = req.body;

    // 验证订单
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '无权访问此订单'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '订单状态错误'
      });
    }

    // TODO: 调用微信支付API创建支付订单
    // 这里暂时返回模拟数据
    const mockPaymentData = {
      appId: 'mock_app_id',
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: 'mock_nonce_str',
      package: 'prepay_id=mock_prepay_id',
      signType: 'RSA',
      paySign: 'mock_pay_sign'
    };

    res.json({
      success: true,
      message: '支付订单创建成功',
      data: mockPaymentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建支付订单失败',
      error: error.message
    });
  }
});

// 微信支付回调
router.post('/wxpay/notify', async (req, res) => {
  try {
    // TODO: 验证微信支付回调签名
    const { transaction_id, out_trade_no, trade_state } = req.body;

    if (trade_state === 'SUCCESS') {
      // 更新订单状态
      // TODO: 根据out_trade_no查找订单并更新支付信息
      console.log('支付成功:', { transaction_id, out_trade_no });
    }

    // 返回微信要求的响应格式
    res.json({ code: 'SUCCESS', message: '成功' });
  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.status(500).json({ code: 'FAIL', message: '处理失败' });
  }
});

// 查询支付状态
router.get('/status/:orderId', verifyToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '无权访问此订单'
      });
    }

    res.json({
      success: true,
      data: {
        order_id: order.id,
        order_no: order.order_no,
        status: order.status,
        payment_method: order.payment_method,
        paid_at: order.paid_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '查询支付状态失败',
      error: error.message
    });
  }
});

// 申请退款
router.post('/refund', verifyToken, async (req, res) => {
  try {
    const { order_id, reason } = req.body;

    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    if (order.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '无权访问此订单'
      });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: '只能申请退款已支付的订单'
      });
    }

    // TODO: 调用微信支付退款API
    res.json({
      success: true,
      message: '退款申请已提交',
      data: {
        refund_id: 'mock_refund_id_' + Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '申请退款失败',
      error: error.message
    });
  }
});

module.exports = router;