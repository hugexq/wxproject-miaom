// miniprogram/pages/index/index.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    listData: [],
    current: 'links'
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
    this.getListData()
    this.getBannerLis()
  },

  /**
   * 点赞
   * @param {*} ev 
   */
  handleLinks (ev) {
    let id = ev.target.dataset.id;

    wx.cloud.callFunction({
      name: 'update',
      data: {
        collection: 'users',
        doc: id,
        data: "{links : _.inc(1)}"
      }
    }).then((res) => {
      let updated = res.result.stats.updated;
      if (updated) {
        let cloneListData = [...this.data.listData];
        for (let i = 0; i < cloneListData.length; i++) {
          if (cloneListData[i]._id == id) {
            cloneListData[i].links++;
          }
        }
        this.setData({
          listData: cloneListData
        });
      }
    });
  },

  /**
   * 推荐 最新
   */
  handleCurrent (ev) {
    let current = ev.target.dataset.current;
    if (current == this.data.current) {
      return false;
    }
    this.setData({
      current
    }, () => {
      this.getListData();
    });
  },
  getListData () {
    db.collection('users')
      .field({
        userPhoto: true,
        nickName: true,
        links: true
      })
      .orderBy(this.data.current, 'desc')
      .get()
      .then((res) => {
        this.setData({
          listData: res.data
        });
      });
  },

  /**
   * 点击进入好友详情页
   */
  handleDetail (ev) {
    let id = ev.target.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?userId=' + id
    })
  },

  getBannerLis() {
    db.collection('banner').get().then(res => {
      this.setData({
        imgUrls: res.data
      })
    })
  }
})