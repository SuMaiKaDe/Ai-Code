import request from '@/utils/request'

// 获取订单列表
export function getOrderList(params) {
  return request({
    url: '/api/orders/admin/list',
    method: 'get',
    params
  })
}

// 确认订单完成
export function confirmOrderCompletion(orderId) {
  return request({
    url: `/api/orders/${orderId}/status`,
    method: 'put',
    data: { status: 'completed' }
  })
}

// 取消订单
export function cancelOrderAPI(orderId) {
  return request({
    url: `/api/orders/${orderId}/status`,
    method: 'put',
    data: { status: 'cancelled' }
  })
}

// 退款订单
export function refundOrderAPI(orderId) {
  return request({
    url: `/api/orders/${orderId}/status`,
    method: 'put',
    data: { status: 'refunded' }
  })
}