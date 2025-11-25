const app = getApp()

Page({
  data: {
    canIUseGetUserProfile: false,
    loading: false
  },

  onLoad() {
    // 检查是否支持 getUserProfile
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  // 微信登录
  onWxLogin() {
    if (this.data.loading) return

    this.setData({ loading: true })

    app.wxLogin().then(userInfo => {
      app.showSuccess('登录成功')
      wx.switchTab({
        url: '/pages/index/index'
      })
    }).catch(err => {
      console.error('登录失败:', err)
      app.showError('登录失败，请重试')
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  // 游客模式（可选功能）
  onGuestMode() {
    wx.showModal({
      title: '提示',
      content: '游客模式功能有限，建议使用微信登录获得完整体验',
      confirmText: '继续',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // TODO: 实现游客模式
          app.showError('游客模式开发中')
        }
      }
    })
  }
})