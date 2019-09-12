const enums = require('./enums.js')

const deepCopy = (source) => {
  if (Array.isArray(source)) {
    return source.map(function (item) {
      return deepCopy(item);
    });
  } else if (typeof source === 'object') {
    var result = {};
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        result[key] = typeof source[key] === 'object' ? deepCopy(source[key]) : source[key];
      }
    }
    return result;
  } else {
    return source;
  }
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumbe).join('/') + ' ' + [hour, minute, second].map(formatNumbe).join(':')
}

const parseFormatStr = (str) => {
  var typ = 'f', pre = 2,
    indi = str ? str.indexOf('#') : -1;//remove extra indicators
  if (indi !== -1) {
    str = str.substr(0, indi);
  }
  if (str) {
    switch (str.charAt(str.length - 1)) {
      case 'f':
        typ = enums.measFormatType.NUMBER;
        break;
      case '%':
        typ = enums.measFormatType.PERCENT;
        break;
      case 'e':
        typ = enums.measFormatType.SCIENCE;
        break;
      case 'w':
        typ = enums.measFormatType.WAN;
        break;
      case 'y':
        typ = enums.measFormatType.YI;
        break;
      case 'z':
        typ = enums.measFormatType.ZI;
        break;
      default:
        break;
    }
    if (str.length >= 3) {
      var num = parseInt(str.slice(1, str.length - 1));
      if (!isNaN(num)) {
        pre = num;
      }
    }
  }
  return { type: typ, precision: pre };
}

const formatNumbe = (num, formatStr, addChinesePost) => {
  if (typeof num !== 'number') {
    if (typeof num === 'string') {
      return num;
    }
    return '';
  }
  if (isNaN(num)) {
    return '';
  }
  var formatObj = parseFormatStr(formatStr);
  if (formatObj.type === enums.measFormatType.SCIENCE) {
    return num.toExponential(formatObj.precision);
  }
  if (formatObj.type === enums.measFormatType.PERCENT) {
    num = num*100;
    return num.toFixed(formatObj.precision) + '%';
  }
  if (formatObj.type === enums.measFormatType.WAN) {
    num = num/10000;
    return num.toFixed(formatObj.precision) + (addChinesePost ? '万' : '');
  }
  if (formatObj.type === enums.measFormatType.YI) {
    num = num/100000000;
    return num.toFixed(formatObj.precision) + (addChinesePost ? '亿' : '');
  }
  if (formatObj.type === enums.measFormatType.ZI) {
    return num.toFixed(formatObj.precision) + (addChinesePost ? '只' : '');
  }
  return num.toFixed(formatObj.precision);
}

const getLinesEChartsDataCfgFromSheetData = (sheetData) => {
  var data = [], fmt, name = [], color, date, ids, id;
  if (!sheetData) {
    return;
  }
  //get from row (string type)
  var rows = sheetData.row, cols = sheetData.col, meas = sheetData.meas_data;
  ids = ['0.Date.0'];
  for (var i = 0; i < rows.length; i++) {
    id = rows[i].id;
    if (ids.indexOf(id) !== -1) {
      date = rows[i].data[1] || [];
    }
  }

  //get from col && meas (numbertype)
  ids = ['0.Return.0', '0.Index.0'];
  color = ['#ff0000', '#2e90e7'];
  for (i = 0; i < cols.length; i++) {
    id = cols[i].id;
    if (ids.indexOf(id) !== -1) {
      data.push(meas[i]);
      name.push(cols[i].name);
      fmt = cols[i].fmt;
    }
  }
  return { data: data, fmt: fmt, name: name, date: date, color: color };
}

const setEchartOption = (chartInstance, cfg) => {
  var option, i, j, lineData, zeroValue, dataZoomCfg,
    chartName,
    charColor,
    chartDate,
    chartData,
    chartFmt,
    lineCfg,
    start, end, startValue, endValue;
  if (!cfg) {
    return;
  }
  chartFmt = cfg.fmt || '.2%';
  chartName = cfg.name;
  charColor = cfg.color || ['#ff0000', '#2e90e7'];
  chartDate = cfg.date;
  start = cfg.start || 0;
  end = cfg.end || 1;
  chartData = cfg.data;

  start = Math.max(start, 0);
  end = Math.min(end, 1);
  if (start !== 0 || end !== 1) {// trim the data ,and zero base them
    chartData = [];
    for (i = 0; i < cfg.data.length; i++) {
      chartData.push([]);

      lineData = cfg.data[i];
      endValue = lineData.length;
      startValue = Math.ceil(start*endValue);
      zeroValue = lineData[startValue];
      for (j = startValue; j < endValue; j++) {
        chartData[i].push((lineData[j] + 1) / (zeroValue + 1) - 1);
      }
    }
    
    chartDate = [];
    for (j = startValue; j < endValue; j++) {
      chartDate.push(cfg.date[j]);
    }
  }

  option = {
    backgroundColor: 'white',
    animation: false,
    legend: {
      top: 20,
      show: true,
      data: chartName
    },
    tooltip: {
      trigger: 'axis',
      // confine: true,  
      formatter: function (params) {
        var formatterStr = '', i, data, value, len=params.length;
        for (i = 0; i < len; i++) {
          data = params[i];
          value = data.value;
          if (value === '-' || value === null || value === undefined) {// means no value, so do not need show value in tooltip
            continue;
          }
          formatterStr += (data.seriesName  + ':  ' + formatNumbe(value, chartFmt)+(i===len-1?'':'\n'));
        }
        return formatterStr;
      },
      position: function (point, params, dom, rect, size) {
        // update: jeff@20190409
        // 由于小程序的echart不支持formatter的回调函数功能。无奈又要修改tooltip。
        // 所以只能动态设置dom
        const axisValue = params[0].axisValue
        dom.style.text = `${axisValue}\n${dom.style.text}`

        const { contentSize } = size

        const [tooltipWidth] = contentSize
        const [pointWidth] = point

        let left = 0
        if (pointWidth - tooltipWidth > 5) {
          left = pointWidth - tooltipWidth - 5
        } else {
          left = pointWidth + 5
        }
        return {'left': left}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartDate,
      splitLine: {
        show: true
      }
    },
    yAxis: {
      scale: true,
      axisLabel: {
        inside: true,
        formatter: function (value) {
          return formatNumbe(value, '.0%');
        }
      }
    },
    grid: {
      bottom: 30
    },
    series: [],
    color: charColor
  };
  for (i = 0; i < chartName.length; i++) {
    lineCfg = { animation: false };
    lineCfg.name = chartName[i];
    lineCfg.type = 'line';
    lineCfg.data = chartData[i];
    lineCfg.smooth = false;
    lineCfg.showSymbol = false;
    lineCfg.lineStyle = { normal: { opacity: 1 } };
    option.series.push(lineCfg);
  }
  chartInstance.setOption(option);
}


module.exports = {
  formatTime: formatTime,
  formatNumbe: formatNumbe,
  getLinesEChartsDataCfgFromSheetData: getLinesEChartsDataCfgFromSheetData,
  setEchartOption: setEchartOption
}
