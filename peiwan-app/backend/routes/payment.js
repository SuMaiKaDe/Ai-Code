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

    // 实际应用中应调用微信支付API创建支付订单
    // 以下是模拟实现，实际部署时需替换为真实的微信支付API调用
    const { createWxPayInstance } = require('../config/wxpay'); // 假设配置了微信支付
    const wxPay = createWxPayInstance();
    
    // 构建支付参数
    const params = {
      description: `购买陪玩服务-${order.product_name}`,
      out_trade_no: order.order_no,
      amount: {
        total: Math.round(order.total_amount * 100) // 以分为单位
      },
      notify_url: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/payment/wxpay/notify`,
      appid: process.env.WX_MINI_APPID,
      mchid: process.env.WX_MCH_ID
    };

    // TODO: 调用微信支付API创建支付订单
    // 这里暂时返回模拟数据
    const mockPaymentData = {
      appId: process.env.WX_MINI_APPID || 'mock_app_id',
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
    // 在实际应用中，需要验证微信支付回调签名
    // const { createWxPayInstance } = require('../config/wxpay');
    // const wxPay = createWxPayInstance();
    // const isValid = await wxPay.verifySignature(req.headers, req.body);
    // if (!isValid) {
    //   return res.status(400).json({ code: 'FAIL', message: '签名验证失败' });
    // }
    
    const { transaction_id, out_trade_no, trade_state } = req.body;

    if (trade_state === 'SUCCESS') {
      // 根据out_trade_no查找订单并更新支付信息
      const sql = 'SELECT id, user_id, total_amount FROM orders WHERE order_no = ?';
      const [rows] = await require('../config/database').pool.execute(sql, [out_trade_no]);
      
      if (rows.length > 0) {
        const order = rows[0];
        
        // 更新订单状态为已支付
        const updateSql = `
          UPDATE orders 
          SET status = 'paid', 
              payment_method = 'wxpay', 
              transaction_id = ?, 
              paid_at = NOW(),
              updated_at = NOW()
          WHERE order_no = ?
        `;
        await require('../config/database').pool.execute(updateSql, [transaction_id, out_trade_no]);
        
        // 增加用户积分（例如，消费金额的10%）
        const pointsToAdd = Math.round(order.total_amount * 10); // 每元10积分
        const userSql = 'UPDATE users SET points = points + ? WHERE id = ?';
        await require('../config/database').pool.execute(userSql, [pointsToAdd, order.user_id]);
        
        console.log('支付成功:', { transaction_id, out_trade_no, order_id: order.id });
      } else {
        console.error('未找到对应的订单:', out_trade_no);
      }
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

    // 实际应用中应调用微信支付退款API
    // const { createWxPayInstance } = require('../config/wxpay');
    // const wxPay = createWxPayInstance();
    // const refundResult = await wxPay.refund({
    //   out_trade_no: order.order_no,
    //   out_refund_no: `refund_${Date.now()}`,
    //   amount: {
    //     refund: Math.round(order.total_amount * 100), // 以分为单位
    //     total: Math.round(order.total_amount * 100),
    //     currency: 'CNY'
    //   },
    //   reason: reason || '用户申请退款'
    // });
    
    // 更新订单状态为退款中
    const updateSql = `
      UPDATE orders 
      SET status = 'refunded', 
          updated_at = NOW()
      WHERE id = ?
    `;
    await require('../config/database').pool.execute(updateSql, [order_id]);

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