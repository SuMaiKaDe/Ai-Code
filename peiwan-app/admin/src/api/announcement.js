import request from '@/utils/request'

// 获取公告列表
export function getAnnouncementList(params) {
  return request({
    url: '/api/announcements/admin/list',
    method: 'get',
    params
  })
}

// 创建公告
export function createAnnouncement(data) {
  return request({
    url: '/api/announcements',
    method: 'post',
    data
  })
}

// 更新公告
export function updateAnnouncement(id, data) {
  return request({
    url: `/api/announcements/${id}`,
    method: 'put',
    data
  })
}

// 删除公告
export function deleteAnnouncementById(id) {
  return request({
    url: `/api/announcements/${id}`,
    method: 'delete'
  })
}

// 更新公告状态
export function updateAnnouncementStatus(id, status) {
  return request({
    url: `/api/announcements/${id}/status`,
    method: 'put',
    data: { status }
  })
}