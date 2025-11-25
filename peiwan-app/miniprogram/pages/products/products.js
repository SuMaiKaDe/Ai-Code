const app = getApp()

Page({
  data: {
    categories: ['全部', '王者荣耀', '英雄联盟', '和平精英', '原神'],
    currentCategory: '全部',
    products: [],
    loading: false,
    page: 1,
    hasMore: true,
    searchKeyword: ''
  },

  onLoad(options) {
    if (options.category) {
      this.setData({
        currentCategory: options.category
      })
    }
    this.loadProducts()
  },

  // 加载商品列表
  loadProducts() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })

    const params = {
      page: this.data.page,
      limit: 10
    }

    if (this.data.currentCategory !== '全部') {
      params.category = this.data.currentCategory
    }

    if (this.data.searchKeyword) {
      params.keyword = this.data.searchKeyword
    }

    app.request({
      url: '/product/list',
      method: 'GET',
      data: params
    }).then(res => {
      if (res.success) {
        const newProducts = res.data.products
        const products = this.data.page === 1 ? newProducts : [...this.data.products, ...newProducts]
        
        this.setData({
          products,
          hasMore: newProducts.length === 10,
          page: this.data.page + 1
        })
      }
    }).catch(err => {
      app.showError('加载商品失败')
    }).finally(() => {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    })
  },

  // 切换分类
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    if (category === this.data.currentCategory) return

    this.setData({
      currentCategory: category,
      products: [],
      page: 1,
      hasMore: true
    })
    this.loadProducts()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 搜索
  onSearch() {
    this.setData({
      products: [],
      page: 1,
      hasMore: true
    })
    this.loadProducts()
  },

  // 点击商品
  onProductTap(e) {
    const product = e.currentTarget.dataset.product
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${product.id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      products: [],
      page: 1,
      hasMore: true
    })
    this.loadProducts()
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadProducts()
  }
})