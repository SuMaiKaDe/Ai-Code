const app = getApp()

Page({
  data: {
    userInfo: null,
    menuItems: [
      { id: 1, title: '我的订单', icon: '📋', url: '/pages/orders/orders' },
      { id: 2, title: '我的积分', icon: '💎', url: '' },
      { id: 3, title: '收货地址', icon: '📍', url: '' },
      { id: 4, title: '联系客服', icon: '💬', url: '' },
      { id: 5, title: '关于我们', icon: 'ℹ️', url: '' }
    ]
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 检查登录状态
  checkLogin() {
    if (!app.globalData.token) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 点击菜单项
  onMenuItemTap(e) {
    const item = e.currentTarget.dataset.item
    if (item.url) {
      wx.navigateTo({
        url: item.url
      })
    } else {
      app.showError('功能开发中')
    }
  },

  // 退出登录
  onLogoutTap() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.token = null
          app.globalData.userInfo = null
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})