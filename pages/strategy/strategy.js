import * as echarts from '../../components/ec-canvas/echarts';
const util = require('../../utils/util.js');

const getStrategyInfo = (data, hedge)=>{
  var strategyDict = {}, hedgeIdx; 
  hedgeIdx = hedge ? 2 : 0
  strategyDict.dailyReturn = data.daily_return;
  for (let i = 0; i < data.sheet_data.col.length; i++) {
    if ('0.TotalReturn.0' === data.sheet_data.col[i].id) {
      strategyDict.totalReturn = util.formatNumbe(data.sheet_data.meas_data[i][hedgeIdx], '2%');
    }
    if ('0.AnnualReturn.0' === data.sheet_data.col[i].id) {
      strategyDict.annualReturn = util.formatNumbe(data.sheet_data.meas_data[i][hedgeIdx], '2%');
    }
    if ('0.SharpeRatio.0' === data.sheet_data.col[i].id) {
      strategyDict.sharpRatio = util.formatNumbe(data.sheet_data.meas_data[i][hedgeIdx], '.2f');
    }
    if ('0.Volatility.0' === data.sheet_data.col[i].id) {
      strategyDict.volatility = util.formatNumbe(data.sheet_data.meas_data[i][hedgeIdx], '2%');
    }
    if ('0.MaxDrawDown.0' === data.sheet_data.col[i].id) {
      strategyDict.maxDrawDown = util.formatNumbe(data.sheet_data.meas_data[i][hedgeIdx], '2%');
    }
  }
  return strategyDict;
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      // 将 lazyLoad 设为 true 后，需要手动初始化图表
      lazyLoad: true
    },
    id: null,
    name: '',
    desc: '',
    tags: [],
    realDays: 0,
    strategy_info: [],
    currentSubPage: 'desc',
    sub_pages: [{name:'策略描述',id:'desc'}, {name: '策略指令', id: 'instruction'}, {name: '策略咨询', id: 'comment'}],
    chartSel: 'all',
    chartSels: [{ name: '近一个月', id: 'month' }, { name: '近一年', id: 'year' }, { name: '全部', id: 'all' }],
    chartData: {}
  },
  bindSubPageTap: function (e) {
    let that = this, currentSubPage = e.currentTarget.dataset['subPage'];
    that.setData({ currentSubPage: currentSubPage });
  },
  bindChartSel: function (e) {
    let that = this, chartSel = e.currentTarget.dataset['id'], start=0, end=1;
    that.setData({ chartSel: chartSel });
    if (chartSel === 'month') {
      start = 1- 30/this.data.realDays;
    } else if (chartSel === 'year') {
      start = 1 - 365 / this.data.realDays
    }
    this.data.chartData.start = start;
    this.data.chartData.end = end;
    util.setEchartOption(this.chart, this.data.chartData);
  },
  initEchartData: function () {
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      util.setEchartOption(chart, this.data.chartData);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id;//, name = options.name;
    // wx.setNavigationBarTitle({
    //   title: '策略：'+name+', id：'+id,
    // })
    wx.request({
      url: 'https://guorn.com/stock/strategy?fmt=json&sid='+id,
      success: (res) => {
        let data = res.data.data, chartData, strategy_info = [], strategyDict, realDays;
    
        chartData = util.getLinesEChartsDataCfgFromSheetData(data.live_chart.sheet_data);
        this.setData({ chartData: chartData });
        this.initEchartData();

        strategyDict = getStrategyInfo(data.live_summary2, data.hedge);
        for (let i = 0; i < data.summary2.sheet_data.col.length; i++) {
          if ('0.RealDays.0' === data.summary2.sheet_data.col[i].id) {
            realDays = data.summary2.sheet_data.meas_data[i][0];
            break;
          }
        }
        strategy_info.push({ name: '当日收益', value: strategyDict.dailyReturn });
        strategy_info.push({ name: '年化收益', value: strategyDict.annualReturn });
        strategy_info.push({ name: '累计收益', value: strategyDict.totalReturn });
        strategy_info.push({ name: '最大回撤', value: strategyDict.maxDrawDown });
        strategy_info.push({ name: '夏普比率', value: strategyDict.sharpRatio });
        strategy_info.push({ name: '波动率', value: strategyDict.volatility });
      
        strategy_info.push({ name: '实盘天数', value: realDays });

        this.setData({ 
          id: data.id, 
          name: data.name,
          desc: data.desc, 
          tags: data.tag, 
          realDays: realDays,
          strategy_info: strategy_info
        });

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取组件
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
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