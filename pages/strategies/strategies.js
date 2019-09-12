const app = getApp();

const getCurrentStrategies = (sList, tag)=>{
  sList = sList || [];
  return sList.filter(item=>{
    let tags = item.tag || [];
    return tags.indexOf(tag) !== -1;
  });
};
const addStrategiesColor = (sList)=>{
  sList = sList || [];
  return sList.forEach(item=>{
    let real_return = item.real_return || 0, color;
    real_return = parseFloat(real_return);
    color = real_return > 0 ? 'red' : (real_return < 0 ? 'green':'');
    item.color = color;
  });
};


Page({

  /**
   * 页面的初始数据
   */
  data: {
    percent: 1,
    tags: [],
    currentTag: '全部',
    strategies: [],
    currentStrategies: []
  },
  bindTagTap: function (e) {
    let that=this, currentTag = e.currentTarget.dataset.tag;
    that.setData({currentTag: currentTag});
    that.setData({currentStrategies: (currentTag === '全部' ? that.data.strategies: getCurrentStrategies(that.data.strategies, currentTag))});
  },
  bindStrategyTap: function (e) {
    let id, name;
    id = e.currentTarget.dataset.id;
    name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../strategy/strategy?id='+id+'&name='+name
    })
  },
  autoIncreProgress: function(per){
    let percent = per || this.data.percent;
    if (percent>100) {
      return;
    }

    setTimeout(()=>{
      this.setData({ percent: percent + 5 });
      this.autoIncreProgress();
    }, 100);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.autoIncreProgress();
    wx.request({
      url: 'https://guorn.com/stock/mall?fmt=json&size=1000000&name_only=1&order=daily_return&asc=0',
      success: (res)=> {
        let data = res.data.data, strategies = data.strategy_list, tags = data.tag_list;
        let currentTag = this.data.currentTag;
        tags = ['全部'].concat(tags)
        addStrategiesColor(strategies);
        this.setData({ tags: tags });
        this.setData({ strategies: strategies });
        this.setData({ currentStrategies: (currentTag === '全部' ? strategies : getCurrentStrategies(strategies, currentTag))});
        this.autoIncreProgress(100);
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})