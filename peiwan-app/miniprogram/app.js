App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:3000/api'
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.getUserInfo()
    }

    // 检查更新
    this.checkUpdate()
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })

          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请检查网络后重试',
              showCancel: false
            })
          })
        }
      })
    }
  },

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 获取用户信息
            wx.getUserProfile({
              desc: '用于完善用户资料',
              success: (userRes) => {
                // 发送到后端
                this.request({
                  url: '/auth/wxlogin',
                  method: 'POST',
                  data: {
                    code: res.code,
                    userInfo: userRes.userInfo
                  }
                }).then(loginRes => {
                  if (loginRes.success) {
                    this.globalData.token = loginRes.data.token
                    this.globalData.userInfo = loginRes.data.user
                    wx.setStorageSync('token', loginRes.data.token)
                    wx.setStorageSync('userInfo', loginRes.data.user)
                    resolve(loginRes.data)
                  } else {
                    reject(new Error(loginRes.message))
                  }
                }).catch(err => {
                  reject(err)
                })
              },
              fail: (err) => {
                reject(err)
              }
            })
          } else {
            reject(new Error('登录失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  // 获取用户信息
  getUserInfo() {
    return this.request({
      url: '/user/profile',
      method: 'GET'
    }).then(res => {
      if (res.success) {
        this.globalData.userInfo = res.data
        wx.setStorageSync('userInfo', res.data)
      }
      return res
    })
  },

  // 网络请求封装
  request(options) {
    return new Promise((resolve, reject) => {
      const { url, method = 'GET', data = {}, header = {} } = options
      
      // 显示加载提示
      wx.showLoading({
        title: '加载中...',
        mask: true
      })

      wx.request({
        url: this.globalData.baseUrl + url,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : '',
          ...header
        },
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(err)
        },
        complete: () => {
          wx.hideLoading()
        }
      })
    })
  },

  // 显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  },

  // 显示成功提示
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    })
  }
})