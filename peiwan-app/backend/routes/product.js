const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken } = require('./auth');

// 获取商品列表（公开接口）
router.get('/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || null;

    const products = await Product.findAll(page, limit, category);
    const total = await Product.count(category);

    res.json({
      success: true,
      data: {
        products,
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
      message: '获取商品列表失败',
      error: error.message
    });
  }
});

// 获取商品详情（公开接口）
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取商品详情失败',
      error: error.message
    });
  }
});

// 获取商品分类（公开接口）
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message
    });
  }
});

// 创建商品（需要管理员权限）
router.post('/', verifyToken, async (req, res) => {
  try {
    // TODO: 添加管理员权限验证
    const productData = req.body;
    const productId = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: '商品创建成功',
      data: { id: productId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建商品失败',
      error: error.message
    });
  }
});

// 更新商品（需要管理员权限）
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // TODO: 添加管理员权限验证
    const productId = req.params.id;
    const productData = req.body;

    const updated = await Product.update(productId, productData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '商品更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新商品失败',
      error: error.message
    });
  }
});

// 删除商品（需要管理员权限）
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // TODO: 添加管理员权限验证
    const productId = req.params.id;

    const deleted = await Product.delete(productId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除商品失败',
      error: error.message
    });
  }
});

module.exports = router;