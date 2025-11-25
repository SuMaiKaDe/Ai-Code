const { pool } = require('../config/database');

class Order {
  // 创建订单
  static async create(orderData) {
    const { user_id, product_id, total_amount, contact_info, game_account } = orderData;
    const order_no = this.generateOrderNo();
    const sql = `
      INSERT INTO orders (order_no, user_id, product_id, total_amount, contact_info, game_account, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    try {
      const [result] = await pool.execute(sql, [order_no, user_id, product_id, total_amount, contact_info, game_account]);
      return { order_id: result.insertId, order_no };
    } catch (error) {
      throw new Error('创建订单失败: ' + error.message);
    }
  }

  // 生成订单号
  static generateOrderNo() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PW${timestamp}${random}`;
  }

  // 根据用户ID获取订单列表
  static async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT o.*, p.name as product_name, p.image as product_image
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    try {
      const [rows] = await pool.execute(sql, [userId, limit, offset]);
      return rows;
    } catch (error) {
      throw new Error('获取订单列表失败: ' + error.message);
    }
  }

  // 根据订单号查找订单
  static async findByOrderNo(orderNo) {
    const sql = `
      SELECT o.*, u.nickname as user_nickname, p.name as product_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.order_no = ?
    `;
    try {
      const [rows] = await pool.execute(sql, [orderNo]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('查找订单失败: ' + error.message);
    }
  }

  // 更新订单状态
  static async updateStatus(orderId, status) {
    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    try {
      const [result] = await pool.execute(sql, [status, orderId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('更新订单状态失败: ' + error.message);
    }
  }

  // 更新支付信息
  static async updatePayment(orderId, paymentData) {
    const { payment_method, transaction_id, paid_at } = paymentData;
    const sql = `
      UPDATE orders 
      SET payment_method = ?, transaction_id = ?, paid_at = ?, status = 'paid'
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(sql, [payment_method, transaction_id, paid_at, orderId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('更新支付信息失败: ' + error.message);
    }
  }

  // 获取所有订单（管理员）
  static async findAll(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT o.*, u.nickname as user_nickname, p.name as product_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE 1=1
    `;
    let params = [];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      throw new Error('获取订单列表失败: ' + error.message);
    }
  }

  // 获取订单总数（管理员）
  static async count(status = null) {
    let sql = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    let params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    try {
      const [rows] = await pool.execute(sql, params);
      return rows[0].total;
    } catch (error) {
      throw new Error('获取订单总数失败: ' + error.message);
    }
  }
}

module.exports = Order;