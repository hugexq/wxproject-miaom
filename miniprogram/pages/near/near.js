// miniprogram/pages/near/near.js

const db = wx.cloud.database();
const app = getApp()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: '',
    latitude: '',
    markers: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getLocation();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getLocation();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getLocation () {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        this.setData({
          longitude,
          latitude
        });
        this.getNearUsers();
      }
    })
  },
  getNearUsers () {
    db.collection('users').where({
      location: _.geoNear({
        geometry: db.Geo.Point(this.data.longitude, this.data.latitude),
        minDistance: 0,
        maxDistance: 5000
      }),
      isLocation: true
    }).field({ // 选择要查询的字段
      longitude: true,
      latitude: true,
      userPhoto: true
    }).get().then((res) => {
      // console.log(res.data)
      let data = res.data;
      let result = [];
      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].userPhoto.includes('cloud://')) {
            wx.cloud.getTempFileURL({
              fileList: [data[i].userPhoto],
              success: res => {
                result.push({
                  iconPath: data[i].fileList[0].tempFileUrl,
                  id: data[i]._id,
                  latitude: data[i].latitude,
                  longitude: data[i].longitude,
                  width: 30,
                  height: 30
                });
                this.setData({
                  markers: result
                });
              }
            })
          } else {
            result.push({
              iconPath: data[i].userPhoto,
              id: data[i]._id,
              latitude: data[i].latitude,
              longitude: data[i].longitude,
              width: 30,
              height: 30
            })
          }

        }
        this.setData({
          markers: result
        })
      }
    })
  },
  // 点击图片跳转详情页
  markertap (ev) {
    wx.navigateTo({
      url: '/pages/detail/detail?userId=' + ev.markerId
    })
  }
})