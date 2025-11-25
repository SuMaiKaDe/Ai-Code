const app = getApp()

Page({
  data: {
    userInfo: null,
    banners: [],
    categories: [
      { id: 1, name: '王者荣耀', icon: '🎮' },
      { id: 2, name: '英雄联盟', icon: '⚔️' },
      { id: 3, name: '和平精英', icon: '🔫' },
      { id: 4, name: '原神', icon: '🗡️' }
    ],
    hotProducts: [],
    announcements: []
  },

  onLoad() {
    this.checkLogin()
    this.loadBanners()
    this.loadHotProducts()
    this.loadAnnouncements()
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
    }
  },

  // 加载轮播图
  loadBanners() {
    // TODO: 调用API获取轮播图
    this.setData({
      banners: [
        { id: 1, image: '/images/banner1.jpg', title: '专业陪玩服务' },
        { id: 2, image: '/images/banner2.jpg', title: '快速上分' },
        { id: 3, image: '/images/banner3.jpg', title: '安全可靠' }
      ]
    })
  },

  // 加载热门商品
  loadHotProducts() {
    app.request({
      url: '/product/list',
      method: 'GET',
      data: { limit: 6 }
    }).then(res => {
      if (res.success) {
        this.setData({
          hotProducts: res.data.products
        })
      }
    }).catch(err => {
      console.error('加载热门商品失败:', err)
    })
  },

  // 加载公告
  loadAnnouncements() {
    app.request({
      url: '/announcement/latest',
      method: 'GET',
      data: { limit: 3 }
    }).then(res => {
      if (res.success) {
        this.setData({
          announcements: res.data
        })
      }
    }).catch(err => {
      console.error('加载公告失败:', err)
    })
  },

  // 点击分类
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    wx.navigateTo({
      url: `/pages/products/products?category=${category.name}`
    })
  },

  // 点击商品
  onProductTap(e) {
    const product = e.currentTarget.dataset.product
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${product.id}`
    })
  },

  // 点击公告
  onAnnouncementTap(e) {
    const announcement = e.currentTarget.dataset.announcement
    wx.navigateTo({
      url: `/pages/announcement-detail/announcement-detail?id=${announcement.id}`
    })
  },

  // 点击轮播图
  onBannerTap(e) {
    const banner = e.currentTarget.dataset.banner
    // TODO: 处理轮播图点击事件
    console.log('点击轮播图:', banner)
  },

  // 下拉刷新
  onPullDownRefresh() {
    Promise.all([
      this.loadBanners(),
      this.loadHotProducts(),
      this.loadAnnouncements()
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})