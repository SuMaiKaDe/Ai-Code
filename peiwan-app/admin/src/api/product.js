import request from '@/utils/request'

// 获取商品列表
export function getProductList(params) {
  return request({
    url: '/api/products/list',
    method: 'get',
    params
  })
}

// 获取商品详情
export function getProductDetail(id) {
  return request({
    url: `/api/products/${id}`,
    method: 'get'
  })
}

// 创建商品
export function createProduct(data) {
  return request({
    url: '/api/products',
    method: 'post',
    data
  })
}

// 更新商品
export function updateProduct(id, data) {
  return request({
    url: `/api/products/${id}`,
    method: 'put',
    data
  })
}

// 删除商品
export function deleteProductById(id) {
  return request({
    url: `/api/products/${id}`,
    method: 'delete'
  })
}

// 更新商品状态
export function updateProductStatus(id, status) {
  return request({
    url: `/api/products/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 获取商品分类列表
export function getProductCategories() {
  return request({
    url: '/api/products/categories/list',
    method: 'get'
  })
}