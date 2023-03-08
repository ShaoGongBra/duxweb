import moment from 'moment'
import React from 'react'
import Chart from 'react-apexcharts'
import {useThemeDark} from '../../utils'

window.Apex = {
  chart: {
    locales: [
      {
        name: 'zh-CN',
        options: {
          months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          shortMonths: [
            '一月',
            '二月',
            '三月',
            '四月',
            '五月',
            '六月',
            '七月',
            '八月',
            '九月',
            '十月',
            '十一月',
            '十二月'
          ],
          days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
          shortDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
          toolbar: {
            exportToSVG: '下载 SVG',
            exportToPNG: '下载 PNG',
            exportToCSV: '下载 CSV',
            menu: '菜单',
            selection: '选择',
            selectionZoom: '选择大小',
            zoomIn: '放大',
            zoomOut: '缩小',
            pan: '移动',
            reset: '重置'
          }
        }
      }
    ],
    fontFamily: 'inherit',
    defaultLocale: 'zh-CN',
    background: 'transparent'
  },
  theme: {
    mode: 'light',
    palette: 'palette1'
  },
  tooltip: {
    theme: 'light'
  }
}

export default class Charts {
  mode = '' // 模式
  way = 'custom' // 数据类型
  height = 200 // 高度
  width = '100%' // 宽度
  legend = {
    status: false,
    x: 'right',
    y: 'top'
  }
  date = {
    start: '',
    stop: '',
    format: '2006-01-02'
  }
  title = {
    text: '',
    align: 'left'
  }
  subTitle = {
    text: '',
    align: 'left'
  }
  zoom = false
  toolbar = false
  datatime = false
  mini = false
  data = []
  option = {
    legend: {}
  }
  labels = {}
  series = []

  theme = 'auto'

  constructor() {
  }

  /**
   * 设置宽度
   * @param {string} s
   * @returns {Charts}
   */
  setWidth(s) {
    this.width = s
    return this
  }

  /**
   * 设置高度
   * @param {string} s
   * @returns {Charts}
   */
  setHeight(s) {
    this.height = s
    return this
  }

  /**
   * 设置标题
   * @param {string} title
   * @param {string} align
   * @returns {Charts}
   */
  setTitle(title, align = 'left') {
    this.title.text = title
    this.title.align = align
    return this
  }

  /**
   * 设置子标题
   * @param {string} title
   * @param {string} align
   * @returns {Charts}
   */
  setSubTitle(title, align = 'left') {
    this.subTitle.text = title
    this.subTitle.align = align
    return this
  }

  /**
   * 放大缩小
   * @param {boolean} status
   * @returns {Charts}
   */
  setZoom(status) {
    this.zoom = status
    return this
  }

  /**
   * 工具状态
   * @param {boolean} status
   * @returns {Charts}
   */
  setToolbar(status) {
    this.toolbar = status
    return this
  }

  /**
   * 类型状态
   * @param {boolean} status
   * @param {string} x
   * @param {string} y
   * @returns {Charts}
   */
  setLegend(status, x, y) {
    this.legend = {
      status: status,
      x: x,
      y: y
    }
    return this
  }

  /**
   * 时间轴功能
   * @param {boolean} status
   * @returns {Charts}
   */
  setDataTime(status) {
    this.datatime = status
    return this
  }

  /**
   * 设置主题样式
   * @param {string} theme inverse dark light
   */
  setTheme(theme) {
    this.theme = theme
    return this
  }

  setMini(status) {
    this.mini = status
    return this
  }

  /**
   * 设置时间数据
   * @param {string} start 开始时间
   * @param {string} stop 结束时间
   * @param {string} format 时间格式
   * @param {string} way 分割单位
   * @returns {Charts}
   */
  setDate(start, stop, format, way = 'days') {
    this.date.start = start
    this.date.stop = stop
    let dateUnit = ['years', 'months', 'weeks', 'days', 'hours', 'minutes']
    if (dateUnit.includes(way)) {
      this.way = way
    } else {
      this.way = 'days'
    }
    if (format) {
      this.date.format = format
    }
    return this
  }

