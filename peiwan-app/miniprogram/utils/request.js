const app = getApp()

// 网络请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, header = {} } = options
    
    wx.request({
      url: app.globalData.baseUrl + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : '',
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
      }
    })
  })
}

// 文件上传
const uploadFile = (filePath, formData = {}) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '上传中...',
      mask: true
    })

    wx.uploadFile({
      url: app.globalData.baseUrl + '/upload',
      filePath: filePath,
      name: 'file',
      formData: formData,
      header: {
        'Authorization': app.globalData.token ? `Bearer ${app.globalData.token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        resolve(data)
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  })
}

module.exports = {
  request,
  uploadFile
}