  /**
   * 设置数据
   * @param {string} name 数据名
   * @param {array} data 数据集
   * @param {string} format 数据格式
   * @returns {Charts}
   */
  setData(name, data, format = '') {
    this.data.push({
      name: name,
      data: data,
      format: format
    })
    return this
  }

  /**
   * 柱状图
   * @param {boolean} stacked
   * @constructor
   */
  column(stacked) {
    this.mode = 'bar'
    this.callback = function () {
      let xType = 'category'
      if (this.datatime) {
        xType = 'datetime'
      }
      this.option['plotOptions'] = {
        bar: {
          columnWidth: '50%'
        }
      }
      this.option['dataLabels'] = {
        enabled: false
      }
      this.option['fill'] = {
        opacity: 1
      }
      this.option['xaxis'] = {
        type: xType,
        categories: this.labels
      }
      if (stacked) {
        this.option['chat'].stacked = stacked
      }
    }
    return this
  }

  /**
   * 线形图
   */
  line() {
    this.mode = 'line'
    this.callback = function () {
      let xType = 'category'
      if (this.datatime) {
        xType = 'datetime'
      }
      this.option['dataLabels'] = {
        enabled: false
      }
      this.option['fill'] = {
        opacity: 1
      }
      this.option['xaxis'] = {
        type: xType,
        categories: this.labels
      }
      this.option['stroke'] = {
        curve: 'straight'
      }
    }
    return this
  }

  /**
   * 区域图
   */
  area() {
    this.mode = 'area'
    this.callback = function () {
      let xType = 'category'
      if (this.datatime) {
        xType = 'datetime'
      }
      this.option['dataLabels'] = {
        enabled: false
      }
      this.option['xaxis'] = {
        type: xType,
        categories: this.labels
      }
      this.option['stroke'] = {
        curve: 'smooth'
      }
    }
    return this
  }

  /**
   * 环形图
   */
  ring() {
    this.mode = 'donut'
    this.callback = function () {
      if (this.series?.[0]?.data) {
        this.series = this.series[0].data
      }
      this.option.legend.position = 'right'
      this.option.legend.horizontalAlign = 'right'
      this.option.legend.markers = {
        offsetY: 1.5
      }
      this.option.plotOptions = {
        pie: {
          customScale: 1,
          offsetY: 0
        }
      }
      this.option.labels = this.labels
    }
    return this
  }

  /**
   * 百分比图
   */
  radial() {
    this.mode = 'radialBar'
    this.callback = function () {
      if (this.series?.[0]?.data) {
        this.series = this.series[0].data
      }
      this.option.legend.position = 'right'
      this.option.legend.horizontalAlign = 'right'
      this.option.legend.markers = {
        offsetY: 1.5
      }
      this.option.plotOptions = {
        radialBar: {
          hollow: {
            size: '55%'
          },
          dataLabels: {
            name: {
              fontSize: '14px',
              color: 'var(--td-gray-color-6)',
              fontWeight: 'none',
              show: true,
              offsetY: 30
            },
            value: {
              fontSize: '1.7rem',
              show: true,
              offsetY: -15
            }
          }
        }
      }
    }
    return this
  }

  /**
   * 渲染数据
   */
  render() {
    if (this.series?.length == 0) {
      this.formatData()
    }
    let chart = {
      foreColor: 'var(--td-font-gray-3)',
      background: 'rgba(0, 0, 0, 0)'
    }

    if (this.toolbar) {
      chart.toolbar = {
        show: true,
        autoSelected: true
      }
    } else {
      chart.toolbar = {
        show: false
      }
    }
    if (this.zoom) {
      chart.zoom = {
        enabled: true,
        type: 'x',
        autoScaleYaxis: false
      }
    } else {
      chart.zoom = {
        enabled: false
      }
    }

    this.option.chart = chart

    this.option.tooltip = {
      theme: 'light'
    }
    this.option.theme = {
      mode: 'light',
      palette: 'palette1'
    }

    this.option.xaxis = {
      categories: this.labels
    }
    this.option.grid = {
      strokeDashArray: 4
    }
    if (this.title.text) {
      this.option.title = {
        text: this.title.text,
        align: this.title.align,
        style: {
          fontSize: '16px',
          fontWeight: 'normal'
        }
      }
    }
    if (this.subTitle.text) {
      this.option.subTitle = {
        text: this.title.text,
        align: this.title.align,
        style: {
          fontSize: '16px',
          fontWeight: 'normal'
        }
      }
    }
    if (this.legend.status) {
      this.option.legend = {
        show: true,
        position: this.legend.y,
        horizontalAlign: this.legend.x,
        floating: true,
        offsetY: 0,
        offsetX: -5
      }
    } else {
      this.option.legend = {
        show: false
      }
    }

    if (this.theme === 'light') {
      this.option.chart.foreColor = 'var(--td-font-gray-1)'
      this.option.tooltip.theme = 'light'
      this.option.theme.mode = 'light'
    }

    if (this.theme === 'dark') {
      this.option.chart.foreColor = 'var(--td-font-white-1)'
      this.option.tooltip.theme = 'dark'
      this.option.theme.mode = 'dark'
    }

    if (this.theme === 'inverse') {
      this.option.chart.foreColor = 'var(--td-font-white-1)'
      this.option.tooltip.theme = 'inverse'
      this.option.theme.mode = 'inverse'
      this.option.theme.monochrome = {
        enabled: true,
        color: '#ffffff',
        shadeTo: 'light',
        shadeIntensity: 0.65
      }
      this.option.grid.borderColor = 'rgba(255,255,255, .3)'
    }

    if (this.mini) {
      this.option.chart.sparkline = {
        enabled: true
      }
      this.option.tooltip.x = {
        show: false
      }
      this.option.grid.padding = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
      this.option.stroke = {
        width: 2
      }
    }

    this.callback && this.callback()

    return <Chart options={this.option} series={this.series} type={this.mode} height={this.height} width={this.width}/>
  }

  /**
   * 格式化数据
   */
  formatData() {
    // 处理标签
    let labels = []
    if (this.way !== 'custom') {
      // YYYY
      // YYYY-MM
      //YYYY-MM-DD
      // HH
      // HH:mm
      let start = moment(this.date.start, this.date.format)
      let stop = moment(this.date.stop, this.date.format)
      let diff = stop.diff(start, this.way)

      for (let i = 0; i <= diff; i++) {
        labels.push(moment(this.date.start, this.date.format).add(i, this.way).format(this.date.format))
      }
    } else {
      this.data.forEach(datum => {
        datum.data.forEach(item => {
          if (!labels.includes(item.label)) {
            labels.push(item.label)
          }
        })
      })
    }
    this.labels = labels

    // 处理数据
    this.data.forEach(datum => {
      let group = {}
      datum.data.forEach(item => {
        if (this.way === 'custom') {
          if (group[item.label] === undefined) {
            group[item.label] = 0
          }
          group[item.label] += +item.value
        } else {
          let label = moment(item.label, datum.format).format(this.date.format)
          if (group[label] === undefined) {
            group[label] = 0
          }
          group[label] += +item.value
        }
      })
      let data = []
      labels.forEach(label => {
        data.push(group[label] || 0)
      })
      this.series.push({
        name: datum.name,
        data: data
      })
    })
    return this
  }

  /**
   * 获取数据
   * @param {int} key
   * @returns
   */
  getSeriesData(key) {
    return this.series[key]?.data
  }
}

export const useCharts = (theme = 'default') => {
  const [dark] = useThemeDark()
  return new Charts().setTheme(theme !== 'default' ? 'inverse' : dark ? 'dark' : 'light')
  return chart
}
